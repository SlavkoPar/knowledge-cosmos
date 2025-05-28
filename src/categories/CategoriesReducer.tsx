import { Reducer } from 'react'
import { Mode, ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions, ILocStorage, ICategoryKey, ICategoryKeyExtended, IQuestionRow, Question, IQuestionRowDto, IQuestionKey, CategoryKey, QuestionKey } from "categories/types";

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
  status: 0,
  isSelected: false
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
  questionRows: [],
  numOfQuestions: 0,
  hasMoreQuestions: false,
  isExpanded: false
}

export const initialState: ICategoriesState = {
  mode: Mode.NULL,
  categories: [],
  categoryNodesUpTheTree: [],
  categoryKeyExpanded: {
    partitionKey: "REMOTECTRLS",
    id: "REMOTECTRLS",
    questionId: "qqqqqq111",
  },
  categoryId_questionId_done: undefined,
  loading: false,
  questionLoading: false,
  categoryNodeReLoading: false,
  categoryNodeLoaded: false, //true  TODO izmeni nakon testa
  categoryInViewingOrEditing: null,
  questionInViewingOrEditing: null
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
    const { lastCategoryKeyExpanded } = locStorage!;
    const categoryNodeLoaded = lastCategoryKeyExpanded ? false : true;
    initialCategoriesState = {
      ...initialCategoriesState,
      categoryKeyExpanded: { ...lastCategoryKeyExpanded },
      categoryNodeLoaded
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

  const { categoryKeyExpanded } = newState;
  const locStorage: ILocStorage = {
    lastCategoryKeyExpanded: categoryKeyExpanded
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
      const { id, loading } = action.payload; // category doesn't contain inAdding 
      return {
        ...state,
        loading
      }

    case ActionTypes.SET_CATEGORY_QUESTIONS_LOADING:
      const { questionLoading } = action.payload; // category doesn't contain inAdding 
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
      const { categoryNodesUpTheTree, categoryKeyExpanded, fromChatBotDlg } = action.payload;
      const { id, questionId } = categoryKeyExpanded;
      console.log('====== >>>>>>> CategoriesReducer ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE payload ', action.payload)
      return {
        ...state,
        categories: fromChatBotDlg ? [] : [...state.categories],
        categoryNodesUpTheTree,
        categoryId_questionId_done: `${id}_${questionId}`,
        categoryNodeLoading: false,
        categoryNodeLoaded: true,
        loading: false,
        categoryKeyExpanded,
        mode: Mode.NULL // reset previosly selected form
      };
    }

    case ActionTypes.SET_SUB_CATEGORIES: {
      const { subCategories } = action.payload;
      const { categoryNodesUpTheTree, categories } = state;
      const ids = categoryNodesUpTheTree.map(c => c.id);
      let idRemove: string = '';
      console.log('===========>>>>>>>>>> CategoriesReducer ActionTypes.SET_SUB_CATEGORIES', { ids, subCategories })
      subCategories.forEach((subCategory: ICategory) => {
        const { id, hasSubCategories, numOfQuestions } = subCategory;
        if (ids.length > 0) {
          if (ids.includes(id)) {
            idRemove = id;
            if (hasSubCategories || numOfQuestions > 0) {
              subCategory.isExpanded = true;
              subCategory.isSelected = false;
            }
            else {
              subCategory.isExpanded = false;
              subCategory.isSelected = true;
            }
          }
        }
      })
      return {
        ...state,
        categories: categories.concat(subCategories),
        categoryNodesUpTheTree: categoryNodesUpTheTree.filter(c => c.id !== idRemove),
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
        partitionKey: partitionKey!,
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
      return {
        ...state,
        categories: state.categories.map(c => c.inAdding ? category : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY: {
      const { category } = action.payload; // category doesn't contain  inAdding 
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
      const { partitionKey, id, parentCategory } = category;
      return {
        ...state,
        // categories: state.categories.map(c => c.id === category.id
        //   ? { ...category, inViewing: true } //, isExpanded } // category.questions are inside of object
        //   : { ...c, inViewing: false }
        // ),
        mode: Mode.ViewingCategory,
        loading: false,
        //questionId: null,
        categoryInViewingOrEditing: category //new CategoryKey(category).categoryKey
      };
    }

    case ActionTypes.EDIT_CATEGORY: {
      const { category } = action.payload;
      const { partitionKey, id, parentCategory } = category;
      console.log('===>>> ActionTypes.EDIT_CATEGORY', category)
      return {
        ...state,
        mode: Mode.EditingCategory,
        loading: false,
        //categoryId: category.id,
        //questionId: null,
        categoryInViewingOrEditing: category // new CategoryKey(category).categoryKey
      };
    }

    case ActionTypes.LOAD_CATEGORY_QUESTIONS: {
      const { parentCategory, questionRows, hasMoreQuestions } = action.payload; // category doesn't contain inAdding 
      console.log('>>>>>>>>>>>>LOAD_CATEGORY_QUESTIONS', { parentCategory, questionRows, hasMoreQuestions })
      const category = state.categories.find(c => c.id === parentCategory);
      /*
      const questions: IQuestion[] = questionRowDtos.map(questionRow => new Question(questionRow).question);
      */
      //if (questions.length > 0 && category!.questions.map(q => q.id).includes(questions[0].id)) {
      // privremeno  TODO  uradi isto i u group/answers
      // We have, at two places:
      //   <EditCategory inLine={true} />
      //   <EditCategory inLine={false} />
      //   so we execute loadCategoryQuestions() twice in QuestionList, but OK
      // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
      // return state;
      //}
      const questionInAdding = category!.questionRows.find(q => q.inAdding);
      if (questionInAdding) {
        //questions.unshift(questionInAdding);
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      // const arr = questionRows.map(questionRow => (questionRow.included
      //   ? {
      //     ...questionRow,
      //   }
      //   : questionRow));
      return {
        ...state,
        categories: state.categories.map(c => c.id === parentCategory
          ? {
            ...c,
            questionRows: c.questionRows.concat(questionRows),
            hasMoreQuestions,
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
        categories: categories.map(c => ({ ...c, inAdding: false }))
      };
    }

    case ActionTypes.SET_EXPANDED: {
      const { categoryKey } = action.payload;
      let { categories } = state;
      console.log('ActionTypes.SET_EXPANDED:', { categoryKey })
      return {
        ...state,
        categories: categories.map(c => c.id === categoryKey.id
          ? { ...c, isExpanded: true }
          : c
        ),
        loading: false,
        mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        categoryKeyExpanded: { ...categoryKey, questionId: null },
        //categoryId: undefined,
        categoryNodeLoaded: true, // prevent reloadCategoryNode
        //questionId: null
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
          ? { ...c, isExpanded: false }
          : c
        ),
        loading: false,
        //mode: state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        categoryKeyExpanded: { ...categoryKey, questionId: null }
        // mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node

        //categoryNodeLoaded: true // prevent reloadCategoryNode
      };
    }

    // First we add a new question to the category.guestions
    // After user clicks Save, we call createQuestion 
    case ActionTypes.ADD_QUESTION: {
      const { categoryInfo } = action.payload;
      const { categoryKey, level } = categoryInfo;
      const { partitionKey, id } = categoryKey;
      const questionRow: IQuestionRow = {
        ...initialQuestion,
        partitionKey: id ?? '',
        parentCategory: id,
        inAdding: true
      }
      return {
        ...state,
        categories: state.categories.map(c => c.id === id
          ? { ...c, questionRows: [questionRow, ...c.questionRows], inAdding: true, numOfQuestions: c.numOfQuestions + 1 }
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
            ? c.questionRows.map(q => q.inAdding ? { ...question, inAdding: false } : q)
            : c.questionRows.map(q => q.id === id ? { ...question } : q),
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
            ? c.questionRows.map(q => q.inAdding ? { ...question, inAdding: q.inAdding } : q)
            : c.questionRows.map(q => q.id === id ? { ...question } : q), // TODO sta, ako je inViewing
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
      const { partitionKey, id, parentCategory } = question;
      return {
        ...state,
        mode: Mode.ViewingQuestion,
        loading: false,
        categoryId: question.parentCategory,
        categoryKeyExpanded: {
          partitionKey,
          id: parentCategory,
          questionId: id,
        },
        questionInViewingOrEditing: question
      }
    }

    case ActionTypes.SET_VIEWING_EDITING_QUESTION: {
      return {
        ...state,
        categories: state.categories.map(c => ({
          ...c,
          questions: c.questionRows.map((q: IQuestionRow) => ({ ...q }))
        })),
        mode: null
      }
    }

    case ActionTypes.EDIT_QUESTION: {
      const { question } = action.payload;
      const { partitionKey, id, parentCategory } = question;
      return {
        ...state,
        mode: Mode.EditingQuestion,
        loading: false,
        categoryId: parentCategory,
        categoryKeyExpanded: {
          partitionKey,
          id: parentCategory,
          questionId: id,
        },
        questionInViewingOrEditing: question
      }
    }

    case ActionTypes.DELETE_QUESTION: {
      const { question } = action.payload;
      const { parentCategory, id } = question;
      return {
        ...state,
        categories: state.categories.map(c => c.id === parentCategory
          ? {
            ...c,
            questions: c.questionRows.filter(q => q.id !== id)
          }
          : c
        ),
        mode: Mode.NULL
      }
    }

    case ActionTypes.CANCEL_QUESTION_FORM:
    case ActionTypes.CLOSE_QUESTION_FORM: {
      const { question } = action.payload;
      const { partitionKey, id, parentCategory } = question;
      let questionInViewingOrEditing: IQuestion | null = null
        ; const category = state.categories.find(c => c.id === parentCategory)
      let questionRows: IQuestionRow[] = [];
      switch (state.mode) {
        case Mode.AddingQuestion: {
          console.assert(category!.inAdding, "expected category.inAdding");
          questionRows = category!.questionRows.filter(q => !q.inAdding)
          // TODO questionInViewingOrEditing: ?;
          break;
        }

        case Mode.ViewingQuestion:
        case Mode.EditingQuestion: {
          questionInViewingOrEditing = null;
          break;
        }

        default:
          break;
      }

      return {
        ...state,
        categories: state.categories.map(c => c.id === parentCategory
          ? { ...c, questions: questionRows, numOfQuestions: questionRows.length, inAdding: false }
          : c
        ),
        mode: Mode.NULL,
        questionInViewingOrEditing
      };
    }

    default:
      return state;  // TODO throw error
  }
};


function markForClean(categories: ICategory[], id: string | null) {
  let deca = categories
    .filter(c => c.parentCategory === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(categories, id) : [];
    deca = deca.concat(unuci);
  })
  return deca
}