import { useGlobalState } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';


import {
  ActionTypes, IGroup, IAnswer, IGroupsContext, IParentInfo, IFromUserAssignedAnswer
} from 'groups/types';
import { initialGroupsState, GroupsReducer } from 'groups/GroupsReducer';
import { IDateAndBy } from 'global/types';

const GroupsContext = createContext<IGroupsContext>({} as any);
const GroupDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const GroupProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { dbp } = globalState;

  const [state, dispatch] = useReducer(GroupsReducer, initialGroupsState);
  const { parentNodes } = state;
  const { parentNodesIds } = parentNodes!;

  const reloadGroupNode = useCallback(async (groupId: string, answerId: string | null): Promise<any> => {
    try {
      const ids: { id: string, title: string }[] = [];
      let group = await dbp!.get("Groups", groupId);
      if (group) {
        ids.push({ id: group.id, title: group.title });
      }
      while (group && group.parentGroup !== 'null') {
        group = await dbp!.get("Groups", group.parentGroup);
        if (group) {
          ids.push({ id: group.id, title: group.title })
        }
      }
      dispatch({
        type: ActionTypes.SET_PARENT_GROUPS, payload: {
          parentNodes: {
            groupId,
            answerId,
            parentNodesIds: ids.map(c => c.id)
          }
        }
      })

      // const res = await axios.get(`/api/groups/get-parent-groups/${groupId}`);
      // const { status, data } = res;
      // if (status === 200) {
      //   console.log('!!! get-parent-groups', { cId: groupId.toString(), data })
      //   dispatch({
      //     type: ActionTypes.SET_PARENT_GROUPS, payload: {
      //       parentNodes: {
      //         groupId,
      //         answerId,
      //         parentNodesIds: data.map((c: { _id: string, title: string }) => c._id)
      //       }
      //     }
      //   })
      // }
    }
    catch (err) {
      console.error(err);
    }
    return false;
  }, [dispatch]);

  const getSubCats = useCallback(async ({ parentGroup, level }: IParentInfo): Promise<any> => {
    try {

      try {
        const tx = dbp!.transaction('Groups')
        const index = tx.store.index('parentGroup_idx');
        const list: IGroup[] = [];
        for await (const cursor of index.iterate(parentGroup)) {
          console.log(cursor.value);
          list.push(cursor.value)
        }
        await tx.done;
        const subCats = list.map((c: IGroup) => ({
          ...c,
          answers: [],
          isExpanded: false
        }))
        return subCats;
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }

      // const url = `/api/groups/${wsId}-${parentGroup}`
      // const res = await axios.get(url)
      // const { status, data } = res;
      // if (status === 200) {
      //   const subGroups = data.map((c: IGroup) => ({
      //     ...c,
      //     answers: [],
      //     isExpanded: false
      //   }))
      //   return subGroups;
      // }
      // else {
      //   console.log('Status is not 200', status)
      //   dispatch({
      //     type: ActionTypes.SET_ERROR,
      //     payload: { error: new Error('Status is not 200 status:' + status) }
      //   });
      // }
    }
    catch (err: any | Error) {
      console.log(err);
    }
  }, []);

  const getSubGroups = useCallback(async ({ parentGroup, level }: IParentInfo) => {
    //const url = `/api/groups/${wsId}-${parentGroup}`
    try {
      const tx = dbp!.transaction('Groups')
      const index = tx.store.index('parentGroup_idx');
      const list: IGroup[] = [];
      for await (const cursor of index.iterate(parentGroup)) {
        const group: IGroup = cursor.value;
        console.log(group);
        // const index = tx.store.index('parentGroup_idx');
        // const arr = await index.getAllKeys(group.id);
        // group.hasSubGroups = arr.length > 0;
        list.push(group);
      }
      await tx.done;
      const subGroups = list.map((c: IGroup) => ({
        ...c,
        answers: [],
        isExpanded: parentNodesIds ? parentNodesIds.includes(c.id) : false
      }))
      dispatch({ type: ActionTypes.SET_SUB_GROUPS, payload: { subGroups } });
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    //console.log('FETCHING --->>> getSubGroups', level, parentGroup)
    //dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data }) => {
    //     const subGroups = data.map((c: IGroup) => ({
    //       ...c,
    //       answers: [],
    //       isExpanded: parentNodesIds ? parentNodesIds.includes(c._id!.toString()) : false
    //     }))
    //     dispatch({ type: ActionTypes.SET_SUB_GROUPS, payload: { subGroups } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  }, [parentNodesIds]);

  const createGroup = useCallback(async (group: IGroup) => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    try {
      await dbp!.add('Groups', group);
      console.log('Group successfully created')
      dispatch({ type: ActionTypes.SET_ADDED_GROUP, payload: { group: { ...group, answers: [] } } });
      dispatch({ type: ActionTypes.CLOSE_GROUP_FORM })
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);

  const setGroup = async (id: string, type: ActionTypes.SET_GROUP) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!dbp) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("db is null") } });
      return;
    }
    const group = await dbp.get("Groups", id);
    dispatch({ type, payload: { group: { ...group } } });
  };

  const getGroup = async (id: string, type: ActionTypes.VIEW_GROUP | ActionTypes.EDIT_GROUP) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!dbp) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("db is null") } });
      return;
    }
    const group: IGroup = await dbp.get("Groups", id);
    //      hasMore: true
    dispatch({
      type, payload: {
        group: {
          ...group
        }
      }
    });
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data: group }) => {
    //     dispatch({ type, payload: { group } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const viewGroup = useCallback((id: string) => {
    getGroup(id, ActionTypes.VIEW_GROUP)
  }, []);

  const editGroup = useCallback((id: string) => {
    getGroup(id, ActionTypes.EDIT_GROUP)
  }, []);

  const updateGroup = useCallback(async (c: IGroup) => {
    const { id } = c;
    dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
    try {
      const group = await dbp!.get('Groups', id);
      const obj: IGroup = {
        ...group,
        title: c.title,
        modified: c.modified
      }
      await dbp!.put('Groups', obj);
      console.log("Group successfully updated");
      dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { group: obj } });
      dispatch({ type: ActionTypes.SET_GROUP, payload: { group: obj } });
      dispatch({ type: ActionTypes.CLOSE_GROUP_FORM })
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);

  const deleteGroup = async (id: string) => {
    try {
      const group = await dbp!.delete('Groups', id);
      console.log("Group successfully deleted");
      dispatch({ type: ActionTypes.DELETE, payload: { id } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };

  const expandGroup = async (group: IGroup, expanding: boolean) => {
    const { id, numOfAnswers, answers } = group;
    try {
      // if (numOfAnswers > 0 && answers.length === 0) {
      //   await loadGroupAnswers({ parentGroup: id, startCursor: 0, level: 0 });
      // }
      dispatch({ type: ActionTypes.SET_EXPANDED, payload: { id, expanding } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };


  /////////////
  // Answers
  //

  const pageSize = 12;
  const loadGroupAnswers = useCallback(async ({ parentGroup, startCursor, includeAnswerId }: IParentInfo)
    : Promise<any> => {
    const answers: IAnswer[] = [];
    try {
      dispatch({ type: ActionTypes.SET_GROUP_ANSWERS_LOADING, payload: { answerLoading: true } }) // id: parentGroup,
      let n = 0;
      let included = false;
      let hasMore = false;
      let advanced = false;
      console.time();
      const tx = dbp!.transaction('Answers', 'readonly');
      const index = tx.store.index('parentGroup_title_idx');
      for await (const cursor of index.iterate(IDBKeyRange.bound([parentGroup, ''], [parentGroup, 'zzzzz'], true, true))) {
        if (startCursor! > 0 && !advanced) {
          cursor.advance(startCursor!);
          advanced = true;
        }
        else {
          console.log(cursor.value.title);
          answers.push({ ...cursor.value, id: cursor.primaryKey })
          n++;
          if (includeAnswerId && cursor.primaryKey === includeAnswerId)
            included = true;
          if (n >= pageSize && (includeAnswerId ? included : true)) {
            hasMore = true;
            break;
          }
        }
      }
      await tx.done;
      console.log('>>>loadGroupAnswers of:', parentGroup, answers)
      console.timeEnd();
      dispatch({ type: ActionTypes.LOAD_GROUP_ANSWERS, payload: { parentGroup, answers, hasMore } });
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      dispatch({ type: ActionTypes.SET_GROUP_ANSWERS_LOADING, payload: { answerLoading: false } })
    }
    return true;

  }, []);


  const createAnswer = useCallback(async (answer: IAnswer, fromModal: boolean): Promise<any> => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    try {
      const tx = dbp!.transaction(['Groups', 'Answers'], 'readwrite');
      const id = await tx.objectStore('Answers').add(answer);
      answer.id = parseInt(id.toString());
      console.log('Answer successfully created')
      const group: IGroup = await tx.objectStore('Groups').get(answer.parentGroup);
      group.numOfAnswers += 1;
      await tx.objectStore('Groups').put(group);
      // TODO check setting inViewing, inEditing, inAdding to false
      dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer } });
      return answer;
    }
    catch (error: any) {
      console.log('error', error);
      if (fromModal)
        return { message: 'Something is wrong' };
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      return {};
    }
  }, []);


  const getAnswer = async (id: number, type: ActionTypes.VIEW_ANSWER | ActionTypes.EDIT_ANSWER) => {
    // const url = `/api/answers/get-answer/${id}`;
    try {
      const answer: IAnswer = await dbp!.get("Answers", id);
      const { parentGroup } = answer;
      const group: IGroup = await dbp!.get("Groups", parentGroup)
      answer.id = id;
      answer.groupTitle = group.title;
      // if (group.numOfAnswers > 0) {
      //   await loadGroupAnswers({ parentGroup, startCursor: 0, level: 0 });
      // }
      dispatch({ type, payload: { answer } });
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }

    //console.log(`FETCHING --->>> ${url}`)
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data }) => {
    //     const answer: IAnswer = data;
    //     const { fromUserAssignedAnswer } = answer;
    //     answer.answerAnswers.forEach(answerAnswer => {
    //       const user = fromUserAssignedAnswer!.find((fromUser: IFromUserAssignedAnswer) => fromUser._id === answerAnswer.assigned.by.userId);
    //       answerAnswer.user.createdBy = user ? user.createdBy : 'unknown'
    //     })
    //     delete answer.fromUserAssignedAnswer;
    //     dispatch({ type, payload: { answer } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const viewAnswer = useCallback((id: number) => {
    getAnswer(id, ActionTypes.VIEW_ANSWER);
  }, []);

  const editAnswer = useCallback((id: number) => {
    getAnswer(id, ActionTypes.EDIT_ANSWER);
  }, []);

  const updateAnswer = useCallback(async (q: IAnswer): Promise<any> => {
    const { id } = q;
    //dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
    try {
      const answer = await dbp!.get('Answers', id!);
      const obj: IAnswer = {
        ...answer,
        title: q.title,
        modified: q.modified,
        source: q.source,
        status: q.status
      }
      await dbp!.put('Answers', obj, id);
      console.log("Answer successfully updated");
      obj.id = id;
      dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer: obj } });
      return obj;
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    // try {
    //   const url = `/api/answers/update-answer/${answer._id}`
    //   const res = await axios.put(url, answer)
    //   const { status, data } = res;
    //   if (status === 200) {
    //     // TODO check setting inViewing, inEditing, inAdding to false
    //     console.log("Answer successfully updated");
    //     dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer: data } });
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


  const deleteAnswer = async (id: number, parentGroup: string) => {
    dispatch({ type: ActionTypes.SET_LOADING })
    try {
      const res = await dbp!.delete('Answers', id);
      console.log("Answer successfully deleted");
      dispatch({ type: ActionTypes.DELETE_ANSWER, payload: { id, parentGroup } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }

    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .delete(`/api/answers/delete-answer/${_id}`)
    //   .then(res => {
    //     if (res.status === 200) {
    //       console.log("Answer successfully deleted");
    //       dispatch({ type: ActionTypes.DELETE_ANSWER, payload: { answer: res.data.answer } });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const contextValue: IGroupsContext = {
    state,
    reloadGroupNode,
    getSubGroups, getSubCats, createGroup, viewGroup, editGroup, updateGroup, deleteGroup,
    expandGroup, loadGroupAnswers, createAnswer, viewAnswer, editAnswer, updateAnswer, deleteAnswer
  }
  return (
    <GroupsContext.Provider value={contextValue}>
      <GroupDispatchContext.Provider value={dispatch}>
        {children}
      </GroupDispatchContext.Provider>
    </GroupsContext.Provider>
  );
}

export function useGroupContext() {
  return useContext(GroupsContext);
}

export const useGroupDispatch = () => {
  return useContext(GroupDispatchContext)
};

