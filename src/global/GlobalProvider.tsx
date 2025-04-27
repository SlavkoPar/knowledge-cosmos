import React, { createContext, useContext, useReducer, Dispatch, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import {
  IGlobalContext, ILoginUser, ROLES, GlobalActionTypes,
  ICategoryData, IQuestionData,
  IGroupData, IAnswerData,
  IRoleData, IUserData,
  IRegisterUser,
  ICat, IShortGroup,
  IParentInfo,
  IWhoWhen,
  ICatExport,
  IHistory, IHistoryDtoEx, IHistoryData, HistoryDto, History,
  IAnswerRating,
  IHistoryDtoListEx,
  IHistoryListEx,
  IAnswerRatings
} from 'global/types'

import { globalReducer, initialGlobalState } from "global/globalReducer";

import { Category, IAssignedAnswer, ICategory, ICategoryDto, ICategoryKey, IQuest, IQuestDto, IQuestion, IQuestionDto, IQuestionDtoEx, IQuestionKey, Question } from "categories/types";
import { Group, IGroup, IGroupDto, IGroupKey, IAnswer, IAnswerDto, IAnswerKey, IShortAnswer, IShortAnswerDto, Answer } from "groups/types";
import { IUser } from 'global/types';

import { IDBPDatabase, IDBPIndex, openDB } from 'idb' // IDBPTransaction
import { escapeRegexCharacters } from 'common/utilities'

//////////////////
// Initial data
import groupData from './groups-answers.json';
import roleData from './roles-users.json';
import historyData from './history.json';
import useFetchWithMsal from "hooks/useFetchWithMsal";
import { protectedResources } from "authConfig";

const GlobalContext = createContext<IGlobalContext>({} as any);
const GlobalDispatchContext = createContext<Dispatch<any>>(() => null);

interface Props {
  children: React.ReactNode
}

export const GlobalProvider: React.FC<Props> = ({ children }) => {
  // If we update globalState, form inner Provider, 
  // we reset changes, and again we use initialGlobalState
  // so, don't use globalDispatch inside of inner Provider, like Categories Provider
  const [globalState, dispatch] = useReducer(globalReducer, initialGlobalState);

  console.log('--------> GlobalProvider')

  const Execute = async (method: string, endpoint: string, data: Object | null = null): Promise<any> => {
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
              dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error: new Error(`Response status: ${response.status}`) } });
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
          dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
        }
      }
      catch (e) {
        console.log('-------------->>> execute', method, endpoint, e)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error: new Error(`fetch eror`) } });
      }
    }
    return null;
  }
  // }, [dispatch]);
  const getUser = async (nickName: string) => {
    try {
      const { dbp } = globalState;
      const user: IUser = await dbp!.get("Users", nickName);
      return user;
    }
    catch (error: any) {
      console.log(error);
      return undefined;
    }
  }

  const addInitialData = async (dbp: IDBPDatabase): Promise<void> => {

  }

  // ---------------------------
  // load all short categories
  // ---------------------------
  const loadCats = useCallback(async (): Promise<any> => {
    const { catsLoaded } = globalState;
    if (catsLoaded) {
      var diffMs = (Date.now() - catsLoaded!); // milliseconds between
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
      console.log({ diffMins })
      if (diffMins < 30)
        return;
    }
    return new Promise(async (resolve) => {
      try {
        console.time();
        await Execute("GET", protectedResources.KnowledgeAPI.endpointCategory, null).then((response: ICategoryDto[] | Response) => {
          console.log({ response }, protectedResources.KnowledgeAPI.endpointCategory)
          const categories = new Map<string, ICategory>();
          const cats = new Map<string, ICat>();
          console.timeEnd();
          if (response instanceof Response) {
            throw (response);
          }
          const data: ICategoryDto[] = response;
          data.forEach((categoryDto: ICategoryDto) => categories.set(categoryDto.Id, new Category(categoryDto).category));
          //
          categories.forEach(category => {
            const { partitionKey, id, parentCategory, title, variations, hasSubCategories, kind } = category;
            let titlesUpTheTree = id;
            let parentCat = parentCategory;
            while (parentCat) {
              const cat2 = categories.get(parentCat)!;
              titlesUpTheTree = cat2!.id + ' / ' + titlesUpTheTree;
              parentCat = cat2.parentCategory;
            }
            category.titlesUpTheTree = titlesUpTheTree;
            const cat: ICat = {
              partitionKey,
              id,
              parentCategory: parentCat,
              title: title,
              // words: title.toLowerCase().replaceAll('?', '').split(' ').map((s: string) => s.trim()).filter(w => w.length > 1),
              titlesUpTheTree: '',
              variations: variations,
              hasSubCategories: hasSubCategories,
              kind: kind
            }
            cats.set(id, cat);
          })
          dispatch({ type: GlobalActionTypes.SET_ALL_CATEGORIES, payload: { cats } });
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
      resolve(true);
    });
  }, [dispatch]);

  //const searchQuestions = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number): Promise<any> => {
  const searchQuestions = async (filter: string, count: number): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const filterEncoded = encodeURIComponent(filter);
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${filterEncoded}/${count}/null`;
        await Execute("GET", url).then((questDtos: IQuestDto[] | undefined) => {
          console.log({ questDtos }, protectedResources.KnowledgeAPI.endpointCategory);
          console.timeEnd();
          if (questDtos) {
            const listQuest: IQuest[] = questDtos.map((q: IQuestDto) => ({
              partitionKey: q.PartitionKey,
              id: q.Id,
              parentCategory: q.ParentCategory,
              title: q.Title
            }))
            resolve(listQuest);
          }
          else {
            // reject()
            console.log('no rows in search')
          }
        })
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    });
  }
  //}, []);

  const loadShortGroups = useCallback(async (): Promise<any> => {
    const { shortGroupsLoaded } = globalState;
    if (shortGroupsLoaded) {
      var diffMs = (Date.now() - shortGroupsLoaded!); // milliseconds between
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
      console.log({ diffMins })
      if (diffMins < 30)
        return;
    }
    return new Promise(async (resolve) => {
      try {
        console.time();
        await Execute("GET", protectedResources.KnowledgeAPI.endpointGroup, null).then((response: IGroupDto[] | Response) => {
          console.log({ response }, protectedResources.KnowledgeAPI.endpointShortGroup)
          const groups = new Map<string, IGroup>();
          const shortGroups = new Map<string, IShortGroup>();
          console.timeEnd();
          if (response instanceof Response) {
            throw (response);
          }
          const data: IGroupDto[] = response;
          data.forEach((groupDto: IGroupDto) => groups.set(groupDto.Id, new Group(groupDto).group));
          //
          groups.forEach(group => {
            const { partitionKey, id, parentGroup, title, variations, hasSubGroups, kind } = group;
            let titlesUpTheTree = id;
            let parentShortGroup = parentGroup;
            while (parentShortGroup) {
              const shortGroup2 = groups.get(parentShortGroup)!;
              titlesUpTheTree = shortGroup2!.id + ' / ' + titlesUpTheTree;
              parentShortGroup = shortGroup2.parentGroup;
            }
            group.titlesUpTheTree = titlesUpTheTree;
            const shortGroup: IShortGroup = {
              groupKey: { partitionKey, id },
              parentGroup: parentShortGroup,
              title: title,
              titlesUpTheTree: '',
              variations: variations,
              hasSubGroups,
              kind: kind
            }
            shortGroups.set(id, shortGroup);
          })
          dispatch({ type: GlobalActionTypes.SET_ALL_GROUPS, payload: { shortGroups } });
        });
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
      resolve(true);
    });
  }, [dispatch]);

  const getSubGroups = useCallback(async (groupKey: IGroupKey) => {
    return new Promise(async (resolve) => {
      const { partitionKey, id } = groupKey;
      try {
        //dispatch({ type: GlobalActionTypes.SET_LOADING, payload: {} });
        const url = `${protectedResources.KnowledgeAPI.endpointGroup}/${partitionKey}/${id}`;
        console.log('calling getSubCategories:', url)
        console.time();
        await Execute("GET", url).then((groupDtos: IGroupDto[]) => {
          console.timeEnd();
          const subCategories = groupDtos!.map((groupDto: IGroupDto) => new Group(groupDto).group);
          const subGroups = subCategories.map((c: IGroup) => ({
            ...c,
            answers: [],
            isExpanded: false
          }))
          resolve(subGroups);
        });
      }
      catch (error: any) {
        console.log(error)
        resolve([]);
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, []);

  //const searchAnswers = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number): Promise<any> => {
  const searchAnswers = async (filter: string, count: number): Promise<any> => {
    const { shortGroups } = globalState;

    return new Promise(async (resolve) => {
      try {
        console.time();
        const filterEncoded = encodeURIComponent(filter);
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${filterEncoded}/${count}/null`;
        await Execute("GET", url).then((shortAnswerDtoList: IShortAnswerDto[]) => {
          console.log({ questDtos: shortAnswerDtoList }, protectedResources.KnowledgeAPI.endpointGroup);
          console.timeEnd();
          if (shortAnswerDtoList) {
            const shortAnswers: IShortAnswer[] = shortAnswerDtoList.map((shortAnswerDto: IShortAnswerDto) => {
              const { PartitionKey, Id, ParentGroup, Title } = shortAnswerDto;
              //const group = shortGroups.get(ParentGroup);
              return {
                partitionKey: PartitionKey,
                id: Id,
                parentGroup: ParentGroup,
                title: Title
                //groupTitle: group ? group.title : 'Not found'
              }
            })
            resolve(shortAnswers);
          }
          else {
            // reject()
            console.log('no rows in search')
          }
        })
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    });
  }



  const OpenDB = useCallback(async (): Promise<any> => {
    try {
      await loadCats();
      console.log(111111111111)
      await loadShortGroups();
      console.log(22222)
      return true;
    }
    catch (err: any) {
      console.log(err);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new Error("Greska Teska")
        }
      });
      return false;
    }
  }, []);

  const joinAssignedAnswers = async (assignedAnswers: IAssignedAnswer[]): Promise<IAssignedAnswer[]> => {
    const arr: IAssignedAnswer[] = [];
    try {
      // // join answer.title
      // let i = 0;
      // while (i < assignedAnswers.length) {
      //   const assignedAnswer = assignedAnswers[i];
      //   const answer: IAnswer = await dbp!.get("Answers", assignedAnswer.answer.id);
      //   const title = answer ? answer.title : "Answer doesn't exist any more";
      //   arr.push({ ...assignedAnswer, answer: { ...assignedAnswer.answer, title } });
      //   i++;
      // }
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: error });
    }
    return arr;
  }

  // differs from CategoryProvider, here we don't dispatch
  const getQuestion = async (questionKey: IQuestionKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { partitionKey, id } = questionKey;
        //const url = `${process.env.REACT_APP_API_URL}/Question/${parentCategory}/${id}`;
        //console.log(`FETCHING --->>> ${url}`)
        //dispatch({ type: GlobalActionTypes.SET_LOADING, payload: {} })
        console.time()
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${partitionKey}/${id}`;
        await Execute("GET", url)
          .then((questionDtoEx: IQuestionDtoEx) => {
            console.timeEnd();
            console.log({ questionDtoEx });
            const { questionDto, msg } = questionDtoEx;
            const question: IQuestion = new Question(questionDto!).question;
            // if (questionDto) {
            // }
            // else {
            // }
            console.log('QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', { question })
            resolve(question);
          });


      }
      catch (error: any) {
        console.log(error);
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: error });
      }
    });
  }

  const getCatsByKind = async (kind: number): Promise<ICat[]> => {
    try {
      const { cats } = globalState;
      const categories: ICat[] = [];
      cats.forEach((c, id) => {
        if (c.kind === kind) {
          const { partitionKey, id, title } = c;
          const cat: ICat = {
            partitionKey,
            id: id,
            title,
            parentCategory: "",
            titlesUpTheTree: "",
            variations: [],
            hasSubCategories: false,
            kind: kind
          }
          categories.push(cat);
        }
      })
      return categories;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Select Category
  // TOD mozda ne mora iz baze
  const getSubCatsWas = async ({ parentCategory, level }: IParentInfo): Promise<any> => {
    try {
      const { dbp } = globalState;
      const tx = dbp!.transaction('Categories')
      const index = tx.store.index('parentCategory_idx');
      const list: ICategory[] = [];
      for await (const cursor of index.iterate(parentCategory)) {
        console.log(cursor.value);
        list.push(cursor.value)
      }
      await tx.done;
      const subCats = list.map((c: ICategory) => ({
        ...c,
        questions: [],
        isExpanded: false
      }))
      return subCats;


      // const url = `/api/categories/${wsId}-${parentCategory}`
      // const res = await axios.get(url)
      // const { status, data } = res;
      // if (status === 200) {
      //   const subCategories = data.map((c: ICategory) => ({
      //     ...c,
      //     questions: [],
      //     isExpanded: false
      //   }))
      //   return subCategories;
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
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error: err } });
    }
  }


  const getSubCats = useCallback(async (categoryKey: ICategoryKey) => {
    return new Promise(async (resolve) => {
      const { partitionKey, id } = categoryKey;
      try {
        //dispatch({ type: GlobalActionTypes.SET_LOADING, payload: {} });
        const url = `${protectedResources.KnowledgeAPI.endpointCategory}/${partitionKey}/${id}`;
        console.log('calling getSubCategories:', url)
        console.time();
        await Execute("GET", url).then((categoryDtos: ICategoryDto[]) => {
          console.timeEnd();
          const subCategories = categoryDtos!.map((categoryDto: ICategoryDto) => new Category(categoryDto).category);
          const subCats = subCategories.map((c: ICategory) => ({
            ...c,
            questions: [],
            isExpanded: false
          }))
          resolve(subCats);
        });
      }
      catch (error: any) {
        console.log(error)
        resolve([]);
        //dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
      }
    })
  }, []);


  const exportToObj = async (index: IDBPIndex<unknown, ["Categories"], "Categories", "parentCategory_idx", "readonly">,
    category: ICategory) => {
    try {
      category.categories = [];
      for await (const cursor of index.iterate(category.id)) {
        const cat: ICategory = cursor.value;
        await exportToObj(index, cat);
        category.categories.push(cat);
      }
    }
    catch (error: any | Error) {
      console.log(error);
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
  }

  const exportToJSON = async (category: ICategory) => {
    try {
      const { dbp } = globalState;
      const tx = dbp!.transaction('Categories')
      const index = tx.store.index('parentCategory_idx');
      await exportToObj(index, category);
      await tx.done;
    }
    catch (error: any | Error) {
      console.log(error);
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
  }

  const health = () => {
    const url = `api/health`;
    // axios
    //   .post(url)
    //   .then(({ status }) => {
    //     if (status === 200) {
    //       console.log('health successfull:', status)
    //     }
    //     else {
    //       console.log('Status is not 200', status)
    //     }
    //   })
    //   .catch((err: any | Error) => {
    //     console.log(err);
    //   });
  };

  const getAnswer = async (answerKey: IAnswerKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { partitionKey, id } = answerKey;
        //const url = `${process.env.REACT_APP_API_URL}/Answer/${parentGroup}/${id}`;
        //console.log(`FETCHING --->>> ${url}`)
        //dispatch({ type: GlobalActionTypes.SET_LOADING, payload: {} })
        console.time()
        /*
        axios
          .get(url, {
            withCredentials: false,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': "*"
            }
          })
          .then(({ data: answerDto }) => {
            const categories: IGroup[] = [];
            console.timeEnd();
            const answer: IAnswer = new Answer(answerDto, parentGroup).answer;
            answer.groupTitle = 'nadji me';
            resolve(answer);
          })
          .catch((error) => {
            console.log('FETCHING --->>>', error);
          });
        */
        const url = `${protectedResources.KnowledgeAPI.endpointAnswer}/${partitionKey}/${id}`;
        await Execute("GET", url).then((answerDto: IAnswerDto) => {
          console.timeEnd();
          console.log({ response: answerDto });
          const answer: IAnswer = new Answer(answerDto).answer;
          resolve(answer);
        });


      }
      catch (error: any) {
        console.log(error);
        dispatch({ type: GlobalActionTypes.SET_ERROR, payload: error });
      }
    });
  }

  const getGroupsByKind = async (kind: number): Promise<IShortGroup[]> => {
    try {
      const { shortGroups } = globalState;
      const groups: IShortGroup[] = [];
      shortGroups.forEach((g, id) => {
        if (g.kind === kind) {
          const { groupKey, title } = g;
          const { partitionKey, id } = groupKey;
          const shortGroup: IShortGroup = {
            groupKey: { partitionKey, id },
            title,
            parentGroup: "",
            titlesUpTheTree: "",
            variations: [],
            hasSubGroups: false,
            kind: kind
          }
          groups.push(shortGroup);
        }
      })
      return groups;
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: { error } });
    }
    return [];
  }

  const addHistory = useCallback(
    async (history: IHistory) => {
      //const { partitionKey, id, variations, title, kind, modified } = history;
      //dispatch({ type: ActionTypes.SET_CATEGORY_LOADING, payload: { id, loading: false } });
      try {
        const historyDto = new HistoryDto(history).historyDto;
        console.log("historyDto", { historyDto })
        const url = `${protectedResources.KnowledgeAPI.endpointHistory}`;
        console.time()
        await Execute("POST", url, historyDto)
          .then(async (historyDtoEx: IHistoryDtoEx | null) => {
            console.timeEnd();
            if (historyDtoEx) {
              const { historyDto } = historyDtoEx;
              if (historyDto) {
                const history = new History(historyDto).history;
                console.log('History successfully created')
                // dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...category, questions: [] } } });
                // dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
                await loadCats(); // reload
              }
            }
          });
      }
      catch (error: any) {
        console.log(error)
        //dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error('Server Error') } });
      }
    }, []);

  const compareFn = (a: IAnswerRating, b: IAnswerRating): number => {
    if (a.fixed > b.fixed) {
      return -1;
    }
    else if (a.fixed < b.fixed) {
      return 1;
    }

    if (a.Undefined > b.Undefined) {
      return -1;
    }
    else if (a.Undefined < b.Undefined) {
      return 1;
    }

    if (a.notFixed > b.notFixed) {
      return -1;
    }
    else if (a.notFixed < b.notFixed) {
      return 1;
    }

    // a must be equal to b
    return 0;
  }

  const getAnswersRated = async (questionId: string): Promise<IAnswerRatings> => { // IAnswerRating[]
    const mapAnswerRating = new Map<string, IAnswerRating>();
    try {
      console.log("getAnswersRated", { questionId })
      const url = `${protectedResources.KnowledgeAPI.endpointHistory}`;
      console.time()
      //const historyListEx: IHistoryListEx = { historyList: [], msg: "" };
      const answerRatings: IAnswerRatings = { ratings: [], msg: "" }
      await Execute("GET", url)
        .then(async (historyDtoListEx: IHistoryDtoListEx) => {
          console.timeEnd();
          const { historyDtoList, msg } = historyDtoListEx;
          if (historyDtoList) {
            const historyList = historyDtoList.map(historyDto => new History(historyDto).history);
            historyList.forEach(history => {
              const { answerId, fixed } = history;
              if (!mapAnswerRating.has(answerId)) {
                mapAnswerRating.set(answerId, { fixed: fixed === true ? 1 : 0, notFixed: fixed === false ? 1 : 0, Undefined: fixed === undefined ? 1 : 0 });
              }
              else {
                const answerRating = mapAnswerRating.get(answerId);
                switch (fixed) {
                  case true:
                    answerRating!.fixed++;
                    break;
                  case false:
                    answerRating!.notFixed++;
                    break;
                  case undefined:
                    answerRating!.Undefined++;
                    break;
                  default:
                    alert('unk rate')
                    break;
                }
                mapAnswerRating.set(answerId, answerRating!);
              }
              const arr: IAnswerRating[] = [];
              mapAnswerRating.forEach((value, key) => {
                arr.push({ answerId: key, ...value })
              })
              answerRatings.ratings = arr.sort(compareFn);
            })
          }
          else {
            answerRatings.msg = msg;
          }
        });
      return answerRatings;
    }
    catch (error: any) {
      console.log(error);
      return { ratings: [], msg: "Server problemos" }
    }
  }

  useEffect(() => {
    (async () => {
      await OpenDB();
    })()
  }, [OpenDB])

  return (
    <GlobalContext.Provider value={{
      globalState, OpenDB,
      getUser, exportToJSON, health,
      joinAssignedAnswers,
      loadCats, getSubCats, getCatsByKind, searchQuestions, getQuestion,
      loadShortGroups, getSubGroups, getGroupsByKind, searchAnswers, getAnswer,
      addHistory, getAnswersRated
    }}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}

export const useGlobalDispatch = () => {
  return useContext(GlobalDispatchContext)
}

export const useGlobalState = () => {
  const { globalState } = useGlobalContext()
  return globalState;
}
