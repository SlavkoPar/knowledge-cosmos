import { Reducer } from 'react'
import { Mode, ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions, ILocStorage, ICategoryKey, ICategoryKeyExtended, IQuestionRow, Question, IQuestionRowDto, IQuestionKey, CategoryKey, QuestionKey, ICategoryDto, QuestionRow, ICategoryRow, CategoryRow } from "categories/types";
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
  categoryRows: [],
  categoryNodesUpTheTree: [],
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
    ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE
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


    case ActionTypes.CATEGORY_NODE_RE_LOADING: {
      return {
        ...state,
        categoryNodeReLoading: true
      }
    }

    case ActionTypes.RESET_CATEGORY_QUESTION_DONE: {
      return {
        ...state,
        categoryId_questionId_done: undefined,
        categoryNodeLoaded: false
      };
    }

    case ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE: {
      // const { categoryNodesUpTheTree, categoryKeyExpanded, fromChatBotDlg } = action.payload;
      const { categoryKeyExpanded, fromChatBotDlg, categoryRow } = action.payload;
      const { id, questionId } = categoryKeyExpanded;
      console.log('====== >>>>>>> CategoriesReducer ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE payload ', action.payload)
      //const mts = state.categories.find(c => c.id === 'MTS')!

      // const cats = dddeepClone(mts, category!);
      const categoryRows: ICategoryRow[] = state.categoryRows.map(c => c.id === categoryRow.id
        ? { ...categoryRow }
        : { ...c }
      )

      return {
        ...state,
        categoryRows: fromChatBotDlg ? [] : categoryRows,
        // categoryNodesUpTheTree,
        categoryId_questionId_done: `${id}_${questionId}`,
        categoryNodeLoading: false,
        categoryNodeLoaded: true,
        loading: false,
        categoryKeyExpanded,
        mode: Mode.NULL // reset previosly selected form
      };
    }

    case ActionTypes.SET_SUB_CATEGORIES: {
      const { id, subCategoryRows } = action.payload;
      const { categoryNodesUpTheTree, categoryRows } = state;
      //const ids = categoryNodesUpTheTree.map(c => c.id);
      let idRemove: string = '';
      //const mts = subCategories.find(c => c.id === 'MTS')!
      // mts.subCategories = [ {...initialCategory, id: '111'} , {...initialCategory, id:'222'} ]
      // const z = deepClone(mts);
      console.log('===========>>>>>>>>>> CategoriesReducer ActionTypes.SET_SUB_CATEGORIES', { subCategoryRows })
      //const cat: ICategory | undefined = findCategory(categories, id);
      //console.log("))))))))))))))))))))))))ActionTypes.SET_SUB_CATEGORIES findCategory:", { id, cat })
      //if (cat) {
      //  cat.subCategories = subCategories;
      //}
      subCategoryRows.forEach((row: ICategoryRow) => {
        const { id, hasSubCategories, numOfQuestions } = row;
        //if (ids.length > 0) {
        //  if (ids.includes(id)) {
        idRemove = id;
        // if (hasSubCategories || numOfQuestions > 0) {
        //   row.isExpanded = true;
        //   row.isSelected = false;
        // }
        // else {
        //   row.isExpanded = false;
        //   row.isSelected = true;
        // }
        //}
        //}
      })
      return {
        ...state,
        //categoryRows: categoryRows.concat(subCategoryRows),
        categoryRows: subCategoryRows,
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
          categoryRows: []
        }
      }
      else {
        const ids = markForClean(state.categoryRows, categoryKey.id);
        console.log('CLEAN_SUB_TREE:', ids)
        if (ids.length === 0)
          return {
            ...state,
            //categoryKeyExpanded: null
          }
        else
          return {
            ...state,
            //categoryKeyExpanded: null,
            categoryRows: state.categoryRows.filter(c => !ids.includes(c.id))
          }
      }
    }

    case ActionTypes.CLEAN_TREE: {
      return {
        ...state,
        categoryRows: []
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
      const categoryRow: ICategoryRow = {
        ...initialCategory,
        level,
        partitionKey: partitionKey!,
        parentCategory: id,
        inAdding: true
      }
      return {
        ...state,
        categoryRows: [...state.categoryRows, categoryRow],
        mode: Mode.AddingCategory
      };
    }

    case ActionTypes.SET_ADDED_CATEGORY: {
      const { category } = action.payload;
      return {
        ...state,
        categoryRows: state.categoryRows.map((row: ICategoryRow) => row.inAdding ? { ...category, inAdding: false } : row),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY: {
      const { category } = action.payload; // category doesn't contain  inAdding 
      console.log('@@@@@@@@@@ SET_CATEGORY', { category })
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
        categoryRows: state.categoryRows.map((c: ICategory) => c.id === id
          ? {
            ...category,
            inAdding: c.inAdding,
            isExpanded: c.isExpanded
          }
          : c),
        questionInViewingOrEditing: null,
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_CATEGORY: {
      const { category } = action.payload;
      //const { isExpanded } = category;
      category.isExpanded = false;
      console.log('===>>> ActionTypes.VIEW_CATEGORY', category)
      const { partitionKey, id, parentCategory } = category;
      return {
        ...state,
        //categories: resetRows(state.categories, category.id, { isSelected: true, isExpanded: false, questionRows: [], numOfQuestions: 0 }),
        categoryRows: resetCategory(state.categoryRows, category.id),
        mode: Mode.ViewingCategory,
        loading: false,
        categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        categoryInViewingOrEditing: category,
        questionInViewingOrEditing: null
      };
    }

    case ActionTypes.EDIT_CATEGORY: {
      const { category } = action.payload;
      category.isExpanded = false;
      const { partitionKey, id, parentCategory } = category;
      const categoryRows = resetCategory(state.categoryRows, category.id);
      console.log('===>>> ActionTypes.EDIT_CATEGORY', { category }, { categoryRows })
      return {
        ...state,
        categoryRows,
        mode: Mode.EditingCategory,
        loading: false,
        categoryKeyExpanded: state.categoryKeyExpanded ? { ...state.categoryKeyExpanded, questionId: null } : null,
        categoryInViewingOrEditing: category,
        questionInViewingOrEditing: null
      };
    }

    case ActionTypes.LOAD_CATEGORY_QUESTIONS: {
      const { categoryRow } = action.payload;
      const { id, rootId, questionRows, hasMoreQuestions } = categoryRow;
      //const { id, questionRows, hasMoreQuestions } = action.payload; // category doesn't contain inAdding 
      //console.log('>>>>>>>>>>>>LOAD_CATEGORY_QUESTIONS', { id, questionRows, hasMoreQuestions })
      let { categoryRows } = state;
      const rootCat: ICategory = categoryRows.find(c => c.id === rootId)!;
      DeepClone.catIdToSet = id;
      DeepClone.newCat = categoryRow;
      const rootCatModified = new DeepClone(rootCat).categoryRow;
      const newCategoryRows = categoryRows.map(c => c.id === rootId
        ? rootCatModified
        : new DeepClone(c).categoryRow
      )
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
        categoryRows: newCategoryRows,
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
      return {
        ...state,
        mode: Mode.NULL,
        categoryRows: state.categoryRows.filter(c => c.id !== id),
        error: undefined,
        whichRowId: undefined
      };
    }

    case ActionTypes.CANCEL_CATEGORY_FORM:
    case ActionTypes.CLOSE_CATEGORY_FORM: {
      const categoryRows = state.mode === Mode.AddingCategory
        ? state.categoryRows.filter(c => !c.inAdding)
        : state.categoryRows
      return {
        ...state,
        mode: Mode.NULL,
        categoryRows: categoryRows.map((c: ICategory) => ({ ...c, inAdding: false }))
      };
    }

    case ActionTypes.SET_EXPANDED: {
      const { categoryRow } = action.payload;
      const { partitionKey, id, rootId } = categoryRow;
      const categoryKey: ICategoryKey = { partitionKey, id };
      console.log('ActionTypes.SET_EXPANDED:', { categoryRow })
      let { categoryRows } = state;
      const rootCat: ICategoryRow = categoryRows.find(c => c.id === rootId)!;
      DeepClone.catIdToSet = id;
      DeepClone.newCat = { ...categoryRow, isExpanded: true };
      const rootCatModified = new DeepClone(rootCat).categoryRow;
      const newCategoryRows = categoryRows.map(c => c.id === rootId
        ? rootCatModified
        : new DeepClone(c).categoryRow
      )
      return {
        ...state,
        categoryRows: newCategoryRows,
        loading: false,
        mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        categoryKeyExpanded: { ...categoryKey, questionId: null },
        categoryNodeLoaded: true, // prevent reloadCategoryRowNode
      };
    }

    case ActionTypes.SET_COLLAPSED: {
      const { categoryKey } = action.payload;
      const { partitionKey, id } = categoryKey;
      let { categoryRows } = state;

      const ids = markForClean(categoryRows, categoryKey.id)
      console.log('clean:', ids)

      const cats = ids.length > 0 ? categoryRows.filter(c => !ids.includes(c.id)) : categoryRows

      const x = {
        ...state,
        categoryRows: cats.map((c: ICategoryRow) => c.id === id
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
        categoryRows: state.categoryRows.map((c: ICategory) => c.id === id
          ? { ...c, questionRows: [questionRow, ...c.questionRows], inAdding: true, numOfQuestions: c.numOfQuestions + 1 }
          : { ...c, inAdding: false }),
        mode: Mode.AddingQuestion
      };
    }

    case ActionTypes.SET_QUESTION: {
      const { question } = action.payload;
      const { parentCategory, id, title, numOfAssignedAnswers } = question;
      const inAdding = state.mode === Mode.AddingQuestion;
      const categoryRows = state.categoryRows.map((c: ICategory) => c.id === parentCategory
        ? {
          ...c,
          questionRows: inAdding
            ? c.questionRows.map(q => q.inAdding ? { ...q, title, inAdding: false } : q)
            : c.questionRows.map(q => q.id === id ? { ...q, title, numOfAssignedAnswers } : q),
          inAdding: false
        }
        : c
      );
      console.log('ActionTypes.SET_QUESTION', "^" + parentCategory + "^", categoryRows.filter(c => c.id === parentCategory)[0])
      return {
        ...state,
        categoryRows,
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

      const categoryRows = state.categoryRows.map((c: ICategory) => c.id === parentCategory
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
        categoryRows,
        mode: state.mode, // keep mode
        loading: false
      };
    }
    case ActionTypes.SET_VIEWING_EDITING_QUESTION: {
      return {
        ...state,
        categoryRows: state.categoryRows.map((c: ICategory) => ({
          ...c,
          questionRows: c.questionRows.map((q: IQuestionRow) => ({ ...q }))
        })),
        mode: null
      }
    }

    case ActionTypes.VIEW_QUESTION: {
      const { question } = action.payload;
      const { partitionKey, id, parentCategory } = question;
      const { categoryRows, categoryKeyExpanded } = state;
      const categoryProps = undefined;
      return {
        ...state,
        categoryRows: resetRows(state.categoryRows, parentCategory, categoryProps, id, { isSelected: true, isExpanded: false }),
        mode: Mode.ViewingQuestion,
        loading: false,
        categoryKeyExpanded: categoryKeyExpanded
          ? { ...categoryKeyExpanded, questionId: categoryKeyExpanded.id === parentCategory ? id : null }
          : null,
        questionInViewingOrEditing: question
      }
    }

    case ActionTypes.EDIT_QUESTION: {
      const { question } = action.payload;
      const { partitionKey, id, parentCategory } = question;
      const { categoryRows, categoryKeyExpanded } = state;
      const categoryProps = undefined;
      return {
        ...state,
        categoryRows: resetRows(state.categoryRows, parentCategory, categoryProps, id, { isSelected: true, isExpanded: false }),
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
        ...state,
        categoryRows: state.categoryRows.map((c: ICategory) => c.id === parentCategory
          ? {
            ...c,
            questionRows: c.questionRows.filter(q => q.id !== id)
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
      const category = state.categoryRows.find(c => c.id === parentCategory)
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
        categoryRows: state.categoryRows.map((c: ICategory) => c.id === parentCategory
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


function resetCategory(categoryRows: ICategoryRow[], categoryId: string | null): ICategoryRow[] {
  return categoryRows.map((c: ICategory) => c.id === categoryId
    ? {
      ...c,
      //questionRows: []
      //numOfQuestions: 0
      questionRows: c.questionRows.map(q => ({ ...q, isSelected: false })),
      isExpanded: false,
      isSelected: true
    }
    : {
      ...c,
      //isSelected: c.id === categoryId      
    }
  )
}

function resetRows(categoryRows: ICategoryRow[],
  id: string | null,
  categoryProps?: Object,
  questionId?: string,
  questionRowProps?: Object,
): ICategory[] {
  return categoryRows.map((c: ICategory) => c.id === id
    ? {
      ...c,
      questionRows: c.questionRows.map(q => q.id === questionId
        ? ({ ...q, ...questionRowProps ?? {} })
        : ({ ...q, isSelected: false })),
      ...categoryProps
    }
    : {
      ...c,
      questionRows: c.questionRows.map(q => ({ ...q, isSelected: false })),
      //isSelected: c.id === id      
    }
  )
}

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


function markForClean(categoryRows: ICategoryRow[], id: string | null) {
  let deca = categoryRows
    .filter(c => c.parentCategory === id)
    .map(c => c.id)

  deca.forEach(id => {
    const unuci = id ? markForClean(categoryRows, id) : [];
    deca = deca.concat(unuci);
  })
  return deca

}



export class DeepClone {
  static catIdToSet?: string;
  static newCat?: ICategoryRow;
  constructor(categoryRow: ICategoryRow) {
    const { partitionKey, id, rootId, parentCategory, title, link, kind, header, level, variations, numOfQuestions,
      hasSubCategories, subCategories, created, modified, questionRows, isExpanded } = categoryRow;

    const subCats = subCategories.map((cat: ICategoryRow) => {
      if (cat.id === DeepClone.catIdToSet) {
        return DeepClone.newCat!
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

