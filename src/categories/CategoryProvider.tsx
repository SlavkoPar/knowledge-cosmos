import { useGlobalState } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IParentInfo, IFromUserAssignedAnswer,
  IAssignedAnswer, ICategoryDto, IQuestionDto,
  Category,
  Question,
  IQuestionKey,
  ICategoryKey,
  ICategoryKeyExtended
} from 'categories/types';

import { initialCategoriesState, CategoriesReducer } from 'categories/CategoriesReducer';
import { IWhoWhen, ICat, WhoWhen2DateAndBy } from 'global/types';
import { IAnswer, IGroup } from 'groups/types';
import { protectedResources } from 'authConfig';

const CategoriesContext = createContext<ICategoriesContext>({} as any);
const CategoryDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const CategoryProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { dbp, cats } = globalState;

  const [state, dispatch] = useReducer(CategoriesReducer, initialCategoriesState);
  // const { categoryNodesUpTheTree } = state;
  console.log('--------------->>> CategoryProvider') //, { categoryNodesUpTheTree })

  const reloadCategoryNode = useCallback(
    async (execute: (method: string, endpoint: string) => Promise<any>,
      categoryKey: ICategoryKey | null,
      questionId: string | null): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          const { id } = categoryKey!;
          const cat: ICat | undefined = cats.get(id);
          if (!cat) {
            alert('reload cats' + id)
            return
          }
          dispatch({ type: ActionTypes.SET_LOADING })
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


  const getSubCategories = useCallback(
    async (execute: (method: string, endpoint: string) => Promise<any>, categoryKey: ICategoryKey) => {
      const { partitionKey, id: parentCategory } = categoryKey;
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${parentCategory}`;
        console.log('calling getSubCategories:', url)
        console.time();
        await execute("GET", url).then((response: ICategoryDto[]) => {
          console.timeEnd();
          //console.log({ response });
          if (response instanceof Response) {
            dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('fetch Response') } });
            return;
          }
          const data: ICategoryDto[] = response;
          const subCategories = data!.map((categoryDto: ICategoryDto) => new Category(categoryDto).category);
          dispatch({ type: ActionTypes.SET_SUB_CATEGORIES, payload: { subCategories } });
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);


  const createCategory = useCallback(async (category: ICategory) => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    try {
      await dbp!.add('Categories', category);
      console.log('Category successfully created')
      dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
      dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);


  const getCategory = useCallback(async (
    execute: (method: string, endpoint: string) => Promise<any>,
    categoryKey: ICategoryKey,
    includeQuestionId: string): Promise<any> => {
    const { partitionKey: partitionKey, id } = categoryKey;
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${id}/${PAGE_SIZE}/${includeQuestionId}`;
        console.time()
        await execute("GET", url)
          .then((response: ICategoryDto | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              resolve(response);
            }
            else {
              const categoryDto: ICategoryDto = response;
              if (categoryDto) {
                const category: ICategory = new Category(categoryDto).category;
                resolve(category);
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
  }, []);


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

  const updateCategory = useCallback(async (c: ICategory, closeForm: boolean) => {
    const { id, variations, title, kind, modified } = c;
    dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      const category = await dbp!.get('Categories', id);
      const obj: ICategory = {
        ...category,
        variations,
        title,
        kind,
        modified
      }
      await dbp!.put('Categories', obj);
      console.log("Category successfully updated");
      const categoryKey: ICategoryKey = { partitionKey: c.partitionKey, id: c.id };
      dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey } });
      dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category: obj } });
      if (closeForm)
        dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);

  const deleteCategory = async (categoryKey: ICategoryKey) => {
    const { partitionKey: partitionKey, id } = categoryKey
    try {
      const category = await dbp!.delete('Categories', id);
      console.log("Category successfully deleted");
      dispatch({ type: ActionTypes.DELETE, payload: { id } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };

  const deleteCategoryVariation = async (id: string, variationName: string) => {
    try {
      const category = await dbp!.get('Categories', id);
      const obj: ICategory = {
        ...category,
        variations: category.variations.filter((variation: string) => variation !== variationName),
        modified: {
          date: new Date(),
          by: {
            nickName: globalState.authUser.nickName
          }
        }
      }
      updateCategory(obj, false);
      console.log("Category Tag successfully deleted");
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };

  const expandCategory = useCallback(
    async (execute: (method: string, endpoint: string) => Promise<any>, categoryKey: ICategoryKey, includeQuestionId: string) => {
      try {
        await getCategory(execute, categoryKey, includeQuestionId) // to reload Category
          .then(async (category: ICategory | Error) => {
            console.log('getCategory', { category })
            if (category instanceof Error) {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: category } });
            }
            else {
              //category.isExpanded = true;
              category.isExpanded = true;
              dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category } });
              //dispatch({ type: ActionTypes.SET_EXPANDED, payload: { categoryKey, isExpanded: true } });
              // await getSubCategories(execute, categoryKey);
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
          })
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);


  const collapseCategory = useCallback(
    async (execute: (method: string, endpoint: string) => Promise<any>, categoryKey: ICategoryKey) => {
      try {
        dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey } });// clean subTree
        dispatch({ type: ActionTypes.SET_EXPANDED, payload: { categoryKey, isExpanded: false } });
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);


  ////////////////////////////////////
  // Questions
  //

  const PAGE_SIZE = 12;
  const loadCategoryQuestions = useCallback(
    async ({ execute, parentCategory, startCursor, includeQuestionId }: IParentInfo)
      : Promise<any> => {
      const questions: IQuestion[] = [];
      try {
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
            const { Questions: questionDtos, HasMoreQuestions: hasMoreQuestions } = categoryDto;
            questionDtos.forEach((questionDto: IQuestionDto) => {
              const question = new Question(questionDto, parentCategory!).question;
              if (includeQuestionId && question.id === includeQuestionId) {
                question.included = true;
              }
              question.categoryTitle = 'nadji me';
              questions.push(question);
            })
            dispatch({
              type: ActionTypes.LOAD_CATEGORY_QUESTIONS,
              payload: { parentCategory, questions, hasMoreQuestions }
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


  const createQuestion = useCallback(async (question: IQuestion, fromModal: boolean): Promise<any> => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    try {
      const tx = dbp!.transaction(['Categories', 'Questions'], 'readwrite');
      const id = await tx.objectStore('Questions').add(question);
      question.id = id.toString();
      console.log('Question successfully created')

      const category: ICategory = await tx.objectStore('Categories').get(question.parentCategory);
      category.numOfQuestions += 1;
      await tx.objectStore('Categories').put(category);
      // TODO check setting inViewing, inEditing, inAdding to false

      dispatch({ type: ActionTypes.SET_QUESTION, payload: { question } });
      return question;
    }
    catch (error: any) {
      console.log('error', error);
      if (fromModal) {
        return { message: error.message }; //'Something is wrong' };
      }
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      return {};
    }
  }, []);


  const getQuestion = async (execute: (method: string, endpoint: string) => Promise<any>, questionKey: IQuestionKey, type: ActionTypes.VIEW_QUESTION | ActionTypes.EDIT_QUESTION) => {
    // const url = `/api/questions/get-question/${id}`;
    //try {
    //const question: IQuestion = await dbp!.get("Questions", id);
    //const { parentCategory } = question;
    //const category: ICategory = await dbp!.get("Categories", parentCategory)
    //question.id = id;
    try {
      const { parentCategory, id } = questionKey;
      //dispatch({ type: ActionTypes.SET_LOADING })
      console.time()

      const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${parentCategory}/${id}`;
      await execute("GET", url).then((response: IQuestionDto | undefined) => {
        console.timeEnd();
        console.log({ response });
        const questionDto = response!;
        const question: IQuestion = new Question(questionDto, parentCategory).question;
        question.categoryTitle = 'nadji me';
        dispatch({ type, payload: { question } });
      });
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    // const { fromUserAssignedAnswer } = question;
    // if (fromUserAssignedAnswer) {
    //   question.questionAnswers.forEach(questionAnswer => {
    //     const user = fromUserAssignedAnswer!.find((fromUser: IFromUserAssignedAnswer) =>
    //       fromUser.id === questionAnswer.assigned.by.userId);
    //     questionAnswer.user.createdBy = user ? user.createdBy : 'unknown'
    //   })
    //   delete question.fromUserAssignedAnswer;
    // }
    // }
    // catch (error: any) {
    //   console.log(error);
    //   dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    // }

    //console.log(`FETCHING --->>> ${url}`)
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data }) => {
    //     const question: IQuestion = data;
    //     const { fromUserAssignedAnswer } = question;
    //     question.questionAnswers.forEach(questionAnswer => {
    //       const user = fromUserAssignedAnswer!.find((fromUser: IFromUserAssignedAnswer) => fromUser._id === questionAnswer.assigned.by.userId);
    //       questionAnswer.user.createdBy = user ? user.createdBy : 'unknown'
    //     })
    //     delete question.fromUserAssignedAnswer;
    //     dispatch({ type, payload: { question } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const viewQuestion = useCallback((execute: (method: string, endpoint: string) => Promise<any>, questionKey: IQuestionKey) => {
    getQuestion(execute, questionKey, ActionTypes.VIEW_QUESTION);
  }, []);

  const editQuestion = useCallback((execute: (method: string, endpoint: string) => Promise<any>, questionKey: IQuestionKey) => {
    getQuestion(execute, questionKey, ActionTypes.EDIT_QUESTION);
  }, []);

  const updateQuestion = useCallback(async (q: IQuestion): Promise<any> => {
    const { id } = q;
    //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
    try {
      const question = await dbp!.get('Questions', id!);
      const obj: IQuestion = {
        ...question,
        title: q.title,
        modified: q.modified,
        source: q.source,
        status: q.status
      }
      await dbp!.put('Questions', obj, id);
      console.log("Question successfully updated");
      obj.id = id;
      dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: obj } });
      return obj;
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    // try {
    //   const url = `/api/questions/update-question/${question._id}`
    //   const res = await axios.put(url, question)
    //   const { status, data } = res;
    //   if (status === 200) {
    //     // TODO check setting inViewing, inEditing, inAdding to false
    //     console.log("Question successfully updated");
    //     dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: data } });
    //     return data;
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: new Error('Status is not 200 status:' + status)
    //       }
    //     })
    //     return {};
    //   }
    // }
    // catch (err: any | Error) {
    //   if (axios.isError(err)) {
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: new Error(axios.isError(err) ? err.response?.data : err)
    //       }
    //     })
    //     return {};
    //   }
    //   else {
    //     console.log(err);
    //   }
    //   return {}
    // }
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

  const deleteQuestion = async (questionKey: IQuestionKey) => {
    dispatch({ type: ActionTypes.SET_LOADING })
    try {
      const res = await dbp!.delete('Questions', questionKey.id);
      console.log("Question successfully deleted");
      dispatch({ type: ActionTypes.DELETE_QUESTION, payload: { questionKey } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }

    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .delete(`/api/questions/delete-question/${_id}`)
    //   .then(res => {
    //     if (res.status === 200) {
    //       console.log("Question successfully deleted");
    //       dispatch({ type: ActionTypes.DELETE_QUESTION, payload: { question: res.data.question } });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

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

