import { Reducer } from 'react'
import { Mode, ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions, ILocStorage, ICategoryKey, ICategoryKeyExtended, IQuestionRow, Question, IQuestionRowDto, IQuestionKey, CategoryKey, QuestionKey, ICategoryDto, QuestionRow, ICategoryRow, CategoryRow, actionThatModifyRootCategoryRows, actionTypesToLocalStore, ICategoryRowDto } from "categories/types";
import { Dto2WhoWhen } from 'global/types';

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
  rootId: '',
  parentCategory: 'null',
  hasSubCategories: false,
  subCategories: [],
  questionRows: [],
  numOfQuestions: 0,
  hasMoreQuestions: false,
  isExpanded: false
}

export const initialState: ICategoriesState = {
  mode: Mode.NULL,
  rootCategoryRows: [],
  categoryKeyExpanded: {
    partitionKey: "REMOTECTRLS",
    id: "REMOTECTRLS",
    questionId: "qqqqqq111"
  },
  categoryId_questionId_done: undefined,
  loading: false,
  questionLoading: false,
  categoryNodeReLoading: false,
  categoryNodeLoaded: false, //true  TODO izmeni nakon testa
  categoryInViewingOrEditing: null,
  categoryInAdding: null,
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


// function replaceCatRowInRootCatRows(rootCategoryRows: ICategoryRow[], rootId: string, categoryRow: ICategoryRow) {
//   DeepClone.catIdToSet = categoryRow.id;
//   DeepClone.newCat = categoryRow;

//   const rootCat: ICategoryRow = rootCategoryRows.find(c => c.id === rootId)!;
//   const rootCatModified = new DeepClone(rootCat).categoryRow;
//   const newRootCategoryRows = rootCategoryRows.map(c => c.id === rootId
//     ? rootCatModified
//     : new DeepClone(c).categoryRow
//   )
//   return newRootCategoryRows;
// }


  const { categoryRow } = action.payload;
  const { rootCategoryRows } = state;
  let newRootCategoryRows: ICategoryRow[];
  if (categoryRow && actionThatModifyRootCategoryRows.includes(action.type)) {
    const { rootId, id } = categoryRow!;
    const rootCategoryRow: ICategory = rootCategoryRows.find(c => c.id === rootId)!;
    DeepClone.catIdToSet = id;
    DeepClone.newCat = categoryRow!;
    const rootCatModified = new DeepClone(rootCategoryRow).categoryRow;
    newRootCategoryRows = rootCategoryRows.map(c => c.id === rootId
      ? rootCatModified
      : new DeepClone(c).categoryRow
    )
  }
  else {
    DeepClone.catIdToSet = '';
    newRootCategoryRows = rootCategoryRows.map(c => new DeepClone(c).categoryRow)
  }

  const newState = reducer(state, action, newRootCategoryRows);

  const { categoryKeyExpanded } = newState;
  const locStorage: ILocStorage = {
    lastCategoryKeyExpanded: categoryKeyExpanded
  }
  if (actionTypesToLocalStore.includes(action.type)) {
    localStorage.setItem('CATEGORIES_STATE', JSON.stringify(locStorage));
  }
  return newState;
}

const reducer = (state: ICategoriesState, action: CategoriesActions, newRootCategoryRows: ICategoryRow[]): ICategoriesState => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        loading: true
      }

    case ActionTypes.SET_CATEGORY_LOADING:
      const { id, loading } = action.payload; // category doesn't contain inAdding 
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        loading
      }

    case ActionTypes.SET_CATEGORY_QUESTIONS_LOADING:
      const { questionLoading } = action.payload; // category doesn't contain inAdding 
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        questionLoading
      }


    case ActionTypes.CATEGORY_NODE_RE_LOADING: {
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        categoryNodeReLoading: true
      }
    }

    case ActionTypes.RESET_CATEGORY_QUESTION_DONE: {
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        categoryId_questionId_done: undefined,
        categoryNodeLoaded: false
      };
    }

    //////////////////////////////////////////////////
    // CategoryRows Level: 1
    case ActionTypes.SET_ROOT_CATEGORY_ROWS: {
      const { id, rootCategoryRows } = action.payload;
      console.log('=> CategoriesReducer ActionTypes.SET_ROOT_CATEGORY_ROWS', { rootCategoryRows })
      // subCategoryRows.forEach((categoryRow: ICategoryRow) => {
      //   const { id, hasSubCategories, numOfQuestions } = categoryRow;
      // })
      return {
        ...state,
        rootCategoryRows, //: newRootCategoryRows,
        loading: false
      };
    }


    case ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE: {
      const { categoryKeyExpanded, fromChatBotDlg, categoryRow } = action.payload;
      const { id, questionId } = categoryKeyExpanded;
      console.log('====== >>>>>>> CategoriesReducer ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE payload ', action.payload)
      const rootCategoryRows: ICategoryRow[] = state.rootCategoryRows.map(c => c.id === categoryRow.id
        ? { ...categoryRow }
        : { ...c }
      )
      return {
        ...state,
        rootCategoryRows: fromChatBotDlg ? [] : rootCategoryRows,
        categoryId_questionId_done: `${id}_${questionId}`,
        categoryNodeLoaded: true,
        loading: false,
        categoryKeyExpanded,
        mode: Mode.NULL // reset previosly selected form
      };
    }
    
    case ActionTypes.SET_SUB_CATEGORIES: {
      const { id, subCategoryRows } = action.payload;
      const { rootCategoryRows } = state;
      console.log('===========>>>>>>>>>> CategoriesReducer ActionTypes.SET_SUB_CATEGORIES', { subCategoryRows })
      subCategoryRows.forEach((categoryRow: ICategoryRow) => {
        const { id, hasSubCategories, numOfQuestions } = categoryRow;
      })
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        loading: false
      };
    }


    case ActionTypes.SET_ERROR: {
      const { error, whichRowId } = action.payload; // category.id or question.id
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        error,
        whichRowId,
        loading: false,
        questionLoading: false
        //categoryNodeLoading: false
      };
    }

    case ActionTypes.ADD_SUB_CATEGORY: {
      const { categoryKey, level, rootId } = action.payload;
      const { partitionKey, id } = categoryKey;
      const category: ICategory = {
        ...initialCategory,
        rootId,
        level,
        partitionKey: partitionKey!,
        parentCategory: id,
        inAdding: true
      }
      return {
        ...state,
        categoryInAdding: category,
        rootCategoryRows: [...newRootCategoryRows, category],
        mode: Mode.AddingCategory
      };
    }

    case ActionTypes.SET_ADDED_CATEGORY: {
      const { category } = action.payload;
      return {
        ...state,
        // TODO Popravi
        rootCategoryRows: newRootCategoryRows.map((row: ICategoryRow) => row.inAdding ? { ...category, inAdding: false } : row),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY_ROW: {
      const { categoryRow } = action.payload; // category doesn't contain  inAdding 
      console.log('@@@@@@@@@@ SET_CATEGORY_ROW', { categoryRow })
      const { id, rootId } = categoryRow;
      /* TODO sredi kasnije 
      const cat = state.categories.find(c => c.id === id);
      const questionInAdding = cat!.questions.find(q => q.inAdding);
      if (questionInAdding) {
        questions.unshift(questionInAdding); // TODO mislim da ovo treba comment
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      */
      // let { rootCategoryRows } = state;
      // const rootCat: ICategory = rootCategoryRows.find(c => c.id === rootId)!;
      // DeepClone.catIdToSet = id;
      // DeepClone.newCat = categoryRow;
      // const rootCatModified = new DeepClone(rootCat).categoryRow;
      // const rootCategoryRows2 = rootCategoryRows.map(c => c.id === rootId
      //   ? rootCatModified
      //   : new DeepClone(c).categoryRow
      // )
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        questionInViewingOrEditing: null,
        // keep mode
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY_TO_VIEW: {
      const { categoryRow } = action.payload;
      const categoryInViewingOrEditing = { ...categoryRow, isExpanded: false }
      const { partitionKey, id, parentCategory, rootId } = categoryRow;
      // let { rootCategoryRows } = state;
      // const newRootCategoryRows = replaceCatRowInRootCatRows(rootCategoryRows, rootId, categoryInViewingOrEditing);
      // let { rootCategoryRows } = state;
      // const rootCat: ICategoryRow = rootCategoryRows.find(c => c.id === rootId)!;
      // DeepClone.catIdToSet = id;
      // DeepClone.newCat = category; // category extends categoryRow
      // const rootCatModified = new DeepClone(rootCat).categoryRow;
      // const rootCategoryRows2 = rootCategoryRows.map(c => c.id === rootId
      //   ? rootCatModified
      //   : new DeepClone(c).categoryRow
      // )
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        mode: Mode.ViewingCategory,
        loading: false,
        categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        categoryInViewingOrEditing,
        questionInViewingOrEditing: null
      };
    }

    case ActionTypes.SET_CATEGORY_TO_EDIT: {
      const { categoryRow } = action.payload; // ICategory extends ICategoryRow
      const categoryInViewingOrEditing = { ...categoryRow, isExpanded: false }
      const { partitionKey, id, parentCategory, rootId } = categoryRow;
      // let { rootCategoryRows } = state;
      // const newRootCategoryRows = replaceCatRowInRootCatRows(rootCategoryRows, rootId, categoryInViewingOrEditing);
      /*
      let { rootCategoryRows } = state;
      const rootCat: ICategoryRow = rootCategoryRows.find(c => c.id === rootId)!;
      DeepClone.catIdToSet = id;
      DeepClone.newCat = category; // category extends categoryRow
      const rootCatModified = new DeepClone(rootCat).categoryRow;
      const rootCategoryRows2 = rootCategoryRows.map(c => c.id === rootId
        ? rootCatModified
        : new DeepClone(c).categoryRow
      )
        */
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        mode: Mode.EditingCategory,
        loading: false,
        categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        categoryInViewingOrEditing,
        questionInViewingOrEditing: null
      };
    }

    case ActionTypes.LOAD_CATEGORY_QUESTIONS: {
      const { categoryRow } = action.payload;
      const { id, rootId, questionRows, hasMoreQuestions } = categoryRow;
      //const { id, questionRows, hasMoreQuestions } = action.payload; // category doesn't contain inAdding 
      //console.log('>>>>>>>>>>>>LOAD_CATEGORY_QUESTIONS', { id, questionRows, hasMoreQuestions })
      // let { rootCategoryRows } = state;
      // const rootCat: ICategory = rootCategoryRows.find(c => c.id === rootId)!;
      // DeepClone.catIdToSet = id;
      // DeepClone.newCat = categoryRow;
      // const rootCatModified = new DeepClone(rootCat).categoryRow;
      // const rootCategoryRows2 = rootCategoryRows.map(c => c.id === rootId
      //   ? rootCatModified
      //   : new DeepClone(c).categoryRow
      // )
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
      /* TODO sredi kad budes radio adding
      const questionInAdding = category!.questionRows.find(q => q.inAdding);
      if (questionInAdding) {
        //questions.unshift(questionInAdding);
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      */
      // const arr = questionRows.map(questionRow => (questionRow.included
      //   ? {
      //     ...questionRow,
      //   }
      //   : questionRow));
      return {
        ...state,
        //categoryRows: rootCategoryRowsNEW,
        rootCategoryRows: newRootCategoryRows,
        // state.categories.map((c: ICategory) => c.id === id
        //   ? {
        //     ...c,
        //     questionRows: c.questionRows.concat(questionRows),
        //     hasMoreQuestions,
        //     inAdding: c.inAdding,
        //     isExpanded: c.isExpanded
        //   }
        //   : c),
        // keep mode
        questionLoading: false
      }
    }

    case ActionTypes.DELETE: {
      const { id } = action.payload;
      // TODO Popravi
      return {
        ...state,
        mode: Mode.NULL,
        rootCategoryRows: newRootCategoryRows.filter(c => c.id !== id),
        error: undefined,
        whichRowId: undefined
      };
    }

    case ActionTypes.CANCEL_CATEGORY_FORM:
    case ActionTypes.CLOSE_CATEGORY_FORM: {
      // const categoryRows = state.mode === Mode.AddingCategory
      //   ? state.rootCategoryRows.filter(c => !c.inAdding)
      //   : state.rootCategoryRows
      return {
        ...state,
        mode: Mode.NULL,
        //categoryRows: categoryRows.map((c: ICategory) => ({ ...c, inAdding: false }))
        rootCategoryRows: newRootCategoryRows
      };
    }


    case ActionTypes.SET_COLLAPSED: {
      const { categoryKey } = action.payload;
      const { partitionKey, id } = categoryKey;
      // TODO Popravi
      const x = {
        ...state,
        rootCategoryRows: newRootCategoryRows.map((c: ICategoryRow) => c.id === id
          ? { ...c, isExpanded: false }
          : { ...c }
        ),
        loading: false,
        //mode: state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        categoryKeyExpanded: { ...categoryKey, questionId: null }
        // mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node

        //categoryNodeLoaded: true // prevent reloadCategoryRowNode
      };
      return x;
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
        // TODO Popravi
        rootCategoryRows: newRootCategoryRows.map((c: ICategory) => c.id === id
          ? { ...c, questionRows: [questionRow, ...c.questionRows], inAdding: true, numOfQuestions: c.numOfQuestions + 1 }
          : { ...c, inAdding: false }),
        mode: Mode.AddingQuestion
      };
    }

    case ActionTypes.SET_QUESTION: {
      const { question } = action.payload;
      const { parentCategory, id, title, numOfAssignedAnswers } = question;
      const inAdding = state.mode === Mode.AddingQuestion;
      // TODO Popravi
      const rootCategoryRows = newRootCategoryRows.map((c: ICategory) => c.id === parentCategory
        ? {
          ...c,
          questionRows: inAdding
            ? c.questionRows.map(q => q.inAdding ? { ...q, title, inAdding: false } : q)
            : c.questionRows.map(q => q.id === id ? { ...q, title, numOfAssignedAnswers } : q),
          inAdding: false
        }
        : c
      );
      console.log('ActionTypes.SET_QUESTION', "^" + parentCategory + "^", rootCategoryRows.filter(c => c.id === parentCategory)[0])
      return {
        ...state,
        rootCategoryRows,
        categoryInViewingOrEditing: null,
        questionInViewingOrEditing: question,
        // mode: Mode.NULL,
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

      // TODO Popravi
      const rootCategoryRows = newRootCategoryRows.map((c: ICategory) => c.id === parentCategory
        ? {
          ...c,
          questionRows: inAdding
            ? c.questionRows.map(q => q.inAdding ? { ...question, inAdding: q.inAdding } : q)
            : c.questionRows.map(q => q.id === id ? { ...question } : q), // TODO sta, ako je inViewing
          inAdding: c.inAdding
        }
        : c
      );
      return {
        ...state,
        rootCategoryRows,
        mode: state.mode, // keep mode
        loading: false
      };
    }
    case ActionTypes.SET_VIEWING_EDITING_QUESTION: {
      // Popravi
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows.map((c: ICategory) => ({
          ...c,
          questionRows: c.questionRows.map((q: IQuestionRow) => ({ ...q }))
        })),
        mode: null
      }
    }

    case ActionTypes.SET_QUESTION_TO_VIEW: {
      const { question } = action.payload;
      const { partitionKey, id, parentCategory } = question;
      const { categoryKeyExpanded } = state;
      const categoryProps = undefined;
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        mode: Mode.ViewingQuestion,
        loading: false,
        categoryKeyExpanded: categoryKeyExpanded
          ? { ...categoryKeyExpanded, questionId: categoryKeyExpanded.id === parentCategory ? id : null }
          : null,
        questionInViewingOrEditing: question
      }
    }

    case ActionTypes.SET_QUESTION_TO_EDIT: {
      const { question } = action.payload;
      const { partitionKey, id, parentCategory } = question;
      const { categoryKeyExpanded } = state;
      const categoryProps = undefined;
      return {
        ...state,
        rootCategoryRows: newRootCategoryRows,
        mode: Mode.EditingQuestion,
        loading: false,
        categoryKeyExpanded: categoryKeyExpanded
          ? { ...categoryKeyExpanded, questionId: categoryKeyExpanded.id === parentCategory ? id : null }
          : null,
        questionInViewingOrEditing: question
      }
    }

    case ActionTypes.DELETE_QUESTION: {
      const { question } = action.payload;
      const { parentCategory, id } = question;
      return {
        ...state, // Popravi
        // categoryKeyExpanded: newRootCategoryRows.map((c: ICategory) => c.id === parentCategory
        //   ? {
        //     ...c,
        //     questionRows: c.questionRows.filter(q => q.id !== id)
        //   }
        //   : c
        // ),
        mode: Mode.NULL
      }
    }

    case ActionTypes.CANCEL_QUESTION_FORM:
    case ActionTypes.CLOSE_QUESTION_FORM: {
      const { question } = action.payload;
      const { partitionKey, id, parentCategory } = question;
      let questionInViewingOrEditing: IQuestion | null = null
      const category = state.rootCategoryRows.find(c => c.id === parentCategory)
      let questionRows: IQuestionRow[] = [];
      // POPRAVI
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
        rootCategoryRows: newRootCategoryRows.map((c: ICategory) => c.id === parentCategory
          ? { ...c, /*questionRows: questionRows, numOfQuestions: questionRows.length,*/ inAdding: false }
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


function findCategory(categoryRows: ICategoryRow[], id: string | null): ICategory | undefined {
  let cat: ICategory | undefined = categoryRows.find(c => c.id === (id ?? 'null'));
  if (!cat) {
    try {
      categoryRows.forEach(c => {
        cat = findCategory(c.subCategories, id);
        if (cat) {
          throw new Error("Stop the loop");
        }
      })
    }
    catch (e) {
      console.log("Loop stopped");
    }
  }
  return cat;
}

export class DeepClone {
  static catIdToSet: string;
  static newCat: ICategoryRow;
  constructor(categoryRow: ICategoryRow) {
    const { partitionKey, id, rootId, parentCategory, title, link, kind, header, level, variations, numOfQuestions,
      hasSubCategories, subCategories, created, modified, questionRows, isExpanded } = categoryRow;

    const subCats = subCategories.map((cat: ICategoryRow) => {
      if (cat.id === DeepClone.catIdToSet) {
        return { ...DeepClone.newCat }
      }
      else {
        return new DeepClone(cat).categoryRow
      }
    });

    this.categoryRow = {
      partitionKey,
      id,
      kind,
      rootId,
      parentCategory,
      title,
      link,
      header,
      level,
      hasSubCategories,
      subCategories: subCats,
      numOfQuestions,
      questionRows,
      variations: variations ?? [],
      created,
      modified,
      isExpanded
    }
  }
  categoryRow: ICategoryRow;
}


