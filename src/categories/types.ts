import { ActionMap, IWhoWhen, IRecord, IRecordDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto } from 'global/types';
import { AssignedAnswer, AssignedAnswerDto, IAnswer, IAnswerKey, IAssignedAnswer, IAssignedAnswerDto } from 'groups/types';

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





export interface IFromUserAssignedAnswer {
	id: string,
	createdBy: string
}

export interface IQuestion extends IRecord {
	partitionKey: string;
	id: string;
	title: string;
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
	partitionKey: string; // can be null but we put 'root' instead
	id: string;  // can be null but we put 'root' instead
}

export interface ICategoryKeyExtended extends ICategoryKey {
	title: string;
}


export interface IQuestionKey {
	parentCategory?: string;
	partitionKey: string;
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
	constructor(dto: IQuestionDto) { //, parentCategory: string) {
		const assignedAnswers = dto.AssignedAnswerDtos.map((aDto: IAssignedAnswerDto) => new AssignedAnswer(aDto).assignedAnswer);
		this.question = {
			parentCategory: dto.ParentCategory,
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			title: dto.Title,
			categoryTitle: dto.CategoryTitle,
			assignedAnswers,
			numOfAssignedAnswers: dto.NumOfAssignedAnswers,
			source: dto.Source,
			status: dto.Status,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	question: IQuestion
}

export class Category {
	constructor(categoryDto: ICategoryDto) {
		const { PartitionKey, Id, Kind, ParentCategory, Title, Level, Variations, Created, Modified, 
						NumOfQuestions, HasSubCategories, Questions } = categoryDto;
		this.category = {
			partitionKey: PartitionKey!,
			id: Id!,
			kind: Kind,
			parentCategory: ParentCategory ?? null,
			title: Title,
			level: Level!,
			variations: Variations ?? [],
			numOfQuestions: NumOfQuestions!,
			hasSubCategories: HasSubCategories!,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			questions: Questions
				? Questions.map(questionDto => new Question(questionDto).question)
				: []
		}
	}
	category: ICategory;
}


export class CategoryDto {
	constructor(category: ICategory) {
		const PartitionKey = category.partitionKey === 'root' ? null : category.partitionKey;
		const Id = category.id === 'root' ? null : category.id;
		const ParentCategory = category.parentCategory === 'root' ? null : category.parentCategory;
		const { kind, parentCategory, title, level, variations, created, modified } = category;
		this.categoryDto = {
			PartitionKey,
			Id,
			ParentCategory,
			Kind: kind,
			Title: title,
			Level: level,
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	categoryDto: ICategoryDto;
}

export interface ICategoryDtoEx {
	categoryDto: ICategoryDto | null;
	msg: string;
}



export class QuestionDto {
	constructor(question: IQuestion) {
		this.questionDto = {
			PartitionKey: question.partitionKey,
			Id: question.id,
			ParentCategory: question.parentCategory,
			Title: question.title,
			CategoryTitle: "",
			AssignedAnswerDtos: question.assignedAnswers.map((a: IAssignedAnswer) => new AssignedAnswerDto(a).assignedAnswerDto),
			NumOfAssignedAnswers: question.numOfAssignedAnswers,
			Source: question.source,
			Status: question.status,
			Created: new WhoWhen2Dto(question.created).whoWhenDto!,
			Modified: new WhoWhen2Dto(question.modified).whoWhenDto!
		}
	}
	questionDto: IQuestionDto;
}

export interface IQuestionDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	ParentCategory: string;
	// but it is not a valid key
	Title: string;
	CategoryTitle: string;
	AssignedAnswerDtos: IAssignedAnswerDto[];
	NumOfAssignedAnswers: number,
	Source: number;
	Status: number;
}

export interface IQuestionDtoEx {
	questionDto: IQuestionDto | null;
	msg: string;
}

export interface IQuestionEx {
	question: IQuestion | null;
	msg: string;
}


export interface IQuestionsMore {
	questions: IQuestionDto[];
	hasMoreQuestions: boolean;
}

export interface IQuestDto {
	PartitionKey: string;
	ParentCategory: string;
	Title: string;
	Id: string;
}

export interface IQuest {
	partitionKey: string;
	id: string;
	parentCategory: string;
	title: string;
	categoryTitle?: string;
}


export interface ICategoryDto extends IRecordDto {
	PartitionKey: string | null;
	Id: string | null;
	Kind: number;
	ParentCategory: string | null;
	Title: string;
	Variations: string[];
	Level?: number;
	NumOfQuestions?: number;
	HasSubCategories?: boolean;
	Questions?: IQuestionDto[];
	HasMoreQuestions?: boolean;
}

export interface ICategoryDtoListEx {
	categoryDtoList: ICategoryDto[];
	msg: string;
}


export interface ICategoryInfo {
	partitionKey: string;
	id: string,
	level: number
}

export interface IParentInfo {
	// execute?: (method: string, endpoint: string) => Promise<any>,
	// partitionKey: string | null,
	// parentCategory: string | null,
	categoryKey: ICategoryKey,
	startCursor?: number,
	includeQuestionId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean,
}


export interface ICategoriesState {
	mode: string | null;
	categories: ICategory[];
	categoryNodesUpTheTree: ICategoryKeyExtended[];
	categoryKeyExpanded: ICategoryKey | null;
	categoryId: string | null;
	questionId: string | null;
	categoryId_questionId_done?: string;
	categoryNodeLoaded: boolean;
	//reloadCategoryInfo: IParentCategories;
	loading: boolean;
	questionLoading: boolean,
	error?: Error;
	whichRowId?: string; // category.id or question.id
}

export interface ILocStorage {
	lastCategoryKeyExpanded: ICategoryKey | null;
	questionId: string | null;
}


export interface ICategoriesContext {
	state: ICategoriesState,
	reloadCategoryNode: (categoryKey: ICategoryKey, questionId: string | null) => Promise<any>;
	getSubCategories: (categoryKey: ICategoryKey) => Promise<any>,
	createCategory: (category: ICategory) => void,
	viewCategory: (categoryKey: ICategoryKey, includeQuestionId: string) => void,
	editCategory: (categoryKey: ICategoryKey, includeQuestionId: string) => void,
	updateCategory: (category: ICategory, closeForm: boolean) => void,
	deleteCategory: (categoryKey: ICategoryKey) => void,
	deleteCategoryVariation: (categoryKey: ICategoryKey, name: string) => void,
	expandCategory: (categoryKey: ICategoryKey, includeQuestionId: string) => void,
	collapseCategory: (categoryKey: ICategoryKey) => void,
	//////////////
	// questions
	//getCategoryQuestions: ({ parentCategory, level, inAdding }: IParentInfo) => void,
	loadCategoryQuestions: (parentInfo: IParentInfo) => void,
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;
	viewQuestion: (questionKey: IQuestionKey) => void;
	editQuestion: (questionKey: IQuestionKey) => void;
	updateQuestion: (question: IQuestion) => Promise<any>;
	assignQuestionAnswer: (action: string, questionKey: IQuestionKey, answerKey: IAnswerKey, assigned: IWhoWhen) => Promise<any>;
	createAnswer: (answer: IAnswer) => Promise<any>;
	deleteQuestion: (question: IQuestion) => void;
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
	SET_COLLAPSED = 'SET_COLLAPSED',

	RELOAD_CATEGORY_NODE = "RELOAD_CATEGORY_NODE",

	// questions
	LOAD_CATEGORY_QUESTIONS = 'LOAD_CATEGORY_QUESTIONS',
	ADD_QUESTION = 'ADD_QUESTION',
	VIEW_QUESTION = 'VIEW_QUESTION',
	EDIT_QUESTION = 'EDIT_QUESTION',

	SET_QUESTION_SELECTED = 'SET_QUESTION_SELECTED',
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


	[ActionTypes.RELOAD_CATEGORY_NODE]: {
		categoryNodesUpTheTree: ICategoryKeyExtended[];
		categoryId: string | null;
		questionId: string | null;
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		subCategories: ICategory[];
	};

	[ActionTypes.ADD_SUB_CATEGORY]: {
		categoryKey: ICategoryKey,
		level: number
	}

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
		categoryKey: ICategoryKey;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_CATEGORY_FORM]: undefined;

	[ActionTypes.CANCEL_CATEGORY_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		categoryKey: ICategoryKey;
	}

	[ActionTypes.SET_COLLAPSED]: {
		categoryKey: ICategoryKey;
	}

	[ActionTypes.SET_ERROR]: {
		error: Error;
		whichRowId?: string;
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

	[ActionTypes.SET_QUESTION_SELECTED]: {
		questionKey: IQuestionKey;
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
		question: IQuestion
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

