import { ActionMap, IDateAndBy, IRecord, ROLES } from 'global/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingRole: 'AddingRole',
	ViewingRole: 'ViewingRole',
	EditingRole: 'EditingRole',
	DeletingRole: 'DeletingRole',
	//////////////////////////////////////
	// users
	AddingUser: 'AddingUser',
	ViewingUser: 'ViewingUser',
	EditingUser: 'EditingUser',
	DeletingUser: 'DeletingUser',
}

export enum FormMode {
	viewing,
	adding,
	editing
}

export interface IUser extends IRecord {
	nickName: string;
	name: string;
	words?: string[];
	password: string;
	email: string;
	color: string;
	level: number;
	parentRole: string;
	role: ROLES;
	roleTitle?: string;
	isDarkMode: boolean;
	confirmed: boolean;
}

export interface IRole extends IRecord {
	parentRole: string; // | null is a valid value so you can store data with null value in indexeddb 
	// but it is not a valid key
	title: string;
	level: number;
	users: IUser[];
	numOfUsers: number;
	hasMore?: boolean;
	isExpanded?: boolean;
	hasSubRoles: boolean
}

export interface IRoleInfo {
	title: string,
	level: number
}


export interface IParentInfo {
	parentRole: string,
	level: number,
	title?: string, // to easier follow getting the list of sub-roles
	inAdding?: boolean,
	startCursor?: number,
	includeUserId?: number
}

export interface ICatInfo {
	parentRole: string,
	level: number,
	setParentRole: (role: IRole) => void;
}

export interface IRolesState {
	mode: string | null,
	roles: IRole[],
	currentRoleExpanded: string,
	lastRoleExpanded: string | null;
	roleId_userId_done: string | null;
	parentNodes: IParentRoles;
	loading: boolean,
	userLoading: boolean,
	error?: Error;
}

export interface ICatsState {
	loading: boolean,
	parentRole: IDBValidKey | null,
	title: string,
	cats: IRole[], // drop down roles
	error?: Error;
}



export interface IRolesContext {
	state: IRolesState,
	reloadRoleNode: (roleId: string, userId: string | null) => Promise<any>;
	getSubRoles: ({ parentRole, level }: IParentInfo) => void,
	getSubCats: ({ parentRole, level }: IParentInfo) => Promise<any>,
	createRole: (role: IRole) => void,
	viewRole: (title: string) => void,
	editRole: (title: string) => void,
	updateRole: (role: IRole) => void,
	deleteRole: (title: string) => void,
	expandRole: (role: IRole, expand: boolean) => void,
	//////////////
	// users
	//getRoleUsers: ({ parentRole, level, inAdding }: IParentInfo) => void,
	loadRoleUsers: ({ parentRole }: IParentInfo) => void,
	createUser: (user: IUser, fromModal: boolean) => Promise<any>;
	viewUser: (nickName: string) => void;
	editUser: (nickName: string) => void;
	updateUser: (user: IUser) => Promise<any>;
	deleteUser: (nickName: string, parentRole: string) => void
}

export interface IRoleFormProps {
	inLine: boolean;
	role: IRole;
	mode: FormMode;
	submitForm: (role: IRole) => void,
	children: string
}


export interface IUserFormProps {
	user: IUser;
	mode: FormMode;
	closeModal?: () => void;
	submitForm: (user: IUser) => void,
	showCloseButton: boolean;
	children: string
}




export interface IParentRoles {
	roleId: string | null;
	nickName: string | null;
	parentNodesIds: string[] | null;
}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_ROLE_LOADING = 'SET_ROLE_LOADING',
	SET_ROLE_USERS_LOADING = 'SET_ROLE_USERS_LOADING',
	SET_SUB_ROLES = 'SET_SUB_ROLES',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	CLEAN_TREE = 'CLEAN_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_ROLE = 'ADD_SUB_ROLE',
	SET_ROLE = 'SET_ROLE',
	SET_ADDED_ROLE = 'SET_ADDED_ROLE',
	VIEW_ROLE = 'VIEW_ROLE',
	EDIT_ROLE = 'EDIT_ROLE',
	DELETE = 'DELETE',

	CLOSE_ROLE_FORM = 'CLOSE_ROLE_FORM',
	CANCEL_ROLE_FORM = 'CANCEL_ROLE_FORM',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_ROLES = "SET_PARENT_ROLES",

	// users
	LOAD_ROLE_USERS = 'LOAD_ROLE_USERS',
	ADD_USER = 'ADD_USER',
	VIEW_USER = 'VIEW_USER',
	EDIT_USER = 'EDIT_USER',

	SET_USER = 'SET_USER',
	SET_USER_AFTER_ASSIGN_USER = 'SET_USER_AFTER_ASSIGN_USER',
	DELETE_USER = 'DELETE_USER',

	CLOSE_USER_FORM = 'CLOSE_USER_FORM',
	CANCEL_USER_FORM = 'CANCEL_USER_FORM'
}

export type RolesPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_ROLE_LOADING]: {
		title: string;
		loading: boolean;
	}

	[ActionTypes.SET_ROLE_USERS_LOADING]: {
		userLoading: boolean;
	}


	[ActionTypes.SET_PARENT_ROLES]: {
		parentNodes: IParentRoles
	};

	[ActionTypes.SET_SUB_ROLES]: {
		subRoles: IRole[];
	};

	[ActionTypes.ADD_SUB_ROLE]: IParentInfo;

	[ActionTypes.VIEW_ROLE]: {
		role: IRole;
	};

	[ActionTypes.EDIT_ROLE]: {
		role: IRole;
	};

	[ActionTypes.SET_ROLE]: {
		role: IRole;
	};

	[ActionTypes.SET_ADDED_ROLE]: {
		role: IRole;
	};

	[ActionTypes.DELETE]: {
		title: string;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		role: IRole;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_ROLE_FORM]: undefined;

	[ActionTypes.CANCEL_ROLE_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		title: string;
		expanding: boolean;
	}

	[ActionTypes.SET_ERROR]: {
		error: Error;
	};

	/////////////
	// users
	[ActionTypes.LOAD_ROLE_USERS]: {
		parentRole: string,
		users: IUser[],
		hasMore: boolean
	};

	[ActionTypes.ADD_USER]: {
		roleInfo: IRoleInfo;
	}

	[ActionTypes.VIEW_USER]: {
		user: IUser;
	};

	[ActionTypes.EDIT_USER]: {
		user: IUser;
	};

	[ActionTypes.SET_USER]: {
		user: IUser
	};

	[ActionTypes.SET_USER_AFTER_ASSIGN_USER]: {
		user: IUser
	};

	[ActionTypes.DELETE_USER]: {
		nickName: string;
		parentRole: string
	};

	[ActionTypes.CLOSE_USER_FORM]: {
		user: IUser;
	};

	[ActionTypes.CANCEL_USER_FORM]: {
		user: IUser;
	};

};

export type RolesActions =
	ActionMap<RolesPayload>[keyof ActionMap<RolesPayload>];

/////////////////////////////////////////////////////////////////////////
// DropDown Select Role
export enum RoleShortActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_ROLE = 'SET_PARENT_ROLE'
}

export type CatsPayload = {
	[RoleShortActionTypes.SET_LOADING]: undefined;

	[RoleShortActionTypes.SET_SUB_CATS]: {
		subCats: IRole[];
	};

	[RoleShortActionTypes.SET_EXPANDED]: {
		title: string;
		expanding: boolean;
	}

	[RoleShortActionTypes.SET_ERROR]: {
		error: Error;
	};

	[RoleShortActionTypes.SET_PARENT_ROLE]: {
		role: IRole;
	};

};

export type CatsActions =
	ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];