// Define the Global State
import { ICategory, ICategoryKey, IQuestion, IQuestionEx, IQuestionKey, IQuestionRow } from 'categories/types';
import { IGroup, IGroupKey, IAnswerRow, IAnswer, IAnswerKey } from 'groups/types';
//import { IOption } from 'common/types';
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


export class HistoryDto {
	constructor(history: IHistory) {
		this.historyDto = {
			QuestionKey: history.questionKey,
			AnswerKey: history.answerKey,
			UserAction: history.userAction, // == USER_ANSWER_ACTION.
			// 	? 2
			// 	: history.userAction
			// 		? 1
			// 		: 0,
			Created: new WhoWhen2Dto(history.created).whoWhenDto!,
		}
	}
	historyDto: IHistoryDto;
}



// export class History {
// 	constructor(dto: IHistoryDto) {
// 		this.history = {
// 			questionKey: dto.QuestionKey,
// 			answerKey: dto.AnswerKey,
// 			userAction: dto.Fixed == 2
// 				? undefined
// 				: dto.Fixed == 1
// 					? true
// 					: false,
// 			created: new Dto2WhoWhen(dto.Created!).whoWhen,
// 		}
// 	}
// 	history: IHistory;
// }


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
	level: number,
	kind: number
}

export interface IShortGroup {
	groupKey: IGroupKey,
	parentGroup: string | null,
	title: string;
	titlesUpTheTree: string; // traverse up the tree, until root
	variations: string[];
	hasSubGroups: boolean;
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
	shortGroups: Map<string, IShortGroup>;
	shortGroupsLoaded?: number;
	lastRouteVisited: string
}

export interface IGlobalStateFromLocalStorage {
	nickName: string;
	everLoggedIn: boolean;
	isDarkMode: boolean;
	variant: string;
	bg: string;
	lastRouteVisited: string;
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
	setLastRouteVisited: (lastRouteVisited: string) => void;
	exportToJSON: (category: ICategory, parentCategory: string) => void;
	health: () => void;
	loadCats: () => void;
	getSubCats: (categoryId: string | null) => Promise<any>;
	getCatsByKind: (kind: number) => Promise<ICat[]>;
	searchQuestions: (filter: string, count: number) => Promise<IQuestionRow[]>;
	getQuestion: (questionKey: IQuestionKey) => Promise<IQuestionEx>;
	loadShortGroups: () => void;
	getSubGroups: (categoryKey: ICategoryKey) => Promise<any>;
	getGroupsByKind: (kind: number) => Promise<IShortGroup[]>;
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>;
	getAnswer: (answerKey: IAnswerKey) => Promise<IAnswer | null>;
	addHistory: (history: IHistory) => Promise<void>;
	getAnswersRated: (questionKey: IQuestionKey) => Promise<any>;
	addHistoryFilter: (historyFilterDto: IHistoryFilterDto) => Promise<void>;
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
	SET_ALL_GROUPS = 'SET_ALL_GROUPS',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
	SET_LAST_ROUTE_VISITED = 'SET_LAST_ROUTE_VISITED'
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

	[GlobalActionTypes.SET_ALL_GROUPS]: {
		shortGroups: Map<string, IShortGroup>
	};

	[GlobalActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		question: IQuestion
	};

	[GlobalActionTypes.SET_LAST_ROUTE_VISITED]: {
		lastRouteVisited: string
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


export interface IShortGroupsState {
	loading: boolean,
	parentGroup: string | null,
	title: string,
	shortGroups: IGroup[], // drop down groups
	error?: Error;
}

export interface IShortGroupInfo {
	groupKey: IGroupKey,
	level: number,
	setParentGroup: (group: IGroup) => void;
}


export enum CatsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CAT = 'SET_PARENT_CAT'
}

export enum ShortGroupsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_SHORTGROUPS = 'SET_SUB_SHORTGROUPS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_SHORTGROUP = 'SET_PARENT_SHORTGROUP'
}

export type CatsPayload = {
	[CatsActionTypes.SET_LOADING]: false;

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


export type ShortGroupsPayload = {
	[ShortGroupsActionTypes.SET_LOADING]: undefined;

	[ShortGroupsActionTypes.SET_SUB_SHORTGROUPS]: {
		groups: IGroup[];
	};

	[ShortGroupsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[ShortGroupsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[ShortGroupsActionTypes.SET_PARENT_SHORTGROUP]: {
		group: IGroup;
	};

};

export type ShortGroupsActions =
	ActionMap<ShortGroupsPayload>[keyof ActionMap<ShortGroupsPayload>];


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


export enum USER_ANSWER_ACTION {
	NotFixed = 0,
	Fixed = 1,
	NotClicked = 2
};

export interface IHistory {
	id?: number;
	questionKey: IQuestionKey;
	answerKey: IAnswerKey;
	userAction: USER_ANSWER_ACTION; // when client didn't click on 'Fixed' or 'Not fixed' buttons
	created?: IWhoWhen
}

export interface IHistoryDto {
	PartitionKey?: string;
	Id?: number;
	QuestionKey: IQuestionKey;
	AnswerKey: IAnswerKey;
	UserAction: USER_ANSWER_ACTION; // when client didn't click on 'Fixed' or 'Not fixed' buttons
	Created: IWhoWhenDto
}


export interface IHistoryFilterDto {
	QuestionKey: IQuestionKey;
	Filter: string;
	Created: IWhoWhenDto
}


export interface IHistoryDtoEx {
	historyDto: IHistoryDto | null;
	msg: string;
}

export interface IHistoryDtoListEx {
	historyDtoList: IHistoryDto[];
	msg: string;
}

export interface IHistoryListEx {
	historyList: IHistory[];
	msg: string;
}


export interface IHistoryData {
	client: string;
	questionId: number;
	answerId: number;
	created?: Date
}


export interface IUser {
	nickName: string;
	name: string;
	color?: string;
	level?: number;
	isDarkMode?: boolean;
}


export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];