import { useGlobalState, useGlobalContext } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import {
  ActionTypes, IGroup, IAnswer, IGroupsContext, IParentInfo,
  IAssignedAnswer,
  IGroupDto, IGroupDtoEx, IGroupDtoListEx,
  IAnswerDto, IAnswerDtoEx,
  Group,
  Answer,
  IAnswerKey,
  IGroupKey,
  IGroupKeyExtended,
  GroupDto,
  AnswerDto,
  IAnswerRowDto,
} from 'groups/types';

import { initialGroupsState, GroupsReducer } from 'groups/GroupsReducer';
import { IWhoWhen, IShortGroup, Dto2WhoWhen, WhoWhen2Dto } from 'global/types';
import { protectedResources } from 'authConfig';

const GroupsContext = createContext<IGroupsContext>({} as any);
const GroupDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const GroupProvider: React.FC<Props> = ({ children }) => {

  const { loadShortGroups } = useGlobalContext()
  const globalState = useGlobalState();
  const { dbp, shortGroups } = globalState;

  const [state, dispatch] = useReducer(GroupsReducer, initialGroupsState);
  const { groupNodesUpTheTree } = state;
  console.log('----->>> GroupProvider', { initialGroupsState, groupNodesUpTheTree })

  const Execute = async (
    method: string,
    endpoint: string,
    data: Object | null = null,
    whichRowId: string | undefined = undefined
  ): Promise<any> => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        console.log({ accessToken })
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

  const reloadGroupNode = useCallback(
    async (groupKey: IGroupKey | null, answerId: string | null): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          console.log('GroupProvider.reloadGroupNode')
          const { partitionKey, id } = groupKey!;
          const shortGroup: IShortGroup | undefined = shortGroups.get(id);
          if (!shortGroup) {
            alert('reload grps' + id)
            // return
          }
          // dispatch({ type: ActionTypes.SET_LOADING })
          console.time()
          const url = `${protectedResources.KnowledgeAPI.endpointShortGroup}/${partitionKey}/${id}`;
          console.log('calling GrpController.GetGrpsUpTheTree', url)
          await Execute("GET", url)
            .then((groupDtoListEx: IGroupDtoListEx) => {
              const { groupDtoList, msg } = groupDtoListEx;
              console.timeEnd();
              const groupNodesUpTheTree = groupDtoList.map((groupDto: IGroupDto) => {
                const { PartitionKey, Id, Title } = groupDto;
                return { partitionKey: PartitionKey, id: Id, title: Title } as IGroupKeyExtended
              })
              dispatch({
                type: ActionTypes.RELOAD_GROUP_NODE, payload: {
                  groupId: id,
                  answerId,
                  groupNodesUpTheTree
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


  const getSubGroups = useCallback(async (groupKey: IGroupKey) => {
    return new Promise(async (resolve) => {
      const { partitionKey, id } = groupKey;
      try {
        dispatch({ type: ActionTypes.SET_LOADING });
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}/${partitionKey}/${id}`;
        console.log('calling getSubGroups:', url)
        console.time();
        await Execute("GET", url).then((groupDtos: IGroupDto[]) => {
          console.timeEnd();
          const subGroups = groupDtos!.map((groupDto: IGroupDto) => new Group(groupDto).group);
          dispatch({ type: ActionTypes.SET_SUB_GROUPS, payload: { subGroups } });
          resolve(true);
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, [dispatch]);


  const createGroup = useCallback(
    async (group: IGroup) => {
      const { partitionKey, id, variations, title, kind, modified } = group;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
      try {
        const groupDto = new GroupDto(group).groupDto;
        console.log("groupDto", { groupDto })
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}`;
        console.time()
        await Execute("POST", url, groupDto, id)
          .then(async (groupDtoEx: IGroupDtoEx | null) => {
            console.timeEnd();
            if (groupDtoEx) {
              const { groupDto } = groupDtoEx;
              if (groupDto) {
                const group = new Group(groupDto).group;
                console.log('Group successfully created')
                dispatch({ type: ActionTypes.SET_ADDED_GROUP, payload: { group: { ...group, answers: [] } } });
                dispatch({ type: ActionTypes.CLOSE_GROUP_FORM })
                await loadShortGroups(); // reload
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const getGroup = async (groupKey: IGroupKey, includeAnswerId: string): Promise<any> => {
    const { partitionKey, id } = groupKey;
    console.log({ groupKey, includeAnswerId })
    return new Promise(async (resolve) => {
      try {
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}/${partitionKey}/${id}/${PAGE_SIZE}/${includeAnswerId}`;
        console.time()
        await Execute("GET", url)
          .then((groupDtoEx: IGroupDtoEx) => {
            console.timeEnd();
            const { groupDto, msg } = groupDtoEx;
            if (groupDto) {
              resolve(new Group(groupDto).group);
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

  const expandGroup = useCallback(
    async (groupKey: IGroupKey, includeAnswerId: string) => {
      try {
        const group: IGroup | Error = await getGroup(groupKey, includeAnswerId); // to reload Group
        // .then(async (group: IGroup) => {
        console.log('getGroup', { group })
        if (group instanceof Error) {
          dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
          console.error({ group })
        }
        else {
          console.log('vratio getGroup', group)
          group.isExpanded = true;
          //dispatch({ type: ActionTypes.SET_GROUP, payload: { group } });
          dispatch({ type: ActionTypes.SET_EXPANDED, payload: { groupKey } });
          //await getSubGroups(execute, groupKey);
          /*
          if (numOfAnswers > 0) { // && answers.length === 0) {
            const parentInfo: IParentInfo = {
              execute,
              partitionKey,
              parentGroup: id,
              startCursor: 0,
              includeAnswerId: null //answerId ?? null
            }
            await loadGroupAnswers(parentInfo);
          }
            */
          return group;
        }
        //})
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const collapseGroup = useCallback(
    async (groupKey: IGroupKey) => {
      try {
        //dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey } });// clean subTree
        dispatch({ type: ActionTypes.SET_COLLAPSED, payload: { groupKey } });
      }
      catch (error: any) {
        console.log('error', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }
    }, [dispatch]);

  const viewGroup = useCallback(async (groupKey: IGroupKey, includeAnswerId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const group = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    else
      dispatch({ type: ActionTypes.VIEW_GROUP, payload: { group } });
  }, [dispatch]);


  const editGroup = useCallback(async (groupKey: IGroupKey, includeAnswerId: string) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    const group = await getGroup(groupKey, includeAnswerId);
    if (group instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: group } });
    else
      dispatch({ type: ActionTypes.EDIT_GROUP, payload: { group } });
  }, [dispatch]);


  const updateGroup = useCallback(
    async (group: IGroup, closeForm: boolean) => {
      const { partitionKey, id, variations, title, kind, modified } = group;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
      try {
        const groupDto = new GroupDto(group).groupDto;

        const url = `${protectedResources.KnowledgeAPI.endpointGroup}`;
        console.time()
        await Execute("PUT", url, groupDto)
          .then((response: IGroupDto | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
            }
            else {
              const groupDto: IGroupDto = response;
              if (groupDto) {
                const group = new Group(groupDto).group;
                const { id, partitionKey } = group;
                dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { groupKey: { partitionKey, id } } });
                dispatch({ type: ActionTypes.SET_GROUP, payload: { group } });
                if (closeForm) {
                  dispatch({ type: ActionTypes.CLOSE_GROUP_FORM })
                }
              }
              else {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(`Group ${id} not found!`) } });
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        return error;
      }
    }, [dispatch]);


  const deleteGroup = useCallback(async (group: IGroup) => {
    //dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id, loading: false } });
    try {
      const groupDto = new GroupDto(group).groupDto;
      const url = `${protectedResources.KnowledgeAPI.endpointGroup}` ///${groupKey.partitionKey}/${groupKey.id}`;
      console.time()
      await Execute("DELETE", url, groupDto)
        .then(async (response: any | Response) => {
          console.timeEnd();
          if (response instanceof Response) {
            console.error({ response });
            if (response.status == 404) {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Group Not Found'), whichRowId: groupDto!.Id } });
            }
          }
          else {
            const { groupDto, msg } = response as IGroupDtoEx;
            if (msg == "OK") {
              dispatch({ type: ActionTypes.DELETE, payload: { id: groupDto!.Id } });
              await loadShortGroups(); // reload
            }
            else if (msg === "HasSubGroups") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove sub groups"), whichRowId: groupDto!.Id } });
            }
            else if (msg === "NumOfAnswers") {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("First remove group answers"), whichRowId: groupDto!.Id } });
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(response), whichRowId: groupDto!.Id } });
            }
          }
        })
    }
    catch (error: any) {
      console.log(error)
      return error;
    }
  }, [dispatch]);


  const deleteGroupVariation = async (groupKey: IGroupKey, variationName: string) => {
    try {
      // const group = await dbp!.get('Groups', id);
      // const obj: IGroup = {
      //   ...group,
      //   variations: group.variations.filter((variation: string) => variation !== variationName),
      //   modified: {
      //     Time: new Date(),
      //     by: {
      //       nickName: globalState.authUser.nickName
      //     }
      //   }
      // }
      // POPRAVI TODO
      //updateGroup(obj, false);
      console.log("Group Tag successfully deleted");
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };


  ////////////////////////////////////
  // Answers
  //

  const PAGE_SIZE = 12;
  const loadGroupAnswers = useCallback(
    async ({ groupKey, startCursor, includeAnswerId }: IParentInfo)
      : Promise<any> => {
      const answerRowDtos: IAnswerRowDto[] = [];
      try {
        const partitionKey = groupKey.partitionKey;
        const parentGroup = groupKey.id;
        dispatch({ type: ActionTypes.SET_GROUP_ANSWERS_LOADING, payload: { answerLoading: true } })
        try {
          const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${partitionKey}/${parentGroup}/${startCursor}/${PAGE_SIZE}/${includeAnswerId}`;
          console.time()
          console.log('>>>>>>>>>>>>loadGroupAnswers URL:', { url })
          await Execute!("GET", url).then((groupDtoEx: IGroupDtoEx) => {
            console.timeEnd();
            const { groupDto, msg } = groupDtoEx;
            console.log('>>>>>>>>>>>>loadGroupAnswers groupDto:', { groupDto })
            if (groupDto === null)
              return null;
            const { Title, Answers, HasMoreAnswers } = groupDto;
            Answers!.forEach((answerRowDto: IAnswerRowDto) => {
              const answer = new Answer(answerRowDto).answer;
              if (includeAnswerId && answer.id === includeAnswerId) {
                answerRowDto.Included = true;
              }
              answerRowDto.GroupTitle = Title;
              answerRowDtos.push(answerRowDto);
            })
            dispatch({
              type: ActionTypes.LOAD_GROUP_ANSWERS,
              payload: { parentGroup, answerRowDtos, hasMoreAnswers: HasMoreAnswers! }
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


  const createAnswer = useCallback(
    async (answer: IAnswer) => {
      const { partitionKey, id, title, modified, parentGroup } = answer;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id: parentGroup, loading: false } });
      try {
        const answerDto = new AnswerDto(answer).answerDto;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createAnswer', answerDto)
        await Execute("POST", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx | null) => {
            console.timeEnd();
            if (answerDtoEx) {
              console.log("::::::::::::::::::::", { answerDtoEx });
              const { answerDto } = answerDtoEx;
              if (answerDto) {
                const answer = new Answer(answerDto).answer;
                console.log('Answer successfully created')
                dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer } });
                //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
                await loadShortGroups(); // reload
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const updateAnswer = useCallback(
    async (answer: IAnswer): Promise<any> => {
      const { partitionKey, id, title, modified, parentGroup } = answer;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id: parentGroup, loading: false } });
      try {
        const answerDto = new AnswerDto(answer).answerDto;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> updateAnswer', answerDto)
        let answerRet = null;
        await Execute("PUT", url, answerDto)
          .then(async (answerDtoEx: IAnswerDtoEx) => {
            console.timeEnd();
            const { answerDto, msg } = answerDtoEx;
            if (answerDto) {
              answerRet = new Answer(answerDto).answer;
              console.log('Answer successfully updated')
              dispatch({ type: ActionTypes.SET_ANSWER, payload: { answer } });
              //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
              //await loadShortGroups(); // reload, group could have been changed
              console.log('ZWWWWWWWWWWWWWWWWWeeeeeeeeeeeeeWWWWWW', answer)
            }
            else {
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error(msg) } });
            }
          });
        console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR')
        return answerRet;
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
      }
    }, [dispatch]);


  const deleteAnswer = useCallback(
    async (answer: IAnswer) => {
      const { partitionKey, id, title, modified, parentGroup } = answer;
      dispatch({ type: ActionTypes.SET_GROUP_LOADING, payload: { id: parentGroup, loading: false } });
      try {
        const answerDto = new AnswerDto(answer).answerDto;
        //answerDto.Archived = new WhoWhen2Dto(answer.archived!).whoWhenDto!;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}`;
        console.time()
        await Execute("DELETE", url, answerDto)
          .then(async (response: IAnswerDtoEx | Response) => {
            console.timeEnd();
            if (response instanceof Response) {
              console.error(response);
              dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error'), whichRowId: id } });
            }
            else {
              const answerDtoEx: IAnswerDtoEx = response;
              const { answerDto, msg } = answerDtoEx;
              if (answerDto) {
                const answer = new Answer(answerDto).answer;
                console.log('Answer successfully deleted')
                dispatch({ type: ActionTypes.DELETE_ANSWER, payload: { answer } });
                //dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM })
                await loadShortGroups(); // reload
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

  const getAnswer = async (answerKey: IAnswerKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { partitionKey, id } = answerKey;
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${partitionKey}/${id}`;
        console.time()
        await Execute("GET", url)
          .then((answerDtoEx: IAnswerDtoEx) => {
            console.timeEnd();
            // if (answerDtoEx === null) {
            //   resolve(null);
            // }
            // else {
            const { answerDto, msg } = answerDtoEx;
            const answer: IAnswer = new Answer(answerDto!).answer;
            if (answerDto) {
              resolve(answer);
            }
            else {
              resolve(new Error(msg));
            }
            //}
          });
      }
      catch (error: any) {
        console.log(error)
        resolve(error);
      }
    })
  }

  const viewAnswer = useCallback(async (answerKey: IAnswerKey) => {
    const answer: IAnswer | Error = await getAnswer(answerKey);
    if (answer instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: answer } });
    else
      dispatch({ type: ActionTypes.VIEW_ANSWER, payload: { answer } });
  }, []);

  const editAnswer = useCallback(async (answerKey: IAnswerKey) => {
    const answer: IAnswer | Error = await getAnswer(answerKey);
    if (answer instanceof Error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: answer } });
    else
      dispatch({ type: ActionTypes.EDIT_ANSWER, payload: { answer } });
  }, []);


  const contextValue: IGroupsContext = {
    state, reloadGroupNode,
    getSubGroups, createGroup, viewGroup, editGroup, updateGroup, deleteGroup, deleteGroupVariation,
    expandGroup, collapseGroup, loadGroupAnswers,
    createAnswer, viewAnswer, editAnswer, updateAnswer, deleteAnswer
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

