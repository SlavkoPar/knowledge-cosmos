import { Reducer } from 'react'
import { Mode, ActionTypes, IGroupsState, IGroup, IAnswer, GroupsActions, ILocStorage, IGroupKey, IGroupKeyExtended, Answer } from "groups/types";

export const initialAnswer: IAnswer = {
  partitionKey: '',
  id: 'will be given by DB',
  parentGroup: '',
  groupTitle: '',
  title: '',
  link: '',
  source: 0,
  status: 0
}


export const initialGroup: IGroup = {
  partitionKey: 'null',
  id: '',
  kind: 0,
  title: '',
  link: '',
  header: '',
  level: 0,
  variations: [],
  parentGroup: 'null',
  hasSubGroups: false,
  answers: [],
  numOfAnswers: 0,
  hasMoreAnswers: false,
  isExpanded: false
}

export const initialState: IGroupsState = {
  mode: Mode.NULL,
  groups: [],
  groupNodesUpTheTree: [],
  groupKeyExpanded: {
    "partitionKey": "TELEVISIONS",
    "id": "TELEVISIONS"
  },
  groupId_answerId_done: undefined,
  groupId: null,
  answerId: "7772294152",
  loading: false,
  answerLoading: false,
  groupNodeReLoading: false,
  groupNodeLoaded: false
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

let initialGroupsState: IGroupsState = {
  ...initialState
}

if ('localStorage' in window) {
  console.log('Arghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
  const s = localStorage.getItem('GROUPS_STATE');
  if (s !== null) {
    const locStorage = JSON.parse(s);
    const { lastGroupKeyExpanded, answerId } = locStorage!;
    const groupNodeLoaded = lastGroupKeyExpanded ? false : true;

    initialGroupsState = {
      ...initialGroupsState,
      groupKeyExpanded: lastGroupKeyExpanded,
      groupNodeLoaded: lastGroupKeyExpanded ? false : true,
      answerId
    }
    console.log('initialGroupsState nakon citanja iz memorije', initialGroupsState);
  }
}

export { initialGroupsState };

export const GroupsReducer: Reducer<IGroupsState, GroupsActions> = (state, action) => {

  console.log('------------------------------->', action.type)
  const newState = reducer(state, action);
  const aTypesToStore = [
    ActionTypes.SET_EXPANDED,
    ActionTypes.SET_COLLAPSED,
    ActionTypes.VIEW_GROUP,
    ActionTypes.EDIT_GROUP,
    ActionTypes.VIEW_ANSWER,
    ActionTypes.EDIT_ANSWER
  ];

  const { groupKeyExpanded, answerId } = newState;
  const locStorage: ILocStorage = {
    lastGroupKeyExpanded: groupKeyExpanded,
    answerId
  }
  if (aTypesToStore.includes(action.type)) {
    localStorage.setItem('GROUPS_STATE', JSON.stringify(locStorage));
  }
  return newState;
}

const reducer = (state: IGroupsState, action: GroupsActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SET_GROUP_LOADING:
      const { id, loading } = action.payload; // group doesn't contain inViewing, inEditing, inAdding 
      return {
        ...state,
        // groups: state.groups.map(c => c.id === id
        //   ? { ...c, isLoading }
        //   : c)
        loading
      }

    case ActionTypes.SET_GROUP_ANSWERS_LOADING:
      const { answerLoading } = action.payload; // group doesn't contain inViewing, inEditing, inAdding 
      return {
        ...state,
        answerLoading
      }

    case ActionTypes.RELOAD_GROUP_NODE: {
      const { groupNodesUpTheTree, groupId, answerId } = action.payload;
      console.log('=========================>>> ActionTypes.RELOAD_GROUP_NODE groupNodeLoaded ', action.payload)
      return {
        ...state,
        groupNodesUpTheTree,
        groupId,
        answerId,
        groupId_answerId_done: `${groupId}_${answerId}`,
        groupNodeLoaded: true,
        loading: false
      };
    }

    case ActionTypes.SET_GROUP_NODES_UP_THE_TREE: {
      const { groupNodesUpTheTree, groupKey,  answerId } = action.payload;
      console.log('====== >>>>>>> CategoriesReducer ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE payload ', action.payload)
      const groupId = groupKey ? groupKey.id : null;
      return {
        ...state,
        groupNodesUpTheTree,
        groupId,
        questionId: answerId,
        groupId_answerId_done: `${groupId}_${answerId}`,
        groupNodeLoading: false,
        groupNodeLoaded: true,
        loading: false,
        groupKeyExpanded: groupKey,
        mode: Mode.NULL // reset previosly selcted form
      };
    }


    case ActionTypes.SET_SUB_GROUPS: {
      const { subGroups } = action.payload;
      const { groupNodesUpTheTree, groups } = state;
      console.log('===========>>>>>>>>>> ActionTypes.SET_SUB_GROUPS', { subGroups, groups })
      let arr: IGroupKeyExtended[] = [...groupNodesUpTheTree]
      const ids = groupNodesUpTheTree!.map(x => x.id);
      subGroups.forEach((subGroup: IGroup) => {
        const isExpanded = ids.includes(subGroup.id);
        if (isExpanded) {
          subGroup.isExpanded = true;
          arr = arr.filter(c => c.id !== subGroup.id);
          console.log('===========>>>>>>>>>> set IsExpanded', subGroup.id);
          console.log(arr.length === 0 ? '===========>>>>>>>>>> POCISTIO groupNodesUpTheTree' : '')
        }
      })
      return {
        ...state,
        groups: groups.concat(subGroups),
        groupNodesUpTheTree: arr,
        loading: false
      };
    }

    case ActionTypes.CLEAN_SUB_TREE: {
      const { groupKey } = action.payload;
      const arr = markForClean(state.groups, groupKey)
      console.log('CLEAN_SUB_TREE:', arr)
      const ids = arr.map(c => c.id);
      if (arr.length === 0)
        return {
          ...state
        }
      else
        return {
          ...state,
          groups: state.groups.filter(c => !ids.includes(c.id))
        }
    }

    case ActionTypes.CLEAN_TREE: {
      return {
        ...state,
        groups: []
      }
    }

    case ActionTypes.SET_ERROR: {
      const { error, whichRowId } = action.payload; // group.id or answer.id
      return {
        ...state,
        error,
        whichRowId,
        loading: false,
        answerLoading: false
      };
    }

    case ActionTypes.ADD_SUB_GROUP: {
      const { groupKey, level } = action.payload;
      const { partitionKey, id } = groupKey;
      const group: IGroup = {
        ...initialGroup,
        level,
        partitionKey,
        parentGroup: id,
        inAdding: true
      }
      return {
        ...state,
        groups: [...state.groups, group],
        mode: Mode.AddingGroup
      };
    }

    case ActionTypes.SET_ADDED_GROUP: {
      const { group } = action.payload;
      // group doesn't contain inViewving, inEditing, inAdding 
      return {
        ...state,
        groups: state.groups.map(c => c.inAdding ? group : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_GROUP: {
      const { group } = action.payload; // group doesn't contain inViewing, inEditing, inAdding 
      console.log('SET_GROUP', { group })
      const { id } = group;
      /* TODO sredi kasnije 
      const grp = state.groups.find(c => c.id === id);
      const answerInAdding = grp!.answers.find(q => q.inAdding);
      if (answerInAdding) {
        answers.unshift(answerInAdding); // TODO mislim da ovo treba comment
        console.assert(state.mode === Mode.AddingAnswer, "expected Mode.AddingAnswer")
      }
      */
      return {
        ...state,
        groups: state.groups.map(c => c.id === id
          ? {
            ...group,
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

    case ActionTypes.VIEW_GROUP: {
      const { group } = action.payload;
      //const { isExpanded } = group;
      console.log('===>>> ActionTypes.VIEW_GROUP', group)
      return {
        ...state,
        groups: state.groups.map(c => c.id === group.id
          ? { ...group, inViewing: true } //, isExpanded } // group.answers are inside of object
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingGroup,
        loading: false,
        groupId: group.id,
        answerId: null
      };
    }

    case ActionTypes.EDIT_GROUP: {
      const { group } = action.payload;
      console.log('===>>> ActionTypes.EDIT_GROUP', group)
      return {
        ...state,
        groups: state.groups.map(c => c.id === group.id
          //? { ...group, answers: c.answers, inEditing: true, isExpanded: false } //c.isExpanded }
          ? { ...group, inEditing: true, isExpanded: false } //c.isExpanded }
          : { ...c, inEditing: false }
        ),
        mode: Mode.EditingGroup,
        loading: false,
        groupId: group.id,
        answerId: null
      };
    }

    case ActionTypes.LOAD_GROUP_ANSWERS: {
      const { parentGroup, answerRowDtos, hasMoreAnswers } = action.payload; // group doesn't contain inViewing, inEditing, inAdding 
      console.log('>>>>>>>>>>>>LOAD_GROUP_ANSWERS', { parentGroup, answers: answerRowDtos, hasMoreAnswers })
      const group = state.groups.find(c => c.id === parentGroup);
      const answers: IAnswer[] = answerRowDtos.map(answerRow => new Answer(answerRow).answer);
      
      //if (answers.length > 0 && group!.answers.map(q => q.id).includes(answers[0].id)) {
      // privremeno  TODO  uradi isto i u group/answers
      // We have, at two places:
      //   <EditGroup inLine={true} />
      //   <EditGroup inLine={false} />
      //   so we execute loadGroupAnswers() twice in AnswerList, but OK
      // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
      // return state;
      //}
      const answerInAdding = group!.answers.find(q => q.inAdding);
      if (answerInAdding) {
        //answers.unshift(answerInAdding);
        console.assert(state.mode === Mode.AddingAnswer, "expected Mode.AddingAnswer")
      }
      return {
        ...state,
        groups: state.groups.map(c => c.id === parentGroup
          ? {
            ...c,
            answers: c.answers.concat(answers.map(answer => (answer.included
              ? {
                ...answer,
                inViewing: state.mode === Mode.ViewingAnswer,
                inEditing: state.mode === Mode.EditingAnswer
              }
              : answer))),
            hasMoreAnswers,
            inViewing: c.inViewing,
            inEditing: c.inEditing,
            inAdding: c.inAdding,
            isExpanded: c.isExpanded
          }
          : c),
        // keep mode
        answerLoading: false
      }
    }

    case ActionTypes.DELETE: {
      const { id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        groups: state.groups.filter(c => c.id !== id),
        error: undefined,
        whichRowId: undefined
      };
    }

    case ActionTypes.CANCEL_GROUP_FORM:
    case ActionTypes.CLOSE_GROUP_FORM: {
      const groups = state.mode === Mode.AddingGroup
        ? state.groups.filter(c => !c.inAdding)
        : state.groups
      return {
        ...state,
        mode: Mode.NULL,
        groups: groups.map(c => ({ ...c, inViewing: false, inEditing: false, inAdding: false }))
      };
    }

    case ActionTypes.SET_EXPANDED: {
      const { groupKey } = action.payload;
      let { groups } = state;
      return {
        ...state,
        groups: groups.map(c => c.id === groupKey.id
          ? { ...c, isExpanded: true, inViewing: c.inViewing, inEditing: c.inEditing }
          : c
        ),
        loading: false,
        mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        groupKeyExpanded: groupKey,
        //groupId: undefined,
        groupNodeLoaded: true // prevent reloadGroupNode
      };
    }

    case ActionTypes.SET_COLLAPSED: {
      const { groupKey } = action.payload;
      const { partitionKey, id } = groupKey;
      let { groups } = state;

      const arr = markForClean(groups, groupKey)
      console.log('clean:', arr)
      const ids = arr.map(c => c.id)
      if (ids.length > 0) {
        groups = groups.filter(c => !ids.includes(c.id))
      }
      return {
        ...state,
        groups: groups.map(c => c.id === id
          ? { ...c, isExpanded: false, inViewing: c.inViewing, inEditing: c.inEditing }
          : c
        ),
        loading: false,
        //mode: state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node
        groupKeyExpanded: groupKey,
        answerId: null
        // mode: Mode.NULL, // : state.mode,// expanding ? state.mode : Mode.NULL,  // TODO  close form only if inside of colapsed node

        //groupNodeLoaded: true // prevent reloadGroupNode
      };
    }

    // First we add a new answer to the group.guestions
    // After user clicks Save, we call createAnswer 
    case ActionTypes.ADD_ANSWER: {
      const { groupInfo } = action.payload;
      const { id, level } = groupInfo;
      const answer: IAnswer = {
        ...initialAnswer,
        partitionKey: id,
        parentGroup: id,
        inAdding: true
      }
      return {
        ...state,
        groups: state.groups.map(c => c.id === id
          ? { ...c, answers: [answer, ...c.answers], inAdding: true, numOfAnswers: c.numOfAnswers + 1 }
          : { ...c, inAdding: false }),
        mode: Mode.AddingAnswer
      };
    }

    case ActionTypes.SET_ANSWER: {
      const { answer } = action.payload;
      const { parentGroup, id } = answer;
      const inAdding = state.mode === Mode.AddingAnswer;

      // for inAdding, id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q.id === id

      console.log('ActionTypes.SET_ANSWER', answer)
      console.log('ActionTypes.SET_ANSWER', state.groups)
      const groups = state.groups.map(g => g.id === parentGroup
        ? {
          ...g,
          answers: inAdding
            ? g.answers.map(a => a.inAdding ? { ...answer, inAdding: false } : a)
            : g.answers.map(a => a.id === id ? { ...answer, inEditing: a.inEditing, inViewing: a.inViewing } : a),
          inViewing: false,
          inEditing: false,
          inAdding: false
        }
        : g
      );
      return {
        ...state,
        groups,
        mode: Mode.NULL,
        error: undefined,
        loading: false
      };
    }

    case ActionTypes.SET_ANSWER_AFTER_ASSIGN_ANSWER: {
      const { answer } = action.payload;
      const { parentGroup, id } = answer;
      const inAdding = state.mode === Mode.AddingAnswer;

      // for inAdding, _id is IDBValidKey('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      const groups = state.groups.map(c => c.id === parentGroup
        ? {
          ...c,
          answers: inAdding
            ? c.answers.map(q => q.inAdding ? { ...answer, inAdding: q.inAdding } : q)
            : c.answers.map(q => q.id === id ? { ...answer, inEditing: q.inEditing } : q), // TODO sta, ako je inViewing
          inEditing: c.inEditing,
          inAdding: c.inAdding
        }
        : c
      );
      return {
        ...state,
        groups,
        mode: state.mode, // keep mode
        loading: false
      };
    }

    case ActionTypes.VIEW_ANSWER: {
      const { answer } = action.payload;
      return {
        ...state,
        groups: state.groups.map(c => c.id === answer.parentGroup
          ? {
            ...c,
            answers: c.answers.map(q => q.id === answer.id
              ? {
                ...answer,
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
        mode: Mode.ViewingAnswer,
        loading: false,
        groupId: answer.parentGroup,
        answerId: answer.id,
      }
    }

    case ActionTypes.EDIT_ANSWER: {
      const { answer } = action.payload;
      const obj = {
        ...state,
        groups: state.groups.map(g => g.id === answer.parentGroup
          ? {
            ...g,
            answers: g.answers.map((q: IAnswer) => q.id === answer.id
              ? {
                ...answer,
                inEditing: true
              }
              : {
                ...q,
                inEditing: false
              }),
            inEditing: true
          }
          : {
            ...g,
            inEditing: false
          }
        ),
        mode: Mode.EditingAnswer,
        loading: false,
        groupId: answer.parentGroup,
        answerId: answer.id,
      }
      return obj;
    }

    case ActionTypes.DELETE_ANSWER: {
      const { answer } = action.payload;
      const { parentGroup, id } = answer;
      return {
        ...state,
        groups: state.groups.map(c => c.id === parentGroup
          ? {
            ...c,
            answers: c.answers.filter(q => q.id !== id)
          }
          : c
        ),
        mode: Mode.NULL
      }
    }

    case ActionTypes.CANCEL_ANSWER_FORM:
    case ActionTypes.CLOSE_ANSWER_FORM: {
      console.log('PAYYYYYYYYYYYYYYYY', action.payload)
      const { answer } = action.payload;
      const group = state.groups.find(c => c.id === answer.parentGroup)
      let answers: IAnswer[] = [];
      switch (state.mode) {
        case Mode.AddingAnswer: {
          console.assert(group!.inAdding, "expected group.inAdding");
          answers = group!.answers.filter(q => !q.inAdding)
          break;
        }

        case Mode.ViewingAnswer: {
          console.assert(group!.inViewing, "expected group.inViewing");
          answers = group!.answers.map(q => ({ ...q, inViewing: false }))
          break;
        }

        case Mode.EditingAnswer: {
          console.assert(group!.inEditing, "expected group.inEditing");
          answers = group!.answers.map(q => ({ ...q, inEditing: false }))
          break;
        }

        default:
          break;
      }

      return {
        ...state,
        groups: state.groups.map(c => c.id === answer.parentGroup
          ? { ...c, answers, numOfAnswers: answers.length, inAdding: false, inEditing: false, inViewing: false }
          : c
        ),
        mode: Mode.NULL
      };
    }

    default:
      return state;  // TODO throw error
  }
};

function markForClean(groups: IGroup[], groupKey: IGroupKey) {
  const { id } = groupKey;
  let deca = groups
    .filter(c => c.parentGroup === id)
    .map(c => ({ partitionKey: '', id: c.id }))

  deca.forEach(c => {
    const groupKey = { partitionKey: '', id: c.id }
    deca = deca.concat(markForClean(groups, groupKey))
  })
  return deca
}
