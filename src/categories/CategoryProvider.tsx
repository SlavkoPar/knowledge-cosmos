import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IFromUserAssignedAnswer,
  ICategoryDto, ICategoryDtoEx, ICategoryDtoListEx, ICategoryKey, ICategoryKeyExtended, ICategoryKeyExpanded,
  CategoryKey, Category, CategoryDto,
  IQuestionDto, IQuestionDtoEx, IQuestionEx, IQuestionRowDto, IQuestionKey, IQuestionRow,
  Question, QuestionDto, QuestionRow,
  QuestionRowDto,
  IParentInfo
} from 'categories/types';

import { initialCategoriesState, CategoriesReducer } from 'categories/CategoriesReducer';
import { IWhoWhen, ICat, Dto2WhoWhen, WhoWhen2Dto } from 'global/types';
import { IAnswer, IAnswerKey, IGroup } from 'groups/types';
import { IAssignedAnswer, IAssignedAnswerDto, IAssignedAnswerDtoEx, AssignedAnswer, AssignedAnswerDto } from 'categories/types';
import { protectedResources } from 'authConfig';

const CategoriesContext = createContext<ICategoriesContext>({} as any);
const CategoryDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const CategoryProvider: React.FC<Props> = ({ children }) => {

  const { loadCats } = useGlobalContext()
  const globalState = useGlobalState();
  const { dbp, cats } = globalState;

  const [state, dispatch] = useReducer(CategoriesReducer, initialCategoriesState);
  const { categoryNodesUpTheTree } = state;
  console.log('----->>> CategoryProvider', { initialCategoriesState, categoryNodesUpTheTree })


  const Execute = async (
    method: string,
    endpoint: string,
    data: Object | null = null,
    whichRowId: string | undefined = undefined
  ): Promise<any> => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        console.log("------------&&&&&&&&&&&&&&&------Execute endpoint:", endpoint)
        let response = null;

        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;
        headers.append("Authorization", bearer);

        if (data) headers.append('Content-Type', 'application/json');

        let options = {
          method: method,
          headers: headers,
          body: data ? JSON.stringify(data) : null,
        };

        response = (await fetch(endpoint, options));
        if (response.ok) {
          if ((response.status === 200 || response.status === 201)) {
            let responseData = null; //response;
            try {
              responseData = await response.json();
            }
            catch (error) {
              dispatch({
                type: ActionTypes.SET_ERROR, payload: {
                  error: new Error(`Response status: ${response.status}`),
                  whichRowId
                }
              });
            }
            finally {
              return responseData;
            }
          }
        }
        else {
          const { errors } = await response.json();
          const error = new Error(
            errors?.map((e: { message: any; }) => e.message).join('\n') ?? 'unknown',
          )
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error, whichRowId } });
        }
      }
      catch (e) {
        console.log('-------------->>> execute', method, endpoint, e)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`fetch eror`), whichRowId } });
      }
    }
    return null;
  }
  // }, [dispatch]);

  const reloadCategoryNode = useCallback(
    async (categoryKeyExpanded: ICategoryKeyExpanded, fromChatBotDlg: string = 'false'): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          console.log('---CategoryProvider.reloadCategoryNode categoryKeyExpanded:', categoryKeyExpanded)
          let { id, partitionKey } = categoryKeyExpanded;
          if (id) {
            const cat: ICat | undefined = cats.get(id);
            console.log("rrrrrrrrrrrrrrrrrreloadCategoryNode", id, cat)
            if (cat) {
              categoryKeyExpanded.partitionKey = cat.partitionKey;
              partitionKey = cat.partitionKey;
            }
            else {
              alert('reload cats' + id)
              //return
            }
          }
          //dispatch({ type: ActionTypes.CATEGORY_NODE_LOADING, payload: { loading: true } })
          //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: null/*new CategoryKey(parentCat).categoryKey*/ } });
          // ---------------------------------------------------------------------------
          console.time();

          //const query = categoryKey ? `${categoryKey.partitionKey}/${categoryKey.id}` : 'null/null';
          //const query = `${partitionKey}/${id}`;
          const url = `${protectedResources.KnowledgeAPI.endpointCat}/${partitionKey}/${id}`;
          console.log('calling CatController.GetCatsUpTheTree', url)
          await Execute("GET", url)
            .then((categoryDtoListEx: ICategoryDtoListEx) => {
              //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: categoryKey! } });
              const { categoryDtoList, msg } = categoryDtoListEx;
              console.timeEnd();
              const categoryNodesUpTheTree = categoryDtoList.map((categoryDto: ICategoryDto) => {
                const { PartitionKey, Id, Title } = categoryDto;
                return { partitionKey: PartitionKey, id: Id, title: Title } as ICategoryKeyExtended
              })
              dispatch({
                type: ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE, payload: {
                  categoryKeyExpanded,
                  categoryNodesUpTheTree,
                  fromChatBotDlg: fromChatBotDlg === 'true'
                }
              })
              resolve(true)
            });
        }
        catch (error: any) {
          console.log(error)
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        }
      })
    }, [dispatch]);


  const getSubCategories = useCallback(async (categoryKey: ICategoryKey) => {
    return new Promise(async (resolve) => {
      const { partitionKey, id } = categoryKey;
      try {
        dispatch({ type: ActionTypes.SET_LOADING });
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${id}`;
        console.log('CategoryProvider getSubCategories url:', url)
        console.time();
        await Execute("GET", url).then((categoryDtos: ICategoryDto[]) => {
          console.timeEnd();
          const subCategories = categoryDtos!.map((categoryDto: ICategoryDto) => new Category(categoryDto).category);
          dispatch({ type: ActionTypes.SET_SUB_CATEGORIES, payload: { subCategories } });
          resolve(true);
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, [dispatch]);


  const createCategory = useCallback(
    async (category: ICategory) => {
      const { partitionKey, id, variations, title, kind, modified } = category;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;
        console.log("categoryDto", { categoryDto })
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}`;
        console.time()
        await Execute("POST", url, categoryDto, id)
          .then(async (categoryDtoEx: ICategoryDtoEx | null) => {
            console.timeEnd();
            if (categoryDtoEx) {
              const { categoryDto } = categoryDtoEx;
              if (categoryDto) {
                const category = new Category(categoryDto).category;
                console.log('Category successfully created')
                dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questionRows: [] } } });
                dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
                await loadCats(); // reload
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const getCategory = async (categoryKey: ICategoryKey, includeQuestionId: string): Promise<any> => {
    const { partitionKey, id } = categoryKey;
    console.log({ categoryKey, includeQuestionId })
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${id}/${PAGE_SIZE}/${includeQuestionId}`;
        console.time()
        await Execute("GET", url)
          .then((categoryDtoEx: ICategoryDtoEx) => {
            console.timeEnd();
            const { categoryDto, msg } = categoryDtoEx;
            if (categoryDto) {
              resolve(new Category(categoryDto).category);
            }
            else {
              resolve(new Error(msg));
            }
          });
      }
      catch (error: any) {
        console.log(error)
        resolve(error);
      }
    })
  }

  const expandCategory = useCallback(
    async (categoryKey: ICategoryKey, includeQuestionId: string) => {
      try {
        const category: ICategory | Error = await getCategory(categoryKey, includeQuestionId); // to reload Category
        // .then(async (category: ICategory) => {
        console.log('getCategory', { category })
        if (category instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
          console.error({ category })
        }
        else {
          console.log('vratio getCategory', category)
          category.isExpanded = true;
          //dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category } });
          dispatch({ type: ActionTypes.SET_EXPANDED, payload: { categoryKey } });
          return category;
        }
        //})
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const collapseCategory = useCallback(
    async (categoryKey: ICategoryKey) => {
      try {
        //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey } });// clean subTree
        dispatch({ type: ActionTypes.SET_COLLAPSED, payload: { categoryKey } });
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const viewCategory = useCallback(async (categoryKey: ICategoryKey, includeQuestionId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const category = await getCategory(categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else
      dispatch({ type: ActionTypes.VIEW_CATEGORY, payload: { category } });
  }, [dispatch]);


  const editCategory = useCallback(async (categoryKey: ICategoryKey, includeQuestionId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const category = await getCategory(categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else
      dispatch({ type: ActionTypes.EDIT_CATEGORY, payload: { category } });
  }, [dispatch]);


  const updateCategory = useCallback(
    async (category: ICategory, closeForm: boolean) => {
      const { partitionKey, id, variations, title, kind, modified } = category;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;

        const url = `${protectedResources.KnowledgeAPI.endpointCategory}`;
        console.time()
        await Execute("PUT", url, categoryDto)
          .then((response: ICategoryDtoEx | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
            }
            else {
              const { categoryDto, msg } = response as ICategoryDtoEx;
              if (categoryDto) {
                const category = new Category(categoryDto).category;
                const { id, partitionKey } = category;
                dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: { partitionKey, id } } });
                dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category } });
                if (closeForm) {
                  dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
                }
              }
              else {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`Category ${id} not found!`) } });
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        return error;
      }
    }, [dispatch]);


  const deleteCategory = useCallback(async (category: ICategory) => {
    //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      const categoryDto = new CategoryDto(category).categoryDto;
      //questionDto.Archived = new WhoWhen2Dto(question.archived!).whoWhenDto!;
      const url = `${protectedResources.KnowledgeAPI.endpointCategory}` ///${categoryKey.partitionKey}/${categoryKey.id}`;
      console.time()
      await Execute("DELETE", url, categoryDto)    //Modified: {  Time: new Date(), NickName: globalState.authUser.nickName }
        .then(async (response: ICategoryDtoEx | Response) => {
          console.timeEnd();
          if (response instanceof Response) {
            console.error({ response });
            if (response.status == 404) {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Category Not Found'), whichRowId: category.id } });
            }
          }
          else {
            const { categoryDto, msg } = response as ICategoryDtoEx;
            if (msg == "OK") {
              dispatch({ type: ActionTypes.DELETE, payload: { id: categoryDto!.Id } });
              await loadCats(); // reload
            }
            else if (msg === "HasSubCategories") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove sub categories"), whichRowId: categoryDto!.Id } });
            }
            else if (msg === "NumOfQuestions") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove category questions"), whichRowId: categoryDto!.Id } });
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg), whichRowId: categoryDto!.Id } });
            }
          }
        })
    }
    catch (error: any) {
      console.log(error)
      return error;
    }
  }, [dispatch]);


  const deleteCategoryVariation = async (categoryKey: ICategoryKey, variationName: string) => {
    try {
      // const category = await dbp!.get('Categories', id);
      // const obj: ICategory = {
      //   ...category,
      //   variations: category.variations.filter((variation: string) => variation !== variationName),
      //   modified: {
      //     Time: new Date(),
      //     by: {
      //       nickName: globalState.authUser.nickName
      //     }
      //   }
      // }
      // POPRAVI TODO
      //updateCategory(obj, false);
      console.log("Category Tag successfully deleted");
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };


  ////////////////////////////////////
  // Questions
  //

  const PAGE_SIZE = 12;
  const loadCategoryQuestions = useCallback(
    async ({ categoryKey, startCursor, includeQuestionId }: IParentInfo)
      : Promise<any> => {
      const questionRowDtos: IQuestionRowDto[] = [];
      try {
        const { partitionKey, id } = categoryKey;
        dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS_LOADING, payload: { questionLoading: true } })
        try {
          const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${partitionKey}/${id}/${startCursor}/${PAGE_SIZE}/${includeQuestionId}`;
          console.time()
          console.log('>>>>>>>>>>>>')
          console.log('>>>>>>>>>>>>loadCategoryQuestions URL:', { url }, { includeQuestionId })
          console.log('>>>>>>>>>>>>')
          await Execute!("GET", url).then((categoryDtoEx: ICategoryDtoEx) => {
            console.timeEnd();
            const { categoryDto, msg } = categoryDtoEx;
            console.log('>>>>>>>>>>>>loadCategoryQuestions categoryDto:', { categoryDto })
            if (categoryDto !== null) {
              const { Title, QuestionRowDtos, HasMoreQuestions } = categoryDto;
              QuestionRowDtos!.forEach((questionRowDto: IQuestionRowDto) => {
                if (includeQuestionId && questionRowDto.Id === includeQuestionId) {
                  questionRowDto.Included = true;
                }
                questionRowDto.CategoryTitle = Title; // TODO treba li
                questionRowDtos.push(questionRowDto);
              })
              const questionRows: IQuestionRow[] = questionRowDtos.map(dto => new QuestionRow(dto).questionRow);
              dispatch({
                type: ActionTypes.LOAD_CATEGORY_QUESTIONS,
                payload: { id, questionRows, hasMoreQuestions: HasMoreQuestions! }
              });
            }
          });
        }
        catch (error: any) {
          console.log(error)
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
        }
      }
      catch (error: any) {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      }
    }, [dispatch]);


  const createQuestion = useCallback(
    async (question: IQuestion) => {
      const { partitionKey, id, title, modified, parentCategory } = question;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory!, loading: false } });
      try {
        const questionDto = new QuestionDto(question).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createQuestion', questionDto)
        await Execute("POST", url, questionDto)
          .then(async (questionDtoEx: IQuestionDtoEx | null) => {
            console.timeEnd();
            if (questionDtoEx) {
              console.log("::::::::::::::::::::", { questionDtoEx });
              const { questionDto } = questionDtoEx;
              if (questionDto) {
                const question = new Question(questionDto).question;
                console.log('Question successfully created')
                dispatch({ type: ActionTypes.SET_QUESTION, payload: { question } });
                //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
                await loadCats(); // reload
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const updateQuestion = useCallback(
    async (question: IQuestion, categoryChanged: boolean) => {
      const { partitionKey, id, title, modified, parentCategory } = question;
      // dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory!, loading: false } });
      try {
        const questionDto = new QuestionDto(question).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> updateQuestion', questionDto)
        let questionRet = null;
        await Execute("PUT", url, questionDto)
          .then(async (questionDtoEx: IQuestionDtoEx) => {
            console.timeEnd();
            const { questionDto, msg } = questionDtoEx;
            if (questionDto) {
              questionRet = new Question(questionDto).question;
              console.log('Question successfully updated: ', questionRet)
              const { partitionKey, parentCategory} = questionRet;
              if (categoryChanged) {
                const catKeyExpanded: ICategoryKeyExpanded = {
                  partitionKey,
                  id: parentCategory,
                  questionId: null // TODO zadrzi isti
                }
                dispatch({ type: ActionTypes.CATEGORY_NODE_RE_LOADING });
                dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: null } });
                await reloadCategoryNode(catKeyExpanded)
              }
              else {
                dispatch({ type: ActionTypes.SET_QUESTION, payload: { question } });
              }
              //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
              // await loadCats(); // reload
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
            }
          });
        return questionRet;
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const deleteQuestion = useCallback(
    async (questionRow: IQuestionRow) => {
      const { partitionKey, id, title, modified, parentCategory } = questionRow;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory!, loading: false } });
      try {
        const questionDto = new QuestionRowDto(questionRow).questionRowDto;
        //questionDto.Archived = new WhoWhen2Dto(question.archived!).whoWhenDto!;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
        console.time()
        await Execute("DELETE", url, questionDto)
          .then(async (response: IQuestionDtoEx | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
            else {
              const questionDtoEx: IQuestionDtoEx = response;
              const { questionDto, msg } = questionDtoEx;
              if (questionDto) {
                const question = new Question(questionDto).question;
                console.log('Question successfully deleted')
                dispatch({ type: ActionTypes.DELETE_QUESTION, payload: { question } });
                //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
                await loadCats(); // reload
              }
              else {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);

  const getQuestion = async (questionKey: IQuestionKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { partitionKey, id } = questionKey;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${partitionKey}/${id}`;
        console.time()
        await Execute("GET", url)
          .then((questionDtoEx: IQuestionDtoEx) => {
            console.timeEnd();
            const { questionDto, msg } = questionDtoEx;
            if (questionDto) {
              const questionEx: IQuestionEx = {
                question: new Question(questionDto).question,
                msg
              }
              resolve(questionEx);
            }
            else {
              const questionEx: IQuestionEx = {
                question: null,
                msg
              }
              resolve(questionEx);
            }
            //}
          });
      }
      catch (error: any) {
        console.log(error);
        const questionEx: IQuestionEx = {
          question: null,
          msg: "Problemos"
        }
        resolve(questionEx);
      }
    })
  }

  const viewQuestion = useCallback(async (questionKey: IQuestionKey) => {
    const questionEx: IQuestionEx = await getQuestion(questionKey);
    const { question, msg } = questionEx;
    if (question)
      dispatch({ type: ActionTypes.VIEW_QUESTION, payload: { question } });
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);

  const editQuestion = useCallback(async (questionKey: IQuestionKey) => {
    //dispatch({ type: ActionTypes.SET_VIEWING_EDITING_QUESTION });
    const questionEx: IQuestionEx = await getQuestion(questionKey);
    const { question, msg } = questionEx;
    if (question)
      dispatch({ type: ActionTypes.EDIT_QUESTION, payload: { question } });
    else
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
  }, []);


  const assignQuestionAnswer = useCallback(async (action: string, questionKey: IQuestionKey, answerKey: IAnswerKey, assigned: IWhoWhen): Promise<any> => {
    try {
      const assignedAnwser: IAssignedAnswer = {
        questionKey,
        answerKey,
        answerTitle: '',
        answerLink: '',
        created: {
          time: new Date(),
          nickName: assigned.nickName
        },
        modified: null
      }
      let question: IQuestion | null = null;
      const dto = new AssignedAnswerDto(assignedAnwser).assignedAnswerDto;
      const url = `${protectedResources.KnowledgeAPI.endpointQuestionAnswer}/${action}`;
      console.time()
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> AssignAnswer', dto)
      await Execute("POST", url, dto)
        .then(async (questionDtoEx: IQuestionDtoEx) => {
          console.timeEnd();
          const { questionDto, msg } = questionDtoEx;
          console.log("::::::::::::::::::::", { questionDtoEx });
          if (questionDto) {
            question = new Question(questionDto).question;
            console.log('Question successfully modified')
            //dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: assignedAnswer } });
            //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
          }
        });
      if (question) {
        dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question } });
      }
      /*
      const assignedAnswers = [...question.assignedAnswers, newAssignedAnwser];
      const obj: IQuestion = {
        ...question,
        assignedAnswers,
        numOfAssignedAnswers: assignedAnswers.length
      }
      await dbp!.put('Questions', obj, questionId);
      console.log("Question Answer successfully assigned", obj);
      */
      ///////////////////
      // newAssignedAnwser.answer.title = answer.title;
      // obj.assignedAnswers = [...question.assignedAnswers, newAssignedAnwser];;
      // dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: obj } });
      //dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question: { ...obj } } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);



  const contextValue: ICategoriesContext = {
    state, reloadCategoryNode,
    getSubCategories, createCategory, viewCategory, editCategory, updateCategory, deleteCategory, deleteCategoryVariation,
    expandCategory, collapseCategory,
    loadCategoryQuestions, createQuestion, viewQuestion, editQuestion, updateQuestion, deleteQuestion,
    assignQuestionAnswer
  }
  return (
    <CategoriesContext.Provider value={contextValue}>
      <CategoryDispatchContext.Provider value={dispatch}>
        {children}
      </CategoryDispatchContext.Provider>
    </CategoriesContext.Provider>
  );
}

export function useCategoryContext() {
  return useContext(CategoriesContext);
}

export const useCategoryDispatch = () => {
  return useContext(CategoryDispatchContext)
};

