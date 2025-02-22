import { ActionMap, IDateAndBy, IRecord } from 'global/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingGroup: 'AddingGroup',
	ViewingGroup: 'ViewingGroup',
	EditingGroup: 'EditingGroup',
	DeletingGroup: 'DeletingGroup',

	//////////////////////////////////////
	// answers
	AddingAnswer: 'AddingAnswer',
	ViewingAnswer: 'ViewingAnswer',
	EditingAnswer: 'EditingAnswer',
	DeletingAnswer: 'DeletingAnswer',
}

export enum FormMode {
	viewing,
	adding,
	editing
}

export interface IAnswerAnswer {
	groupId: IDBValidKey;
	answerId: IDBValidKey;
	_id: IDBValidKey,
	answer: {
		_id: IDBValidKey,
		title: string
	},
	user: {
		_id?: IDBValidKey,
		createdBy: string
	}
	assigned: IDateAndBy
}

export interface IFromUserAssignedAnswer {
	_id: IDBValidKey,
	createdBy: string
}

export interface IAnswer extends IRecord {
	id?: number,
	title: string,
	words?: string[],
	level: number,
	parentGroup: string,
	groupTitle?: string,
	numOfAnswers?: number,
	source: number,
	status: number,
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[]
}

export interface IGroup extends IRecord {
	id: string;
	parentGroup: string; // | null is a valid value so you can store data with null value in indexeddb 
	// but it is not a valid key
	title: string;
	level: number;
	answers: IAnswer[];
	numOfAnswers: number;
	hasMore?: boolean;
	isExpanded?: boolean;
	hasSubGroups: boolean
}

export interface IGroupInfo {
	id: string,
	level: number
}


export interface IParentInfo {
	parentGroup: string,
	level: number,
	title?: string, // to easier follow getting the list of sub-groups
	inAdding?: boolean,
	startCursor?: number,
	includeAnswerId?: number
}

export interface ICatInfo {
	parentGroup: string,
	level: number,
	setParentGroup: (group: IGroup) => void;
}

export interface IGroupsState {
	mode: string | null,
	groups: IGroup[],
	currentGroupExpanded: string,
	lastGroupExpanded: string | null;
	groupId_answerId_done: string | null;
	parentNodes: IParentGroups;
	loading: boolean,
	answerLoading: boolean,
	error?: Error;
}

export interface ICatsState {
	loading: boolean,
	parentGroup: IDBValidKey | null,
	title: string,
	cats: IGroup[], // drop down groups
	error?: Error;
}



export interface IGroupsContext {
	state: IGroupsState,
	reloadGroupNode: (groupId: string, answerId: string | null) => Promise<any>;
	getSubGroups: ({ parentGroup, level }: IParentInfo) => void,
	getSubCats: ({ parentGroup, level }: IParentInfo) => Promise<any>,
	createGroup: (group: IGroup) => void,
	viewGroup: (id: string) => void,
	editGroup: (id: string) => void,
	updateGroup: (group: IGroup) => void,
	deleteGroup: (id: string) => void,
	expandGroup: (group: IGroup, expand: boolean) => void,
	//////////////
	// answers
	//getGroupAnswers: ({ parentGroup, level, inAdding }: IParentInfo) => void,
	loadGroupAnswers: ({ parentGroup }: IParentInfo) => void,
	createAnswer: (answer: IAnswer, fromModal: boolean) => Promise<any>;
	viewAnswer: (id: number) => void;
	editAnswer: (id: number) => void;
	updateAnswer: (answer: IAnswer) => Promise<any>;
	deleteAnswer: (id: number, parentGroup: string) => void
}

export interface IGroupFormProps {
	inLine: boolean;
	group: IGroup;
	mode: FormMode;
	submitForm: (group: IGroup) => void,
	children: string
}


export interface IAnswerFormProps {
	answer: IAnswer;
	mode: FormMode;
	closeModal?: () => void;
	submitForm: (answer: IAnswer) => void,
	showCloseButton: boolean;
	children: string
}




export interface IParentGroups {
	groupId: string | null;
	answerId: string | null;
	parentNodesIds: string[] | null;
}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_GROUP_LOADING = 'SET_GROUP_LOADING',
	SET_GROUP_ANSWERS_LOADING = 'SET_GROUP_ANSWERS_LOADING',
	SET_SUB_GROUPS = 'SET_SUB_GROUPS',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	CLEAN_TREE = 'CLEAN_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_GROUP = 'ADD_SUB_GROUP',
	SET_GROUP = 'SET_GROUP',
	SET_ADDED_GROUP = 'SET_ADDED_GROUP',
	VIEW_GROUP = 'VIEW_GROUP',
	EDIT_GROUP = 'EDIT_GROUP',
	DELETE = 'DELETE',

	CLOSE_GROUP_FORM = 'CLOSE_GROUP_FORM',
	CANCEL_GROUP_FORM = 'CANCEL_GROUP_FORM',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_GROUPS = "SET_PARENT_GROUPS",

	// answers
	LOAD_GROUP_ANSWERS = 'LOAD_GROUP_ANSWERS',
	ADD_ANSWER = 'ADD_ANSWER',
	VIEW_ANSWER = 'VIEW_ANSWER',
	EDIT_ANSWER = 'EDIT_ANSWER',

	SET_ANSWER = 'SET_ANSWER',
	SET_ANSWER_AFTER_ASSIGN_ANSWER = 'SET_ANSWER_AFTER_ASSIGN_ANSWER',
	DELETE_ANSWER = 'DELETE_ANSWER',

	CLOSE_ANSWER_FORM = 'CLOSE_ANSWER_FORM',
	CANCEL_ANSWER_FORM = 'CANCEL_ANSWER_FORM'
}

export type GroupsPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_GROUP_LOADING]: {
		id: string;
		loading: boolean;
	}

	[ActionTypes.SET_GROUP_ANSWERS_LOADING]: {
		answerLoading: boolean;
	}


	[ActionTypes.SET_PARENT_GROUPS]: {
		parentNodes: IParentGroups
	};

	[ActionTypes.SET_SUB_GROUPS]: {
		subGroups: IGroup[];
	};

	[ActionTypes.ADD_SUB_GROUP]: IParentInfo;

	[ActionTypes.VIEW_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.EDIT_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.SET_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.SET_ADDED_GROUP]: {
		group: IGroup;
	};

	[ActionTypes.DELETE]: {
		id: string;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		group: IGroup;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_GROUP_FORM]: undefined;

	[ActionTypes.CANCEL_GROUP_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[ActionTypes.SET_ERROR]: {
		error: Error;
	};

	/////////////
	// answers
	[ActionTypes.LOAD_GROUP_ANSWERS]: {
		parentGroup: string,
		answers: IAnswer[],
		hasMore: boolean
	};

	[ActionTypes.ADD_ANSWER]: {
		groupInfo: IGroupInfo;
	}

	[ActionTypes.VIEW_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.EDIT_ANSWER]: {
		answer: IAnswer;
	};

	[ActionTypes.SET_ANSWER]: {
		answer: IAnswer
	};

	[ActionTypes.SET_ANSWER_AFTER_ASSIGN_ANSWER]: {
		answer: IAnswer
	};

	[ActionTypes.DELETE_ANSWER]: {
		id: number;
		parentGroup: string
	};

	[ActionTypes.CLOSE_ANSWER_FORM]: {
		answer: IAnswer;
	};

	[ActionTypes.CANCEL_ANSWER_FORM]: {
		answer: IAnswer;
	};

};

export type GroupsActions =
	ActionMap<GroupsPayload>[keyof ActionMap<GroupsPayload>];

/////////////////////////////////////////////////////////////////////////
// DropDown Select Group
export enum CatsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_GROUP = 'SET_PARENT_GROUP'
}

export type CatsPayload = {
	[CatsActionTypes.SET_LOADING]: undefined;

	[CatsActionTypes.SET_SUB_CATS]: {
		subCats: IGroup[];
	};

	[CatsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[CatsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[CatsActionTypes.SET_PARENT_GROUP]: {
		group: IGroup;
	};

};

export type CatsActions =
	ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];