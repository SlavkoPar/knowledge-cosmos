import { Reducer } from 'react'
import { Mode, ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions, ILocStorage, ICategoryKey, ICategoryKeyExtended, IQuestionRow, Question, IQuestionRowDto } from "categories/types";

export const initialQuestion: IQuestion = {
  partitionKey: '',
  id: 'will be given by DB',
  parentCategory: '',
  categoryTitle: '',
  title: '',
  assignedAnswers: [],
  numOfAssignedAnswers: 0,
  relatedFilters: [],
  numOfRelatedFilters: 0,
  source: 0,
  status: 0
}

export const initialCategory: ICategory = {
  partitionKey: 'null',
  id: '',
  kind: 0,
  title: '',
  link: '',
  header: '',
  level: 0,
  variations: [],
  parentCategory: 'null',
  hasSubCategories: false,
  questions: [],
  numOfQuestions: 0,
  hasMoreQuestions: false,
  isExpanded: false
}

export const initialState: ICategoriesState = {
  mode: Mode.NULL,
  categories: [],
  categoryNodesUpTheTree: [],
  categoryKeyExpanded: {
    "partitionKey": "DALJINSKI",
    "id": "DALJINSKI"
  },
  categoryId_questionId_done: undefined,
  categoryId: null,
  questionId: "7770111111",
  loading: false,
  questionLoading: false,
  categoryNodeReLoading: false,
  categoryNodeLoaded: false //true  TODO izmeni nakon testa
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
  console.log('Arghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh CATEGORIES_STATE loaded before signIn')
  const s = localStorage.getItem('CATEGORIES_STATE');
  if (s !== null) {
    const locStorage = JSON.parse(s);
    const { lastCategoryKeyExpanded, questionId } = locStorage!;
    const categoryNodeLoaded = lastCategoryKeyExpanded ? false : true;

    initialCategoriesState = {
      ...initialCategoriesState,
      categoryKeyExpanded: lastCategoryKeyExpanded,
      categoryNodeLoaded: lastCategoryKeyExpanded ? false : true,
      questionId
    }
    console.log('initialCategoriesState nakon citanja iz memorije', initialCategoriesState);
  }
}

export { initialCategoriesState };

export const CategoriesReducer: Reducer<ICategoriesState, CategoriesActions> = (state, action) => {

  console.log('------------------------------->', action.type)
  const newState = reducer(state, action);
  const aTypesToStore = [
    ActionTypes.SET_EXPANDED,
    ActionTypes.SET_COLLAPSED,
    ActionTypes.VIEW_CATEGORY,
    ActionTypes.EDIT_CATEGORY,
    ActionTypes.VIEW_QUESTION,
    ActionTypes.EDIT_QUESTION,
    ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE
  ];

  const { categoryKeyExpanded, questionId } = newState;
  const locStorage: ILocStorage = {
    lastCategoryKeyExpanded: categoryKeyExpanded,
    questionId
  }
  if (aTypesToStore.includes(action.type)) {
    localStorage.setItem('CATEGORIES_STATE', JSON.stringify(locStorage));
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


    case ActionTypes.CATEGORY_NODE_LOADING: {
      const { loading } = action.payload;
      return {
        ...state,
        categoryNodeLoading: loading
      }
    }

    case ActionTypes.RESET_CATEGORY_QUESTION_DONE: {
      return {
        ...state,
        categoryId_questionId_done: undefined,
        categoryNodeLoaded: false
      };
    }


    case ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE: {
      const { categoryNodesUpTheTree, categoryKey, questionId } = action.payload;
      console.log('====== >>>>>>> CategoriesReducer ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE payload ', action.payload)
      const categoryId = categoryKey ? categoryKey.id : null;

      return {
        ...state,
        categoryNodesUpTheTree,
        categoryId,
        questionId,
        categoryId_questionId_done: `${categoryId}_${questionId}`,
        categoryNodeLoading: false,
        categoryNodeLoaded: true,
        loading: false,
        categoryKeyExpanded: categoryKey
      };
    }

    case ActionTypes.SET_SUB_CATEGORIES: {
      const { subCategories } = action.payload;
      const { categoryNodesUpTheTree, categories } = state;
      let arr: ICategoryKeyExtended[] = [...categoryNodesUpTheTree]
      const ids = categoryNodesUpTheTree!.map(c => c.id);
      console.log('===========>>>>>>>>>> ')
      console.log('===========>>>>>>>>>> CategoriesReducer ActionTypes.SET_SUB_CATEGORIES', ids, { subCategories })
      console.log('===========>>>>>>>>>> ')
      subCategories.forEach((subCategory: ICategory) => {
        const { id, hasSubCategories, numOfQuestions } = subCategory;
        if (hasSubCategories || numOfQuestions > 0) {
          const expand = ids.includes(id);
          if (expand) {
            subCategory.isExpanded = true;
            subCategory.isSelected = false;
            arr = arr.filter(c => c.id !== id);
            console.log('===========>>>>>>>>>> set IsExpanded subcategory: ', id);
            console.log(arr.length === 0 ? '===========>>>>>>>>>> POCISTIO categoryNodesUpTheTree' : '')
          }
        }
        else {
          if (arr.length === 0) {
            subCategory.isExpanded = false;
            subCategory.isSelected = true;
          }
        }
      })
      return {
        ...state,
        categories: categories.concat(subCategories),
        categoryNodesUpTheTree: arr,
        loading: false
      };
    }

    case ActionTypes.CLEAN_SUB_TREE: {
      const { categoryKey } = action.payload;
      if (categoryKey === null) {
        return {
          ...state,
          categoryKeyExpanded: null,
          categoryNodeLoaded: false,
          categories: []
        }
      }
      else {
        const ids = markForClean(state.categories, categoryKey.id);
        console.log('CLEAN_SUB_TREE:', ids)
        if (ids.length === 0)
          return {
            ...state,
            categoryKeyExpanded: null
          }
        else
          return {
            ...state,
            categoryKeyExpanded: null,
            categories: state.categories.filter(c => !ids.includes(c.id))
          }
      }
    }

    case ActionTypes.CLEAN_TREE: {
      return {
        ...state,
        categories: []
      }
    }

    case ActionTypes.SET_ERROR: {
      const { error, whichRowId } = action.payload; // category.id or question.id
      return {
        ...state,
        error,
        whichRowId,
        loading: false,
        questionLoading: false,
        categoryNodeLoading: false
      };
    }

    case ActionTypes.ADD_SUB_CATEGORY: {
      const { categoryKey, level } = action.payload;
      const { partitionKey, id } = categoryKey;
      const category: ICategory = {
        ...initialCategory,
        level,
        partitionKey,
        parentCategory: id,
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
      console.log('SET_CATEGORY', { category })
      const { id } = category;
      /* TODO sredi kasnije 
      const cat = state.categories.find(c => c.id === id);
      const questionInAdding = cat!.questions.find(q => q.inAdding);
      if (questionInAdding) {
        questions.unshift(questionInAdding); // TODO mislim da ovo treba comment
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      */
      return {
        ...state,
        categories: state.categories.map(c => c.id === id
          ? {
            ...category,
            inViewing: c.inViewing,
            inEditing: c.inEditing,
            inAdding: c.inAdding,
            isExpanded: c.isExpanded
          }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_CATEGORY: {
      const { category } = action.payload;
      //const { isExpanded } = category;
      console.log('===>>> ActionTypes.VIEW_CATEGORY', category)
      return {
        ...state,
        categories: state.categories.map(c => c.id === category.id
          ? { ...category, inViewing: true } //, isExpanded } // category.questions are inside of object
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingCategory,
        loading: false,
        categoryId: category.id,
        questionId: null
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
        questionId: null
      };
    }

    case ActionTypes.LOAD_CATEGORY_QUESTIONS: {
      const { parentCategory, questionRowDtos, hasMoreQuestions } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      console.log('>>>>>>>>>>>>LOAD_CATEGORY_QUESTIONS', { parentCategory, questionRowDtos, hasMoreQuestions })
      const category = state.categories.find(c => c.id === parentCategory);
      const questions: IQuestion[] = questionRowDtos.map(questionRow => new Question(questionRow).question);
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
            questions: c.questions.concat(questions.map(question => (question.included
              ? {
                ...question,
                inViewing: state.mode === Mode.ViewingQuestion,
                inEditing: state.mode === Mode.EditingQuestion
              }
              : question))),
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
        categories: state.categories.filter(c => c.id !== id),
        error: undefined,
        whichRowId: undefined
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
      const { categoryKey } = action.payload;
      let { categories } = state;
      return {
        ...state,
        categories: categories.map(c => c.id === categoryKey.id
          ? { ...c, isExpanded: true, inViewing: c.inViewing, inEditing: c.inEditing }
          : c
        ),
        loading: false,
        mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        categoryKeyExpanded: categoryKey,
        //categoryId: undefined,
        categoryNodeLoaded: true // prevent reloadCategoryNode
      };
    }

    case ActionTypes.SET_COLLAPSED: {
      const { categoryKey } = action.payload;
      const { partitionKey, id } = categoryKey;
      let { categories } = state;

      const ids = markForClean(categories, categoryKey.id)
      console.log('clean:', ids)
      if (ids.length > 0) {
        categories = categories.filter(c => !ids.includes(c.id))
      }
      return {
        ...state,
        categories: categories.map(c => c.id === id
          ? { ...c, isExpanded: false, inViewing: c.inViewing, inEditing: c.inEditing }
          : c
        ),
        loading: false,
        //mode: state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        categoryKeyExpanded: categoryKey,
        questionId: null
        // mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node

        //categoryNodeLoaded: true // prevent reloadCategoryNode
      };
    }

    // First we add a new question to the category.guestions
    // After user clicks Save, we call createQuestion 
    case ActionTypes.ADD_QUESTION: {
      const { categoryInfo } = action.payload;
      const { id, level } = categoryInfo;
      const question: IQuestion = {
        ...initialQuestion,
        partitionKey: id,
        parentCategory: id,
        inAdding: true
      }
      return {
        ...state,
        categories: state.categories.map(c => c.id === id
          ? { ...c, questions: [question, ...c.questions], inAdding: true, numOfQuestions: c.numOfQuestions + 1 }
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
            : c.questions.map(q => q.id === id ? { ...question, inEditing: c.inEditing, inViewing: c.inViewing } : q),
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
        error: undefined,
        loading: false
      };
    }

    case ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER: {
      const { question } = action.payload;
      const { parentCategory, id } = question;
      const inAdding = state.mode === Mode.AddingQuestion;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      // const x = state.categories.filter(c => c.id === parentCategory).filter(q=>q.id === id);
      // console.error('SET_QUESTION_AFTER_ASSIGN_ANSWER', {x})

      const categories = state.categories.map(c => c.id === parentCategory
        ? {
          ...c,
          questions: inAdding
            ? c.questions.map(q => q.inAdding ? { ...question, inAdding: q.inAdding } : q)
            : c.questions.map(q => q.id === id ? { ...question, inViewing: q.inViewing, inEditing: q.inEditing } : q), // TODO sta, ako je inViewing
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
        categoryId: question.parentCategory,
        questionId: question.id,
      }
    }

    case ActionTypes.EDIT_QUESTION: {
      const { question } = action.payload;
      const obj = {
        ...state,
        categories: state.categories.map(c => c.id === question.parentCategory
          ? {
            ...c,
            questions: c.questions.map((q: IQuestion) => q.id === question.id
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
        categoryId: question.parentCategory,
        questionId: question.id,
      }
      return obj;
    }

    case ActionTypes.DELETE_QUESTION: {
      const { question } = action.payload;
      const { parentCategory, id } = question;
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
        mode: Mode.NULL
      };
    }

    default:
      return state;  // TODO throw error
  }
};

// function markForClean(categories: ICategory[], categoryKey: ICategoryKey) {
//   const { id } = categoryKey;
//   let deca = categories
//     .filter(c => c.parentCategory === id)
//     .map(c => ({ partitionKey: '', id: c.id }))

//   deca.forEach(c => {
//     const categoryKey = { partitionKey: '', id: c.id }
//     deca = deca.concat(markForClean(categories, categoryKey))
//   })
//   return deca
// }

function markForClean(categories: ICategory[], id: string) {
  let deca = categories
    .filter(c => c.parentCategory === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(categories, id) : [];
    deca = deca.concat(unuci);
  })
  return deca
}