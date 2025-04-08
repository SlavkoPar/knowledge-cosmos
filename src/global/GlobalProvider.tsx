import React, { createContext, useContext, useReducer, Dispatch, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import {
  IGlobalContext, ILoginUser, ROLES, GlobalActionTypes,
  ICategoryData, IQuestionData,
  IGroupData, IAnswerData,
  IRoleData, IUserData,
  IRegisterUser,
  ICat,
  IParentInfo,
  IWhoWhen,
  ICatExport,
  IHistory, IHistoryData,
  IAnswerRating
} from 'global/types'

import { globalReducer, initialGlobalState } from "global/globalReducer";

import { Category, IAssignedAnswer, ICategory, ICategoryDto, IQuest, IQuestDto, IQuestion, IQuestionDto, IQuestionKey, Question } from "categories/types";
import { IGroup, IAnswer } from "groups/types";
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

  // { error, execute }
  const { execute } = useFetchWithMsal("", {  // execute is going to be used in loadCats only
    scopes: protectedResources.KnowledgeAPI.scopes.read,
  });

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

 


  const addGroup = async (
    dbp: IDBPDatabase,
    //tx: IDBPTransaction<unknown, string[], "readwrite">, 
    groupData: IGroupData,
    parentGroup: string,
    level: number)
    : Promise<void> => {
    const { id, title, groups, answers } = groupData;
    const g: IGroup = {
      id,
      parentGroup,
      hasSubGroups: groups ? groups.length > 0 : false,
      title,
      level,
      answers: [],
      numOfAnswers: answers?.length || 0,
      created: {
        date: new Date(),
        nickName: 'Boss'
      }
    }
    await dbp.add('Groups', g);
    console.log('--->group added', g);

    if (answers) {
      let i = 0;
      while (i < answers.length) {
        const a: IAnswerData = answers[i];
        const { title, source, status } = a;
        // TODO remove spec chars 
        // const escapedValue = escapeRegexCharacters(a.title.trim());
        // if (escapedValue === '') {
        // }
        //const words: string[] = a.title.toLowerCase().replaceAll('?', '').split(' ').map((s: string) => s.trim());
        const answer: IAnswer = {
          parentGroup: g.id,
          title,
          //words: words.filter(w => w.length > 1),
          source: source ?? 0,
          status: status ?? 0,
          level: 2
        }
        console.log('========>>>>>>', { answer })
        await dbp.add('Answers', answer);
        i++;
      }
    }

    if (groups) {
      const parentGroup = g.id;
      let j = 0;
      const parentGroups = groups;
      while (j < parentGroups.length) {
        addGroup(dbp, parentGroups[j], parentGroup, level + 1);
        j++;
      }
    }
    Promise.resolve();
  }

  const addCategory = async (
    dbp: IDBPDatabase,
    //tx: IDBPTransaction<unknown, string[], "readwrite">, 
    categoryData: ICategoryData,
    parentCategory: string,
    level: number)
    : Promise<void> => {
    try {
      const { id, title, kind, variations, categories, questions } = categoryData;

      if (id === 'SAFARI') {
        const q = {
          title: '',
          source: 0,
          status: 0,
        }
        for (var i = 999; i > 100; i--) {
          questions!.push({ ...q, title: 'This is demo question related to test of infinite scroll, when Group has a few hundreds of questions ' + i });
        }
      }

      const cat: ICategory = {
        partitionKey: '',
        id,
        kind: kind ?? 0,
        parentCategory,
        hasSubCategories: categories ? categories.length > 0 : false,
        title,
        // words: title.toLowerCase().replaceAll('?', '').split(' ').map((s: string) => s.trim()).filter(w => w.length > 1),
        level,
        variations: variations ?? [],
        questions: [],
        numOfQuestions: questions?.length || 0,
        created: {
          date: new Date(),
          nickName: 'Boss'
        }
      }
      await dbp.add('Categories', cat);
      console.log('category added', cat);

      try {
        if (questions) {
          let assAnswers: IAssignedAnswer[] = [];
          let i = 0;
          while (i < questions.length) {
            const q: IQuestionData = questions[i];
            const { title, source, status, assignedAnswers } = q;
            if (assignedAnswers) {
              assAnswers = assignedAnswers.map(id => ({
                answer: {
                  id
                },
                user: {
                  nickName: 'OWNER',
                  createdBy: 'OWNER'
                },
                assigned: {
                  date: new Date(),
                  nickName: globalState.authUser.nickName
                }
              }))
            }
            // TODO
            //const words = q.title.toLowerCase().replaceAll('?', '').split(' ').map((s: string) => s.trim());
            const question: IQuestion = {
              parentCategory: cat.id,
              id: uuidv4(),
              title,
              source: source ?? 0,
              status: status ?? 0,
              assignedAnswers: assAnswers,
              numOfAssignedAnswers: 0
              //level: 2,
              //variations: q.variations ?? [],
            }
            console.log('-->>>', { question })
            await dbp.add('Questions', question);
            i++;
          }
        }
      } catch (err) {
        console.error(err)
      }

      if (categories) {
        const parentCategory = cat.id;
        // const categoryDatas = categories;
        let j = 0;
        while (j < categories.length) {
          const categoryData = categories[j];
          console.error({ categoryData })
          addCategory(dbp, categoryData, parentCategory, level + 1);
          j++;
        }
      }
    }
    catch (error) {
      console.error(error);
    }
    Promise.resolve();
  }

  const addInitialData = async (dbp: IDBPDatabase): Promise<void> => {
    //new Promise<void>(async (resolve) => {
    // Categries -> Questions
    /*
    try {
      let level = 1;
      let i = 0;
      const data: ICategoryData[] = categoryData;
      const tx = dbp.transaction(['Categories', 'Questions'], 'readwrite');
      while (i < data.length) {
        await addCategory(dbp, data[i], 'null', level);
        i++;
      }
      console.log('trans categories complete')
      // dispatch({ type: GlobalActionTypes.SET_DBP, payload: { dbp } })
      await tx.done;
    }
    catch (err) {
      console.log('error', err);
    }
    */

    // Groups -> Answers
    try {
      let level = 1;
      let i = 0;
      const data: IGroupData[] = groupData;
      const tx = dbp.transaction(['Groups', 'Answers'], 'readwrite');
      while (i < data.length) {
        await addGroup(dbp, data[i], 'null', level);
        i++;
      }
      console.log('trans groups complete')
      // dispatch({ type: GlobalActionTypes.SET_DBP, payload: { dbp } })
      await tx.done;
    }
    catch (err) {
      console.log('error', err);
    }
    // }
  }

  // ---------------------------
  // load all short categories
  // ---------------------------
  const loadCats = useCallback(async (execute: (method: string, endpoint: string, data: Object | null) => Promise<any>): Promise<any> => {
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
        const url = `${process.env.REACT_APP_API_URL}/Category`;
        console.time();
        await execute("GET", protectedResources.KnowledgeAPI.endpointCategory, null).then((response: ICategoryDto[] | Response) => {
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
    });
  }, [dispatch]);


  //const searchQuestions = useCallback(async (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number): Promise<any> => {
  const searchQuestions = async (execute: (method: string, endpoint: string) => Promise<any>, filter: string, count: number): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        console.time();
        const filterEncoded = encodeURIComponent(filter);
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${filterEncoded}/${count}/null`;
        await execute("GET", url).then((response: IQuestDto[] | undefined) => {
          console.log({ response }, protectedResources.KnowledgeAPI.endpointCategory);
          console.timeEnd();
          if (response) {
            const listQuest: IQuest[] = response.map((q: IQuestDto) => ({
              title: q.Title,
              parentCategory: q.ParentCategory,
              id: q.Id
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

  const OpenDB = useCallback(async (): Promise<any> => {
    try {
      let initializeData = false;
      const dbp = await openDB('SupportKnowledge', 1, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
          //console.error('Error loading database.');

          // Categories
          const store = db.createObjectStore('Categories', { keyPath: 'id' });
          store.createIndex('title_idx', 'title', { unique: true });
          store.createIndex('parentCategory_idx', 'parentCategory', { unique: false });

          // Questions
          const questionsStore = db.createObjectStore('Questions', { keyPath: 'id' });
          questionsStore.createIndex('words_idx', 'words', { multiEntry: true, unique: false });
          questionsStore.createIndex('parentCategory_title_idx', ['parentCategory', 'title'], { unique: true });
          questionsStore.createIndex('parentCategory_idx', 'parentCategory', { unique: false });

          // Groups
          const groupStore = db.createObjectStore('Groups', { keyPath: 'id' });
          groupStore.createIndex('title_idx', 'title', { unique: true });
          groupStore.createIndex('parentGroup_idx', 'parentGroup', { unique: false });

          // Answers
          const answerStore = db.createObjectStore('Answers', { autoIncrement: true });
          answerStore.createIndex('words_idx', 'words', { multiEntry: true, unique: false });
          answerStore.createIndex('parentGroup_title_idx', ['parentGroup', 'title'], { unique: true });
          answerStore.createIndex('parentGroup_idx', 'parentGroup', { unique: false });

          // Roles
          const roleStore = db.createObjectStore('Roles', { keyPath: 'title' });
          roleStore.createIndex('title_idx', 'title', { unique: true });
          roleStore.createIndex('parentRole_idx', 'parentRole', { unique: false });

          // Users
          const userStore = db.createObjectStore('Users', { keyPath: 'nickName' });
          groupStore.createIndex('nickName_idx', 'nickName', { unique: true });
          userStore.createIndex('words_idx', 'words', { multiEntry: true, unique: false });
          userStore.createIndex('parentRole_nickName_idx', ['parentRole', 'nickName'], { unique: true });
          userStore.createIndex('parentRole_idx', 'parentRole', { unique: false });

          // History
          const historyStore = db.createObjectStore('History', { autoIncrement: true });
          historyStore.createIndex('conversation_idx', 'conversation', { unique: false }); // used for getLastConversation
          historyStore.createIndex('question_conversation_answer_idx', ['questionId', 'conversation', 'answerId'], { unique: false });

          initializeData = true;
        },
        terminated() {
          alert('terminated')
        }
      })
      // Add initial data
      if (initializeData) {
        await addInitialData(dbp);
        const userData: IUserData = roleData[0].users![0];
        const { nickName, name, password, email } = userData;
        const regUser: IRegisterUser = { ...userData, level: 1, confirmed: false }
        //await registerUser(regUser, true, dbp);
      }
      await loadCats(execute);
      dispatch({ type: GlobalActionTypes.SET_DBP, payload: { dbp } });
      // else {
      //   signInUser({nickName: 'Boss', password: 'Boss12345'})
      // }
      // This event handles the event whereby a new version of the database needs to be created
      // Either one has not been created before, or a new version number has been submitted via the
      // window.indexedDB.open line above
      //it is only implemented in recent browsers
      return true;
    }
    catch (err: any) {
      console.log(err);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new Error("")
        }
      });
      return false;
    }
  }, []);

  const joinAssignedAnswers = async (assignedAnswers: IAssignedAnswer[]): Promise<IAssignedAnswer[]> => {
    const arr: IAssignedAnswer[] = [];
    try {
      const { dbp } = globalState;
      // join answer.title
      let i = 0;
      while (i < assignedAnswers.length) {
        const assignedAnswer = assignedAnswers[i];
        const answer: IAnswer = await dbp!.get("Answers", assignedAnswer.answer.id);
        const title = answer ? answer.title : "Answer doesn't exist any more";
        arr.push({ ...assignedAnswer, answer: { ...assignedAnswer.answer, title } });
        i++;
      }
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: GlobalActionTypes.SET_ERROR, payload: error });
    }
    return arr;
  }

  // differs from CategoryProvider, here we don't dispatch
  const getQuestion = async (execute: (method: string, endpoint: string) => Promise<any>, questionKey: IQuestionKey): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        const { parentCategory, id } = questionKey;
        //const url = `${process.env.REACT_APP_API_URL}/Question/${parentCategory}/${id}`;
        //console.log(`FETCHING --->>> ${url}`)
        //dispatch({ type: ActionTypes.SET_LOADING })
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
          .then(({ data: questionDto }) => {
            const categories: ICategory[] = [];
            console.timeEnd();
            const question: IQuestion = new Question(questionDto, parentCategory).question;
            question.categoryTitle = 'nadji me';
            resolve(question);
          })
          .catch((error) => {
            console.log('FETCHING --->>>', error);
          });
        */
        const url = `${protectedResources.KnowledgeAPI.endpointQuestion}/${parentCategory}/${id}`;
        await execute("GET", url).then((response: IQuestionDto) => {
          console.timeEnd();
          console.log({ response });
          const questionDto = response!;
          const question: IQuestion = new Question(questionDto, parentCategory).question;
          question.categoryTitle = 'nadji me';
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
  const getSubCats = async ({ parentCategory, level }: IParentInfo): Promise<any> => {
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

  const getAnswer = async (id: number): Promise<IAnswer | undefined> => {
    try {
      const { dbp } = globalState;
      const answer: IAnswer = await dbp!.get("Answers", id);
      const { parentGroup } = answer;
      const group: IGroup = await dbp!.get("Groups", parentGroup)
      answer.id = id;
      answer.groupTitle = group.title;
      return answer;
    }
    catch (error: any) {
      console.log(error);
    }
    return undefined;
  };


  const getMaxConversation = async (dbp: IDBPDatabase): Promise<number> => {
    // const tx = dbp!.transaction('History', 'readonly');
    // var index = tx.store.index('conversation_idx');
    // var req = await index.openCursor(null, 'prev');
    // return (req === null)
    //   ? 1000
    //   : parseInt(req.key.toString())
    return 1000;
  }

  const addHistory = async (dbp: IDBPDatabase | null, history: IHistory): Promise<void> => {
    if (!dbp) {
      dbp = globalState.dbp;
    }
    const { conversation, client, questionId, answerId, fixed, created } = history;
    await dbp!.add('History', {
      conversation,
      client,
      questionId,
      answerId,
      fixed,
      created
    });
    Promise.resolve();
  }

  const getAnswersRated = async (dbp: IDBPDatabase | null, questionId: string): Promise<IAnswerRating[]> => {
    // if (!dbp) {
    //   dbp = globalState.dbp;
    // }
    // const tx = dbp!.transaction(['History', 'Answers'], 'readonly');
    // const index = tx.objectStore('History').index('question_conversation_answer_idx');
    // const map = new Map<number, IAnswerRating>();
    // for await (const cursor of index.iterate(IDBKeyRange.bound([questionId, 1000, 0], [questionId, 999999, 999999], false, true))) {
    //   const history: IHistory = cursor!.value;
    //   const { answerId, fixed } = history;
    //   if (!map.has(answerId)) {
    //     map.set(answerId, { fixed: fixed === true ? 1 : 0, notFixed: fixed === false ? 1 : 0, Undefined: fixed === undefined ? 1 : 0 });
    //   }
    //   else {
    //     const answerRating = map.get(answerId);
    //     switch (fixed) {
    //       case true:
    //         answerRating!.fixed++;
    //         break;
    //       case false:
    //         answerRating!.notFixed++;
    //         break;
    //       case undefined:
    //         answerRating!.Undefined++;
    //         break;
    //       default:
    //         alert('unk rate')
    //         break;
    //     }
    //     map.set(answerId, answerRating!);
    //   }
    // }
    const arr: IAnswerRating[] = [];
    // map.forEach((value, key) => {
    //   arr.push({ answerId: key, ...value })
    // })
    arr.sort(compareFn);
    return arr;
  }

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

  useEffect(() => {
    (async () => {
      await OpenDB();
    })()
  }, [OpenDB])

  return (
    <GlobalContext.Provider value={{
      globalState, OpenDB, loadCats, getUser, exportToJSON, health,
      getSubCats, getCatsByKind,
      searchQuestions, getQuestion, joinAssignedAnswers, getAnswer,
      getMaxConversation, addHistory, getAnswersRated
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
