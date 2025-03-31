import { Reducer } from 'react'
import { Mode, ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions, IFromLocalStorage } from "categories/types";

export const initialQuestion: IQuestion = {
  id: '', // real id will be given by DB
  parentCategory: '',
  categoryTitle: '',
  title: '',
  assignedAnswers: [],
  numOfAssignedAnswers: 0,
  source: 0,
  status: 0,
  archived: false
}

export const initialCategory: ICategory = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  partitionKey: '',
  id: '',
  kind: 0,
  title: '',
  level: 0,
  variations: [],
  parentCategory: 'null',
  hasSubCategories: false,
  questions: [],
  numOfQuestions: 0,
  hasMoreQuestions: false,
  isExpanded: false,
  archived: false
}

export const initialState: ICategoriesState = {
  mode: Mode.NULL,
  categories: [],
  currentCategoryExpanded: null,
  lastCategoryExpanded: null,
  categoryId_questionId_done: null,
  categoryId: null,
  questionId: null,
  loading: false,
  questionLoading: false,
  locStorage: {
    lastCategoryExpanded: null,
    categoryId: null,
    questionId: null
  }
}

// let state_fromLocalStorage: IState_fromLocalStorage | undefined;

// const hasMissingProps = (): boolean => {
//   let b = false;
//   const keys = Object.keys(initialStateFromLocalStorage!)
//   Object.keys(initialState).forEach((prop: string) => {
//     if (!keys.includes(prop)) {
//       b = true;
//       console.log('missing prop:', prop, ' try with SignOut')
//     }
//   })
//   return b;
// }

let initialCategoriesState: ICategoriesState = {
  ...initialState
}

if ('localStorage' in window) {
  const s = localStorage.getItem('CATEGORIES_STATE');
  if (s !== null) {
    const state_fromLocalStorage = JSON.parse(s);
    // if (hasMissingProps()) {
    //   initialStateFromLocalStorage = undefined;
    // }
    // else {
    const { lastCategoryExpanded, categoryId, questionId } = state_fromLocalStorage!;
    initialCategoriesState = {
      ...initialCategoriesState,
      lastCategoryExpanded,
      categoryId,
      questionId,
      locStorage: { ...state_fromLocalStorage }
    }
    console.log('initialCategoriesState', initialCategoriesState);
    //}
  }
}

export { initialCategoriesState };

export const CategoriesReducer: Reducer<ICategoriesState, CategoriesActions> = (state, action) => {
  console.log('----->', action.type)
  const newState = reducer(state, action);
  const aTypesToStore = [
    ActionTypes.SET_EXPANDED,
    ActionTypes.VIEW_CATEGORY,
    ActionTypes.EDIT_CATEGORY,
    ActionTypes.VIEW_QUESTION,
    ActionTypes.EDIT_QUESTION
  ];

  if (aTypesToStore.includes(action.type)) {
    localStorage.setItem('CATEGORIES_STATE', JSON.stringify(newState.locStorage));
  }
  return newState;
}

const reducer = (state: ICategoriesState, action: CategoriesActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SET_CATEGORY_LOADING:
      const { id, loading } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      return {
        ...state,
        // categories: state.categories.map(c => c.id === id
        //   ? { ...c, isLoading }
        //   : c)
        loading
      }

    case ActionTypes.SET_CATEGORY_QUESTIONS_LOADING:
      const { questionLoading } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      return {
        ...state,
        questionLoading
      }

    case ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE: {
      const { categoryNodesUpTheTree, categoryId, questionId } = action.payload;
      console.log('--->>> ActionTypes.SET_CATEGORIES_UP_THE_TREE', action.payload)
      return {
        ...state,
        lastCategoryExpanded: null, // TODO
        categoryNodesUpTheTree,
        categoryId,
        // questionId,
        categoryId_questionId_done: `${categoryId}_${questionId}`
      };
    }

    case ActionTypes.SET_SUB_CATEGORIES: {
      const { subCategories } = action.payload;
      const categories = state.categories.concat(subCategories);
      console.log('------>>>>>> ActionTypes.SET_SUB_CATEGORIES', action.payload)
      return {
        ...state,
        categories,
        loading: false
      };
    }

    case ActionTypes.CLEAN_SUB_TREE: {
      const { id } = action.payload.category;
      const arr = markForClean(state.categories, id!)
      console.log('clean:', arr)
      const ids = arr.map(c => c.id)
      if (arr.length === 0)
        return {
          ...state
        }
      else
        return {
          ...state,
          categories: state.categories.filter(c => !ids.includes(c.id))
        }
    }

    case ActionTypes.CLEAN_TREE: {
      return {
        ...state,
        categories: []
      }
    }

    case ActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return {
        ...state,
        error,
        loading: false
      };
    }

    case ActionTypes.ADD_SUB_CATEGORY: {
      const { parentCategory, level } = action.payload;
      const category: ICategory = {
        ...initialCategory,
        title: '',
        level: 765, //level + 1,  //TODO
        parentCategory: parentCategory ?? 'null',
        inAdding: true
      }

      return {
        ...state,
        categories: [...state.categories, category],
        mode: Mode.AddingCategory
      };
    }

    case ActionTypes.SET_ADDED_CATEGORY: {
      const { category } = action.payload;
      // category doesn't contain inViewving, inEditing, inAdding 
      return {
        ...state,
        categories: state.categories.map(c => c.inAdding ? category : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY: {
      const { category } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      const { questions } = category;
      const cat = state.categories.find(c => c.id === category.id);
      const questionInAdding = cat!.questions.find(q => q.inAdding);
      if (questionInAdding) {
        questions.unshift(questionInAdding); // TODO mislim da ovo treba comment
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      return {
        ...state,
        categories: state.categories.map(c => c.id === category.id
          ? {
            ...category,
            questions,
            inViewing: c.inViewing, inEditing: c.inEditing, inAdding: c.inAdding, isExpanded: c.isExpanded
          }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_CATEGORY: {
      const { category } = action.payload;
      console.log('===>>> ActionTypes.VIEW_CATEGORY', category)
      return {
        ...state,
        categories: state.categories.map(c => c.id === category.id
          //? { ...category, questions: c.questions, inViewing: true, isExpanded: c.isExpanded } // category.questions are inside of object
          ? { ...category, inViewing: true, isExpanded: c.isExpanded } // category.questions are inside of object
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingCategory,
        loading: false,
        categoryId: category.id,
        questionId: null,
        locStorage: {
          ...state.locStorage,
          categoryId: category.id,
          questionId: null
        }
    };
    }

    case ActionTypes.EDIT_CATEGORY: {
      const { category } = action.payload;
      console.log('===>>> ActionTypes.EDIT_CATEGORY', category)
      return {
        ...state,
        categories: state.categories.map(c => c.id === category.id
          //? { ...category, questions: c.questions, inEditing: true, isExpanded: false } //c.isExpanded }
          ? { ...category, inEditing: true, isExpanded: false } //c.isExpanded }
          : { ...c, inEditing: false }
        ),
        mode: Mode.EditingCategory,
        loading: false,
        categoryId: category.id,
        questionId: null,
        locStorage: {
          ...state.locStorage,
          categoryId: category.id,
          questionId: null
        }
      };
    }

    case ActionTypes.LOAD_CATEGORY_QUESTIONS: {
      const { parentCategory, questions, hasMoreQuestions } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      const category = state.categories.find(c => c.id === parentCategory);
      //if (questions.length > 0 && category!.questions.map(q => q.id).includes(questions[0].id)) {
      // privremeno  TODO  uradi isto i u group/answers
      // We have, at two places:
      //   <EditCategory inLine={true} />
      //   <EditCategory inLine={false} />
      //   so we execute loadCategoryQuestions() twice in QuestionList, but OK
      // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
      // return state;
      //}
      const questionInAdding = category!.questions.find(q => q.inAdding);
      if (questionInAdding) {
        //questions.unshift(questionInAdding);
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      return {
        ...state,
        categories: state.categories.map(c => c.id === parentCategory
          ? {
            ...c,
            questions: c.questions.concat(questions.map(q => (q.included
              ? {
                ...q,
                inViewing: state.mode === Mode.ViewingQuestion,
                inEditing: state.mode === Mode.EditingQuestion
              }
              : q))),
            hasMoreQuestions,
            inViewing: c.inViewing,
            inEditing: c.inEditing,
            inAdding: c.inAdding,
            isExpanded: c.isExpanded
          }
          : c),
        // keep mode
        questionLoading: false
      }
    }

    case ActionTypes.DELETE: {
      const { id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        categories: state.categories.filter(c => c.id !== id)
      };
    }

    case ActionTypes.CANCEL_CATEGORY_FORM:
    case ActionTypes.CLOSE_CATEGORY_FORM: {
      const categories = state.mode === Mode.AddingCategory
        ? state.categories.filter(c => !c.inAdding)
        : state.categories
      return {
        ...state,
        mode: Mode.NULL,
        categories: categories.map(c => ({ ...c, inViewing: false, inEditing: false, inAdding: false }))
      };
    }

    case ActionTypes.SET_EXPANDED: {
      const { categoryKey, expanding } = action.payload;
      const { partitionKey: partitionKey, id } = categoryKey;
      let { categories } = state;
      if (!expanding) {
        const arr = markForClean(categories, id!)
        console.log('clean:', arr)
        const ids = arr.map(c => c.id)
        if (ids.length > 0) {
          categories = categories.filter(c => !ids.includes(c.id))
        }
      }
      const currentCategoryExpanded = expanding ? categoryKey : null;
      return {
        ...state,
        categories: categories.map(c => c.id === id
          ? { ...c, inViewing: c.inViewing, inEditing: c.inEditing, isExpanded: expanding }
          : c
        ),
        mode: expanding ? Mode.NULL : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        currentCategoryExpanded,
        locStorage: {
          ...state.locStorage,
          lastCategoryExpanded: currentCategoryExpanded
        }
      };
    }

    // First we add a new question to the category.guestions
    // After user clicks Save, we call createQuestion 
    case ActionTypes.ADD_QUESTION: {
      const { categoryInfo } = action.payload;
      const { id, level } = categoryInfo;
      const question: IQuestion = {
        ...initialQuestion,
        parentCategory: id,
        inAdding: true
      }
      return {
        ...state,
        categories: state.categories.map(c => c.id === id
          ? { ...c, questions: [question, ...c.questions], inAdding: true } // , numOfQuestions: c.numOfQuestions + 1
          : { ...c, inAdding: false }),
        mode: Mode.AddingQuestion
      };
    }

    case ActionTypes.SET_QUESTION: {
      const { question } = action.payload;
      const { parentCategory, id } = question;
      const inAdding = state.mode === Mode.AddingQuestion;

      // for inAdding, id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q.id === id
      const categories = state.categories.map(c => c.id === parentCategory
        ? {
          ...c,
          questions: inAdding
            ? c.questions.map(q => q.inAdding ? { ...question, inAdding: false } : q)
            : c.questions.map(q => q.id === id ? { ...question, inEditing: false, inViewing: false } : q),
          inViewing: false,
          inEditing: false,
          inAdding: false
        }
        : c
      );
      return {
        ...state,
        categories,
        mode: Mode.NULL,
        loading: false
      };
    }

    case ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER: {
      const { question } = action.payload;
      const { parentCategory, id } = question;
      const inAdding = state.mode === Mode.AddingQuestion;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      const categories = state.categories.map(c => c.id === parentCategory
        ? {
          ...c,
          questions: inAdding
            ? c.questions.map(q => q.inAdding ? { ...question, inAdding: q.inAdding } : q)
            : c.questions.map(q => q.id === id ? { ...question, inEditing: q.inEditing } : q), // TODO sta, ako je inViewing
          inEditing: c.inEditing,
          inAdding: c.inAdding
        }
        : c
      );
      return {
        ...state,
        categories,
        mode: state.mode, // keep mode
        loading: false
      };
    }

    case ActionTypes.VIEW_QUESTION: {
      const { question } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c.id === question.parentCategory
          ? {
            ...c,
            questions: c.questions.map(q => q.id === question.id
              ? {
                ...question,
                inViewing: true
              }
              : {
                ...q,
                inViewing: false
              }),
            inViewing: true
          }
          : {
            ...c,
            inViewing: false
          }
        ),
        mode: Mode.ViewingQuestion,
        loading: false,
        questionId: question.id,
        locStorage: {
          ...state.locStorage,
          questionId: question.id
        }
      }
    }

    case ActionTypes.EDIT_QUESTION: {
      const { question } = action.payload;
      const obj = {
        ...state,
        categories: state.categories.map(c => c.id === question.parentCategory
          ? {
            ...c,
            questions: c.questions.map(q => q.id === question.id
              ? {
                ...question,
                inEditing: true
              }
              : {
                ...q,
                inEditing: false
              }),
            inEditing: true
          }
          : {
            ...c,
            inEditing: false
          }
        ),
        mode: Mode.EditingQuestion,
        loading: false,
        questionId: question.id,
        locStorage: {
          ...state.locStorage,
          questionId: question.id
        }
      }
      return obj;
    }

    case ActionTypes.DELETE_QUESTION: {
      const { questionKey } = action.payload;
      const { parentCategory, id } = questionKey
      return {
        ...state,
        categories: state.categories.map(c => c.id === parentCategory
          ? {
            ...c,
            questions: c.questions.filter(q => q.id !== id)
          }
          : c
        ),
        mode: Mode.NULL
      }
    }

    case ActionTypes.CANCEL_QUESTION_FORM:
    case ActionTypes.CLOSE_QUESTION_FORM: {
      const { question } = action.payload;
      const category = state.categories.find(c => c.id === question.parentCategory)
      let questions: IQuestion[] = [];
      switch (state.mode) {
        case Mode.AddingQuestion: {
          console.assert(category!.inAdding, "expected category.inAdding");
          questions = category!.questions.filter(q => !q.inAdding)
          break;
        }

        case Mode.ViewingQuestion: {
          console.assert(category!.inViewing, "expected category.inViewing");
          questions = category!.questions.map(q => ({ ...q, inViewing: false }))
          break;
        }

        case Mode.EditingQuestion: {
          console.assert(category!.inEditing, "expected category.inEditing");
          questions = category!.questions.map(q => ({ ...q, inEditing: false }))
          break;
        }

        default:
          break;
      }

      return {
        ...state,
        categories: state.categories.map(c => c.id === question.parentCategory
          ? { ...c, questions, numOfQuestions: questions.length, inAdding: false, inEditing: false, inViewing: false }
          : c
        ),
        mode: Mode.NULL,
      };
    }

    default:
      return state;  // TODO throw error
  }
};

function markForClean(categories: ICategory[], parentCategory: string) {
  let deca = categories
    .filter(c => c.parentCategory === parentCategory)
    .map(c => ({ id: c.id, parentCategory: c.parentCategory }))

  deca.forEach(c => {
    deca = deca.concat(markForClean(categories, c.id!))
  })
  return deca
}
