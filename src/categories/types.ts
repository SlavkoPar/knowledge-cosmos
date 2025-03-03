import { ActionMap, IWhoWhen, IRecord, IRecordDto, WhoWhen2DateAndBy } from 'global/types';
import { IAnswer } from 'groups/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingCategory: 'AddingCategory',
	ViewingCategory: 'ViewingCategory',
	EditingCategory: 'EditingCategory',
	DeletingCategory: 'DeletingCategory',

	// tags
	AddingVariation: 'AddingVariation',
	EditingVariation: 'EditingVariation',
	ViewingVariation: 'ViewingVariation',

	//////////////////////////////////////
	// questions
	AddingQuestion: 'AddingQuestion',
	ViewingQuestion: 'ViewingQuestion',
	EditingQuestion: 'EditingQuestion',
	DeletingQuestion: 'DeletingQuestion',
}

export enum FormMode {
	viewing,
	adding,
	editing
}

// export interface IQuestionAnswer {
// 	categoryId: string;
// 	questionId: number;
// 	id: number,
// 	answer: {
// 		id: number,
// 		title: string
// 	},
// 	user: {
// 		id?: number,
// 		createdBy: string
// 	}
// 	assigned: IDateAndBy
// }

export interface IAssignedAnswer {
	answer: {
		id: number,
		title?: string
	}
	user: {
		nickName: string,
		createdBy: string
	}
	assigned: IWhoWhen
}

export interface IFromUserAssignedAnswer {
	id: string,
	createdBy: string
}

export interface IQuestion extends IRecord {
	id: string;
	title: string;
	words?: string[];
	//level: number;
	parentCategory: string;
	categoryTitle?: string;
	assignedAnswers: IAssignedAnswer[];
	numOfAssignedAnswers: number;
	source: number;
	status: number;
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[];
	CategoryTitle?: string;
	included?: boolean;
}

export interface ICategoryKey {
	partitionKey: string;
	id: string;
}

export interface ICategoryKeyExtended extends ICategoryKey {
	title: string;
}


export interface IQuestionKey {
	parentCategory: string;
	id: string;
}




export interface IVariation {
	name: string;
}

export interface ICategory extends IRecord {
	partitionKey: string; // | null is a valid value so you can store data with null value in indexeddb 
	id: string;
	kind: number;
	parentCategory: string | null; // | null is a valid value so you can store data with null value in indexeddb 
	// but it is not a valid key
	title: string;
	// words: string[];
	level: number;
	variations: string[];
	questions: IQuestion[];
	numOfQuestions: number;
	hasMoreQuestions?: boolean;
	isExpanded?: boolean;
	hasSubCategories: boolean;
	categories?: ICategory[]; // used for export to json
	titlesUpTheTree?: string;
}


export class Question {
	constructor(dto: IQuestionDto, parentCategory: string) {
		this.question = {
			parentCategory,
			id: dto.id,
			title: dto.title,
			assignedAnswers: [], // TODO
			numOfAssignedAnswers: 0,
			source: dto.source,
			status: dto.status,
			created: new WhoWhen2DateAndBy(dto.created).dateAndBy,
			modified: new WhoWhen2DateAndBy(dto.modified).dateAndBy,
			archived: false
		}
	}
	question: IQuestion
}


export class Category {
	constructor(dto: ICategoryDto) {
		let questions: IQuestion[] = [];
		if (dto.questions) {
			questions = dto.questions.map(questionDto => new Question(questionDto, dto.id).question);
		}
		this.category = {
			partitionKey: dto.partitionKey,
			id: dto.id,
			kind: dto.kind,
			parentCategory: dto.parentCategory,
			title: dto.title,
			// words: string[];
			level: dto.level,
			variations: dto.variations,
			numOfQuestions: dto.numOfQuestions,
			hasSubCategories: dto.hasSubCategories,
			created: new WhoWhen2DateAndBy(dto.created).dateAndBy,
			modified: new WhoWhen2DateAndBy(dto.modified).dateAndBy,
			archived: false,
			questions
		}
	}
	category: ICategory
}


export interface IQuestionDto extends IRecordDto {
	//partitionKey: string;
	id: string;
	parentCategory: string;
	// but it is not a valid key
	title: string;
	assignedAnswers: number[];
	variations: string[];
	source: number;
	status: number;
}

export interface ICategoryDto extends IRecordDto {
	partitionKey: string;
	id: string;
	kind: number;
	parentCategory: string | null;
	// but it is not a valid key
	title: string;
	// words: string[];
	level: number;
	variations: string[];
	numOfQuestions: number;
	hasSubCategories: boolean;
	questions: IQuestionDto[];
	hasMoreQuestions: boolean;
}

export interface ICategoryInfo {
	id: string,
	level: number
}


export interface IParentInfo {
	partitionKey: string | null,
	parentCategory: string | null,
	startCursor?: number,
	includeQuestionId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean,
}


export interface ICategoriesState {
	mode: string | null;
	categories: ICategory[];
	currentCategoryExpanded: ICategoryKey | null;
	lastCategoryExpanded: ICategoryKey | null;
	categoryId_questionId_done: string | null;
	parentNodes: IParentCategories;
	loading: boolean;
	questionLoading: boolean,
	error?: Error;
}

export interface ICategoriesContext {
	state: ICategoriesState,
	reloadCategoryNode: (categoryKey: ICategoryKey, questionId: string | null) => Promise<any>;
	getSubCategories: (categoryKey: ICategoryKey) => void,
	createCategory: (category: ICategory) => void,
	viewCategory: (categoryKey: ICategoryKey) => void,
	editCategory: (categoryKey: ICategoryKey) => void,
	updateCategory: (category: ICategory, closeForm: boolean) => void,
	deleteCategory: (categoryKey: ICategoryKey) => void,
	deleteCategoryVariation: (id: string, name: string) => void,
	expandCategory: (category: ICategory, expand: boolean) => void,
	//////////////
	// questions
	//getCategoryQuestions: ({ parentCategory, level, inAdding }: IParentInfo) => void,
	loadCategoryQuestions: (parentInfo: IParentInfo) => void,
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;
	viewQuestion: (iquestionKey: IQuestionKey) => void;
	editQuestion: (questionKey: IQuestionKey) => void;
	updateQuestion: (question: IQuestion) => Promise<any>;
	assignQuestionAnswer: (questionId: string, answerId: number, assigned: IWhoWhen) => Promise<any>;
	unAssignQuestionAnswer: (questionId: string, answerId: number) => Promise<any>;
	createAnswer: (answer: IAnswer) => Promise<any>;
	deleteQuestion: (questionKey: IQuestionKey) => void;
}

export interface ICategoryFormProps {
	inLine: boolean;
	category: ICategory;
	mode: FormMode;
	submitForm: (category: ICategory) => void,
	children: string
}

export interface IQuestionFormProps {
	question: IQuestion;
	mode: FormMode;
	closeModal?: () => void;
	submitForm: (question: IQuestion) => void,
	showCloseButton: boolean;
	source: number,
	children: string
}

export interface IParentCategories {
	categoryId: string | null;
	questionId: string | null;
	//parentNodesIds: string[] | null;
	parentNodesIds: ICategoryKeyExtended[] | null;

}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_CATEGORY_LOADING = 'SET_CATEGORY_LOADING',
	SET_CATEGORY_QUESTIONS_LOADING = 'SET_CATEGORY_QUESTIONS_LOADING',
	SET_SUB_CATEGORIES = 'SET_SUB_CATEGORIES',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	CLEAN_TREE = 'CLEAN_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_CATEGORY = 'ADD_SUB_CATEGORY',
	SET_CATEGORY = 'SET_CATEGORY',
	SET_ADDED_CATEGORY = 'SET_ADDED_CATEGORY',
	VIEW_CATEGORY = 'VIEW_CATEGORY',
	EDIT_CATEGORY = 'EDIT_CATEGORY',
	DELETE = 'DELETE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',
	SET_EXPANDED = 'SET_EXPANDED',

	SET_PARENT_CATEGORIES = "SET_PARENT_CATEGORIES",

	// questions
	LOAD_CATEGORY_QUESTIONS = 'LOAD_CATEGORY_QUESTIONS',
	ADD_QUESTION = 'ADD_QUESTION',
	VIEW_QUESTION = 'VIEW_QUESTION',
	EDIT_QUESTION = 'EDIT_QUESTION',

	SET_QUESTION = 'SET_QUESTION',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
	SET_QUESTION_ANSWERS = 'SET_QUESTION_ANSWERS',
	DELETE_QUESTION = 'DELETE_QUESTION',

	CLOSE_QUESTION_FORM = 'CLOSE_QUESTION_FORM',
	CANCEL_QUESTION_FORM = 'CANCEL_QUESTION_FORM'
}

export type CategoriesPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_CATEGORY_LOADING]: {
		id: string;
		loading: boolean;
	}

	[ActionTypes.SET_CATEGORY_QUESTIONS_LOADING]: {
		questionLoading: boolean;
	}


	[ActionTypes.SET_PARENT_CATEGORIES]: {
		parentNodes: IParentCategories
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		subCategories: ICategory[];
	};

	[ActionTypes.ADD_SUB_CATEGORY]: IParentInfo;

	[ActionTypes.VIEW_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.EDIT_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_ADDED_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.DELETE]: {
		id: string;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		category: ICategory;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_CATEGORY_FORM]: undefined;

	[ActionTypes.CANCEL_CATEGORY_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		categoryKey: ICategoryKey;
		expanding: boolean;
	}

	[ActionTypes.SET_ERROR]: {
		error: Error;
	};

	/////////////
	// questions
	[ActionTypes.LOAD_CATEGORY_QUESTIONS]: {
		parentCategory: string | null,
		questions: IQuestion[],
		hasMoreQuestions: boolean
	};

	[ActionTypes.ADD_QUESTION]: {
		categoryInfo: ICategoryInfo;
	}

	[ActionTypes.VIEW_QUESTION]: {
		question: IQuestion;
	};

	[ActionTypes.EDIT_QUESTION]: {
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION]: {
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_ANSWERS]: {
		answers: IAssignedAnswer[];
	};

	[ActionTypes.DELETE_QUESTION]: {
		questionKey: IQuestionKey
	};

	[ActionTypes.CLOSE_QUESTION_FORM]: {
		question: IQuestion;
	};

	[ActionTypes.CANCEL_QUESTION_FORM]: {
		question: IQuestion;
	};

};

export type CategoriesActions =
	ActionMap<CategoriesPayload>[keyof ActionMap<CategoriesPayload>];

