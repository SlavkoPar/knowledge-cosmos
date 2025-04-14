import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IParentInfo, IFromUserAssignedAnswer,
  IAssignedAnswer, ICategoryDto,
  IQuestionDto, IQuestionDtoEx,
  Category,
  Question,
  IQuestionKey,
  ICategoryKey,
  ICategoryKeyExtended,
  CategoryDto,
  QuestionDto,
} from 'categories/types';

import { initialCategoriesState, CategoriesReducer } from 'categories/CategoriesReducer';
import { IWhoWhen, ICat, Dto2WhoWhen, WhoWhen2Dto } from 'global/types';
import { IAnswer, IGroup } from 'groups/types';
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

  const execute = async (method: string, endpoint: string, data: Object | null = null): Promise<any> => {

    // if (msalError) {
    //     console.log(msalError)
    //     setError(msalError);
    //     return null;
    // }

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        // console.log({accessToken})
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

        //setIsLoading(true);
        response = (await fetch(endpoint, options));

        if ((response.status === 200 || response.status === 201)) {
          let responseData = response;

          try {
            responseData = await response.json();
          }
          catch (error) {
            console.log(error);
          }
          finally {
            // setData(responseData);
            // setIsLoading(false);
            // console.log({responseData})
            return responseData;
          }
        }

        //setIsLoading(false);
        return response;
      }
      catch (e) {
        console.log('-------------->>> execute', method, endpoint, e)
        //setError(e as AuthError);
        //setIsLoading(false);
        throw e;
      }
    }
  };

  const reloadCategoryNode = useCallback(
    async (execute: (method: string, endpoint: string) => Promise<any>,
      categoryKey: ICategoryKey | null,
      questionId: string | null): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          console.log('CategoryProvider.reloadCategoryNode')
          const { id } = categoryKey!;
          const cat: ICat | undefined = cats.get(id);
          if (!cat) {
            alert('reload cats' + id)
            return
          }
          // dispatch({ type: ActionTypes.SET_LOADING })
          console.time()
          const url = `${protectedResources.KnowledgeAPI.endpointCat}/${cat.partitionKey}/${id}`;
          console.log('calling CatController.GetCatsUpTheTree', url)
          await execute("GET", url)
            .then((response: ICategoryDto[]) => {
              console.timeEnd();
              // console.log({ response });
              if (response instanceof Response) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('fetch Response') } });
              }
              const data: ICategoryDto[] = response;
              const categoryNodesUpTheTree = data.map((categoryDto: ICategoryDto) => {
                const { PartitionKey, Id, Title } = categoryDto;
                return { partitionKey: PartitionKey, id: Id, title: Title } as ICategoryKeyExtended
              })
              dispatch({
                type: ActionTypes.RELOAD_CATEGORY_NODE, payload: {
                  categoryId: id,
                  questionId,
                  categoryNodesUpTheTree
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


  const getSubCategories = useCallback(async (
    execute: (method: string, endpoint: string) => Promise<any>,
    categoryKey: ICategoryKey) => {
    return new Promise(async (resolve) => {
      const { partitionKey, id } = categoryKey;
      try {
        dispatch({ type: ActionTypes.SET_LOADING });
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${id}`;
        console.log('calling getSubCategories:', url)
        console.time();
        await execute("GET", url).then((response: ICategoryDto[]) => {
          console.timeEnd();
          if (response instanceof Response) {
            console.log('response instanceof Response', { response });
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('fetch Response') } });
            resolve(false);
          }
          const data: ICategoryDto[] = response;
          const subCategories = data!.map((categoryDto: ICategoryDto) => new Category(categoryDto).category);
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
    async (execute: (method: string, endpoint: string, data: Object | null) => Promise<any>,
      category: ICategory) => {
      const { partitionKey, id, variations, title, kind, modified } = category;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;
        categoryDto.Created = new WhoWhen2Dto(category.created!).whoWhenDto!;
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}`;
        console.time()
        await execute("POST", url, categoryDto)
          .then(async (response: ICategoryDto | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
            else {
              const categoryDto: ICategoryDto = response;
              if (categoryDto) {
                const category = new Category(categoryDto).category;
                console.log('Category successfully created')
                dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
                dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
                await loadCats(execute); // reload
              }
              else {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`Category ${id} not found!`) } });
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const getCategory = async (
    execute: (method: string, endpoint: string) => Promise<any>,
    categoryKey: ICategoryKey,
    includeQuestionId: string): Promise<any> => {
    const { partitionKey, id } = categoryKey;
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${id}/${PAGE_SIZE}/${includeQuestionId}`;
        console.time()
        await execute("GET", url)
          .then((response: ICategoryDto | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              resolve(new Error('fetch response error'));
            }
            else {
              const categoryDto: ICategoryDto = response;
              if (categoryDto) {
                resolve(new Category(categoryDto).category);
              }
              else {
                resolve(new Error(`Category ${id} not found!`));
              }
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
    async (execute: (method: string, endpoint: string) => Promise<any>, categoryKey: ICategoryKey, includeQuestionId: string) => {
      try {
        const category: ICategory | Error = await getCategory(execute, categoryKey, includeQuestionId); // to reload Category
        // .then(async (category: ICategory) => {
        // console.log('getCategory', { category })
        if (category instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
        }
        else {
          console.log('vratio getCategory', category)
          category.isExpanded = true;
          //dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category } });
          dispatch({ type: ActionTypes.SET_EXPANDED, payload: { categoryKey } });
          //await getSubCategories(execute, categoryKey);
          /*
          if (numOfQuestions > 0) { // && questions.length === 0) {
            const parentInfo: IParentInfo = {
              execute,
              partitionKey,
              parentCategory: id,
              startCursor: 0,
              includeQuestionId: null //questionId ?? null
            }
            await loadCategoryQuestions(parentInfo);
          }
            */
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
    async (execute: (method: string, endpoint: string) => Promise<any>, categoryKey: ICategoryKey) => {
      try {
        //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey } });// clean subTree
        dispatch({ type: ActionTypes.SET_COLLAPSED, payload: { categoryKey } });
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const viewCategory = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, categoryKey: ICategoryKey, includeQuestionId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const category = await getCategory(execute, categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else
      dispatch({ type: ActionTypes.VIEW_CATEGORY, payload: { category } });
  }, [dispatch]);


  const editCategory = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, categoryKey: ICategoryKey, includeQuestionId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const category = await getCategory(execute, categoryKey, includeQuestionId);
    if (category instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
    else
      dispatch({ type: ActionTypes.EDIT_CATEGORY, payload: { category } });
  }, [dispatch]);


  const updateCategory = useCallback(
    async (execute: (method: string, endpoint: string, data: Object | null) => Promise<any>,
      category: ICategory, closeForm: boolean) => {
      const { partitionKey, id, variations, title, kind, modified } = category;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const categoryDto = new CategoryDto(category).categoryDto;

        const url = `${protectedResources.KnowledgeAPI.endpointCategory}`;
        console.time()
        await execute("PUT", url, categoryDto)
          .then((response: ICategoryDto | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
            }
            else {
              const categoryDto: ICategoryDto = response;
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


  const deleteCategory = useCallback(async (
    execute: (method: string, endpoint: string, data: Object | null) => Promise<any>,
    //execute: (method: string, endpoint: string) => Promise<any>,
    categoryKey: ICategoryKey) => {
    //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      const url = `${protectedResources.KnowledgeAPI.endpointCategory}` ///${categoryKey.partitionKey}/${categoryKey.id}`;
      console.time()
      await execute("DELETE", url, { PartitionKey: categoryKey.partitionKey, Id: categoryKey.id })
        .then(async (response: any | Response) => {
          console.timeEnd();
          if (response instanceof Response) {
            console.error({ response });
            if (response.status == 404) {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Category Not Found'), whichRowId: categoryKey.id } });
            }
          }
          else {
            const resp: { msg: string } = response;
            if (response.msg == "OK") {
              dispatch({ type: ActionTypes.DELETE, payload: { id: categoryKey.id } });
              await loadCats(execute); // reload
            }
            else if (resp.msg === "HasSubCategories") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove sub categories"), whichRowId: categoryKey.id } });
            }
            else if (resp.msg === "NumOfQuestions") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove category questions"), whichRowId: categoryKey.id } });
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(response), whichRowId: categoryKey.id } });
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
    async ({ execute, categoryKey, startCursor, includeQuestionId }: IParentInfo)
      : Promise<any> => {
      const questions: IQuestion[] = [];
      try {
        const parentCategory = categoryKey.id;
        dispatch({ type: ActionTypes.SET_CATEGORY_QUESTIONS_LOADING, payload: { questionLoading: true } })
        try {
          const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${parentCategory}/${startCursor}/${PAGE_SIZE}/${includeQuestionId}`;
          console.time()
          console.log('>>>>>>>>>>>>loadCategoryQuestions of:', { url })
          await execute!("GET", url).then((response: ICategoryDto | Response) => {
            console.timeEnd();
            console.log({ response });
            if (response instanceof Response) {
              throw (response);
            }
            const categoryDto: ICategoryDto = response;
            const { Questions, HasMoreQuestions } = categoryDto;
            Questions!.forEach((questionDto: IQuestionDto) => {
              const question = new Question(questionDto).question;
              if (includeQuestionId && question.id === includeQuestionId) {
                question.included = true;
              }
              question.categoryTitle = 'nadji me';
              questions.push(question);
            })
            dispatch({
              type: ActionTypes.LOAD_CATEGORY_QUESTIONS,
              payload: { parentCategory, questions, hasMoreQuestions: HasMoreQuestions! }
            });
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
      return true;
    }, [dispatch]);


  const createQuestion = useCallback(
    async (execute: (method: string, endpoint: string, data: Object | null) => Promise<any>,
      question: IQuestion) => {
      const { partitionKey, id, title, modified, parentCategory } = question;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory, loading: false } });
      try {
        const questionDto = new QuestionDto(question).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createQuestion', questionDto)
        await execute("POST", url, questionDto)
          .then(async (response: IQuestionDtoEx | Response) => {
            console.timeEnd();
            console.error(response)
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
            else {
              const questionDtoEx: IQuestionDtoEx = response;
              console.log("::::::::::::::::::::", { questionDtoEx });
              const { questionDto, msg } = questionDtoEx;
              if (questionDto) {
                const question = new Question(questionDto).question;
                console.log('Question successfully created')
                dispatch({ type: ActionTypes.SET_QUESTION, payload: { question } });
                //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
                await loadCats(execute); // reload
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

  const updateQuestion = useCallback(
    async (execute: (method: string, endpoint: string, data: Object | null) => Promise<any>,
      question: IQuestion) => {
      const { partitionKey, id, title, modified, parentCategory } = question;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory, loading: false } });
      try {
        const questionDto = new QuestionDto(question).questionDto;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createQuestion', questionDto)
        await execute("PUT", url, questionDto)
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
                console.log('Question successfully updated')
                dispatch({ type: ActionTypes.SET_QUESTION, payload: { question } });
                //dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM })
                await loadCats(execute); // reload
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


  const deleteQuestion = useCallback(
    async (execute: (method: string, endpoint: string, data: Object | null) => Promise<any>,
      question: IQuestion) => {
      const { partitionKey, id, title, modified, parentCategory } = question;
      dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id: parentCategory, loading: false } });
      try {
        const questionDto = new QuestionDto(question).questionDto;
        questionDto.Archived = new WhoWhen2Dto(question.archived!).whoWhenDto!;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}`;
        console.time()
        await execute("DELETE", url, questionDto)
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
                await loadCats(execute); // reload
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

  const getQuestion = async (
    execute: (method: string, endpoint: string) => Promise<any>,
    questionKey: IQuestionKey
  ): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { partitionKey, id } = questionKey;
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${partitionKey}/${id}`;
        console.time()
        await execute("GET", url)
          .then((response: IQuestionDtoEx | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              resolve(new Error('fetch response error'));
            }
            else {
              const questionDtoEx: IQuestionDtoEx = response;
              const { questionDto, msg } = questionDtoEx;
              //const question: IQuestion = new Question(questionDto, parentCategory).question;
              const question: IQuestion = new Question(questionDto!).question;
              question.categoryTitle = 'nadji me';
              if (questionDto) {
                resolve(question);
              }
              else {
                resolve(new Error(`Question ${id} not found!`));
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        resolve(error);
      }
    })
  }

  const viewQuestion = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, questionKey: IQuestionKey) => {
    const question: IQuestion | Error = await getQuestion(execute, questionKey);
    if (question instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: question } });
    else
      dispatch({ type: ActionTypes.VIEW_QUESTION, payload: { question } });
  }, []);

  const editQuestion = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, questionKey: IQuestionKey) => {
    const question: IQuestion | Error = await getQuestion(execute, questionKey);
    if (question instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: question } });
    else
      dispatch({ type: ActionTypes.EDIT_QUESTION, payload: { question } });
  }, []);


  const assignQuestionAnswer = useCallback(async (questionId: string, answerId: number, assigned: IWhoWhen): Promise<any> => {
    try {
      const question: IQuestion = await dbp!.get('Questions', questionId);
      const answer: IAnswer = await dbp!.get('Answers', answerId);
      const newAssignedAnwser: IAssignedAnswer = {
        answer: {
          id: answerId
          // title: answer.title
        },
        user: {
          nickName: globalState.authUser.nickName,
          createdBy: 'date string'
        },
        assigned
      }
      const assignedAnswers = [...question.assignedAnswers, newAssignedAnwser];
      const obj: IQuestion = {
        ...question,
        assignedAnswers,
        numOfAssignedAnswers: assignedAnswers.length
      }
      await dbp!.put('Questions', obj, questionId);
      console.log("Question Answer successfully assigned", obj);
      ///////////////////
      // newAssignedAnwser.answer.title = answer.title;
      // obj.assignedAnswers = [...question.assignedAnswers, newAssignedAnwser];;
      // dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: obj } });
      dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question: { ...obj } } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);


  const unAssignQuestionAnswer = useCallback(async (questionId: string, answerId: number): Promise<any> => {
    try {
      const question = await dbp!.get('Questions', questionId);
      // const answer: IAnswer = await dbp!.get('Answers', answerId);

      const assignedAnswers = question.assignedAnswers.filter((aa: IAssignedAnswer) => aa.answer.id !== answerId);
      const obj: IQuestion = {
        ...question,
        assignedAnswers,
        numOfAssignedAnswers: assignedAnswers.length
      }
      await dbp!.put('Questions', obj, questionId);
      console.log("Question Answer successfully assigned");
      dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question: { ...obj } } });
      return obj;
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    // try {
    //   const url = `/api/questions/unassign-question-answer/${questionId}`
    //   const res = await axios.put(url, { answerId });
    //   const { status, data } = res;
    //   if (status === 200) {
    //     console.log("Answer successfully un-assigned from Question");
    //     dispatch({ type: ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER, payload: { question: data } });
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: { error: new Error('Status is not 200 status:' + status) }
    //     });
    //   }
    // }
    // catch (err: any | Error) {
    //   if (axios.isError(err)) {
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: err
    //       }
    //     })
    //   }
    //   else {
    //     console.log(err);
    //   }
    // }
  }, []);

  const createAnswer = useCallback(async (answer: IAnswer): Promise<any> => {
    // try {
    //   const res = await axios.post(`/api/answers/create-answer`, answer);
    //   const { status, data } = res;
    //   if (status === 200) {
    //     console.log('Answer successfully created')
    //     return data;
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //   }
    // }
    // catch (error) {
    //   console.log(error);
    // }
    return null;
  }, []);


  const contextValue: ICategoriesContext = {
    state, reloadCategoryNode,
    getSubCategories, createCategory, viewCategory, editCategory, updateCategory, deleteCategory, deleteCategoryVariation,
    expandCategory, collapseCategory, loadCategoryQuestions,
    createQuestion, viewQuestion, editQuestion, updateQuestion, deleteQuestion,
    assignQuestionAnswer, unAssignQuestionAnswer, createAnswer
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

