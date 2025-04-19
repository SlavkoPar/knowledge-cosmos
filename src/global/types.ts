// Define the Global State
import { IAssignedAnswer, ICategory, ICategoryKey, IQuest, IQuestion, IQuestionKey } from 'categories/types';
//import { IOption } from 'common/types';
import { IAnswer } from 'groups/types';
import { IDBPDatabase } from 'idb';

export interface IWhoWhen {
	time: Date,
	nickName: string
}

export interface IRecord {
	created?: IWhoWhen,
	createdBy?: string,
	modified?: IWhoWhen,
	modifiedBy?: string,
	archived?: IWhoWhen,
	inViewing?: boolean,
	inEditing?: boolean,
	inAdding?: boolean
}


export interface IWhoWhenDto {
	Time: Date,
	NickName: string
}

export interface IRecordDto {
	Created?: IWhoWhenDto;
	Modified?: IWhoWhenDto;
	Archived?: IWhoWhenDto;
}

export class Dto2WhoWhen {
	constructor(whoWhenDto: IWhoWhenDto) {
		if (whoWhenDto) {
			const { Time, NickName } = whoWhenDto;
			this.whoWhen = {
				time: new Date(Time),
				nickName: NickName
			}
		}
	}
	whoWhen?: IWhoWhen = undefined;
}

export class WhoWhen2Dto {
	constructor(whoWhen: IWhoWhen | undefined) {
		if (whoWhen) {
			const { time: date, nickName: nickName } = whoWhen;
			this.whoWhenDto = {
				Time: new Date(date),
				NickName: nickName
			}
		}
	}
	whoWhenDto: IWhoWhenDto | null = null;
}

export interface IAuthUser {
	color?: string,
	nickName: string,
	name: string;
	email?: string,
	role?: ROLES,
	visited?: Date
}

// export const ROLES: Map<string, string> = new Map<string, string>([
// 	['OWNER', 'OWNER'],
// 	['ADMIN', 'ADMIN'],
// 	['EDITOR', 'EDITOR'],
// 	['VIEWER', 'VIEWER']
// ])

export enum ROLES {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	EDITOR = 'EDITOR',
	VIEWER = 'VIEWER'
}

export interface ICat {
	partitionKey: string,
	id: string;
	parentCategory: string | null;
	title: string;
	titlesUpTheTree: string; // traverse up the tree, until root
	variations: string[];
	hasSubCategories: boolean;
	kind: number
}

export interface ICatExport {
	id: string;
	parentCategory: string;
	title: string;
	variations: string[];
	hasSubCategories: boolean;
	kind: number
}


export interface IGlobalState {
	isAuthenticated: boolean | null;
	dbp: IDBPDatabase | null;
	everLoggedIn: boolean;
	authUser: IAuthUser;
	canEdit: boolean,
	isOwner: boolean,
	isDarkMode: boolean;
	variant: string,
	bg: string,
	loading: boolean;
	error?: Error;
	cats: Map<string, ICat>;
	catsLoaded?: number;
}

export interface IGlobalStateFromLocalStorage {
	nickName: string;
	everLoggedIn: boolean;
	isDarkMode: boolean;
	variant: string;
	bg: string;
}

export interface IParentInfo {
	parentCategory: string,
	title?: string, // to easier follow getting the list of sub-categories
	level: number
}


export interface IGlobalContext {
	globalState: IGlobalState;
	getUser: (nickName: string) => Promise<any>;
	OpenDB: () => Promise<any>;
	loadCats: () => void;
	exportToJSON: (category: ICategory, parentCategory: string) => void;
	health: () => void;
	getSubCats: (categoryKey: ICategoryKey) => Promise<any>;
	getCatsByKind: (kind: number) => Promise<ICat[]>;
	searchQuestions: (filter: string, count: number) => Promise<IQuest[]>;
	getQuestion: (questionKey: IQuestionKey) => Promise<IQuestion | null>;
	joinAssignedAnswers: (assignedAnswers: IAssignedAnswer[]) => Promise<IAssignedAnswer[]>;
	getAnswer: (id: number) => Promise<IAnswer | undefined>;
	getMaxConversation: (dbp: IDBPDatabase) => Promise<number>;
	addHistory: (dbp: IDBPDatabase | null, history: IHistory) => Promise<void>;
	getAnswersRated: (dbp: IDBPDatabase | null, questionId: string) => Promise<IAnswerRating[]>;
}

export enum GlobalActionTypes {
	SET_LOADING = 'SET_LOADING',
	AUTHENTICATE = "AUTHENTICATE",
	UN_AUTHENTICATE = "UN_AUTHENTICATE",
	SET_DBP = "SET_DBP",
	SET_ERROR = 'SET_ERROR',
	DARK_MODE = "DARK_MODE",
	LIGHT_MODE = "LIGHT_MODE",
	SET_ALL_CATEGORIES = 'SET_ALL_CATEGORIES',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
}

export interface ILoginUser {
	nickName: string;
	password?: string;
	who?: string;
}

export interface IRegisterUser {
	who?: string,
	nickName: string,
	name: string,
	password: string,
	email: string,
	color: string,
	level: number,
	confirmed: boolean
}

export interface IJoinToWorkspace {
	invitationId: string,
	userName: string;
	password: string;
	date?: Date;
}


export type ActionMap<M extends Record<string, any>> = {
	[Key in keyof M]: M[Key] extends undefined
	? {
		type: Key;
	}
	: {
		type: Key;
		payload: M[Key];
	}
};

export type GlobalPayload = {
	[GlobalActionTypes.SET_LOADING]: {
	};

	[GlobalActionTypes.AUTHENTICATE]: {
		user: IUser
	};

	[GlobalActionTypes.UN_AUTHENTICATE]: undefined;

	[GlobalActionTypes.SET_DBP]: {
		dbp: IDBPDatabase | null
	};

	[GlobalActionTypes.SET_ERROR]: {
		error: Error;
	};

	[GlobalActionTypes.LIGHT_MODE]: undefined;

	[GlobalActionTypes.DARK_MODE]: undefined;

	[GlobalActionTypes.SET_ALL_CATEGORIES]: {
		cats: Map<string, ICat>
	};

	[GlobalActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		question: IQuestion
	};
};


/////////////////////////////////////////////////////////////////////////
// DropDown Select Category

export interface ICatsState {
	loading: boolean,
	parentCategory: string | null,
	title: string,
	cats: ICategory[], // drop down categories
	error?: Error;
}

export interface ICatInfo {
	categoryKey: ICategoryKey,
	level: number,
	setParentCategory: (category: ICategory) => void;
}

export enum CatsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CAT = 'SET_PARENT_CAT'
}

export type CatsPayload = {
	[CatsActionTypes.SET_LOADING]: undefined;

	[CatsActionTypes.SET_SUB_CATS]: {
		subCats: ICategory[];
	};

	[CatsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[CatsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[CatsActionTypes.SET_PARENT_CAT]: {
		category: ICategory;
	};

};

export type CatsActions =
	ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];


////////////////////////
// Category -> questions
export interface IQuestionData {
	title: string;
	assignedAnswers?: number[];
	source?: number;
	status?: number;
	variations?: string[]
}

export interface ICategoryData {
	id: string;
	title: string;
	kind?: number;
	variations?: string[];
	categories?: ICategoryData[],
	questions?: IQuestionData[]
}


////////////////////
// Group -> answers
export interface IAnswerData {
	title: string;
	source?: number;
	status?: number;
}

export interface IGroupData {
	id: string,
	title: string,
	groups?: IGroupData[],
	answers?: IAnswerData[]
}

////////////////////
// Role -> users
export interface IUserData {
	nickName: string;
	name: string;
	password: string;
	email: string;
	color: string;
}

export interface IRoleData {
	title: string,
	roles?: IRoleData[],
	users?: IUserData[]
}


export interface IHistory {
	conversation?: number;
	client: string;
	questionId: string;
	answerId: number;
	fixed: boolean | undefined; // when client didn't click on 'Fixed' or 'Not fixed' buttons
	created: Date
}

export interface IHistoryData {
	client: string;
	questionId: number;
	answerId: number;
	created?: Date
}

export interface IAnswerRating {
	answerId?: number;
	fixed: number;
	notFixed: number; // client clicked on 'Not fixed' button
	Undefined: number; // not clicked
}


export interface IUser {
	nickName: string;
	name: string;
	color?: string;
	level?: number;
	isDarkMode?: boolean;
}


export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];