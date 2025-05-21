import { ActionMap, IWhoWhen, IRecord, IRecordDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto, ICat } from 'global/types';
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

export interface IFromUserAssignedAnswer {
	id: string,
	createdBy: string
}

/////////////////////////////////////
// Question Related Filters

export interface IRelatedFilter {
	questionKey: IQuestionKey | null;
	filter: string;
	numOfUsages: number;
	created: IWhoWhen | null;
	lastUsed: IWhoWhen | null;
}

export interface IRelatedFilterDto {
	QuestionKey: IQuestionKey | null;
	Filter: string;
	NumOfUsages: number;
	Created: IWhoWhenDto | null;
	LastUsed: IWhoWhenDto | null;
}

export interface IRelatedFilterDtoEx {
	relatedFilterDto: IRelatedFilterDto | null;
	msg: string;
}


export class RelatedFilterDto {
	constructor(relatedFilter: IRelatedFilter) {
		const { questionKey, filter, numOfUsages, created, lastUsed } = relatedFilter;
		this.relatedFilterDto = {
			QuestionKey: questionKey,
			Filter: filter,
			Created: created ? new WhoWhen2Dto(created).whoWhenDto! : null,
			LastUsed: lastUsed ? new WhoWhen2Dto(lastUsed).whoWhenDto! : null,
			NumOfUsages: numOfUsages
		}
	}
	relatedFilterDto: IRelatedFilterDto;
}

export class RelatedFilter {
	constructor(dto: IRelatedFilterDto) {
		const { QuestionKey, Filter, Created, LastUsed, NumOfUsages } = dto;
		this.relatedFilter = {
			questionKey: QuestionKey,
			filter: Filter,
			created: Created ? new Dto2WhoWhen(Created).whoWhen! : null,
			lastUsed: LastUsed ? new Dto2WhoWhen(LastUsed).whoWhen! : null,
			numOfUsages: NumOfUsages
		}
	}
	relatedFilter: IRelatedFilter;
}

export interface IQuestionRow extends IRecord {
	partitionKey: string;
	id: string;
	title: string;
	parentCategory: string;
	categoryTitle: string;
	included?: boolean;
}

export interface IQuestion extends IQuestionRow {
	assignedAnswers: IAssignedAnswer[];
	numOfAssignedAnswers: number;
	relatedFilters: IRelatedFilter[]
	numOfRelatedFilters: number,
	source: number;
	status: number;
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[];
	//CategoryTitle?: string;
}

export interface ICategoryKey {
	partitionKey: string;
	id: string;
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
	title: string;
	link: string | null;
	header: string;
	level: number;
	variations: string[];
	questions: IQuestion[];
	numOfQuestions: number;
	hasMoreQuestions?: boolean;
	isExpanded?: boolean;
	isSelected?: boolean; // when category has no subCategories
	hasSubCategories: boolean;
	categories?: ICategory[]; // used for export to json
	titlesUpTheTree?: string;
}


export class QuestionRow {
	constructor(rowDto: IQuestionRowDto) { //, parentCategory: string) {
		this.questionRow = {
			parentCategory: rowDto.ParentCategory,
			partitionKey: rowDto.PartitionKey,
			id: rowDto.Id,
			title: rowDto.Title,
			categoryTitle: rowDto.CategoryTitle,
			created: new Dto2WhoWhen(rowDto.Created!).whoWhen,
			modified: rowDto.Modified
				? new Dto2WhoWhen(rowDto.Modified).whoWhen
				: undefined,
			included: rowDto.Included
		}
	}
	questionRow: IQuestionRow
}

export class Question {
	constructor(dto: IQuestionDto) { //, parentCategory: string) {
		const assignedAnswers = dto.AssignedAnswerDtos ?
			dto.AssignedAnswerDtos.map((dto: IAssignedAnswerDto) => new AssignedAnswer(dto).assignedAnswer)
			: [];
		const relatedFilters = dto.RelatedFilterDtos
			? dto.RelatedFilterDtos.map((Dto: IRelatedFilterDto) => new RelatedFilter(Dto).relatedFilter)
			: [];
		// TODO possible to call base class construtor
		this.question = {
			parentCategory: dto.ParentCategory,
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			title: dto.Title,
			categoryTitle: dto.CategoryTitle,
			assignedAnswers,
			numOfAssignedAnswers: dto.NumOfAssignedAnswers ?? 0,
			relatedFilters,
			numOfRelatedFilters: dto.NumOfRelatedFilters ?? 0,
			source: dto.Source ?? 0,
			status: dto.Status ?? 0,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	question: IQuestion
}


export class CategoryKey {
	constructor(cat: ICat | undefined) {
		this.categoryKey = cat
			? {
				partitionKey: cat.partitionKey,
				id: cat.id
			}
			: null
	}
	categoryKey: ICategoryKey | null;
}


export class Category {
	constructor(dto: ICategoryDto) {
		this.category = {
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			kind: dto.Kind,
			parentCategory: dto.ParentCategory!,
			title: dto.Title,
			link: dto.Link,
			header: dto.Header,
			level: dto.Level!,
			variations: dto.Variations ?? [],
			numOfQuestions: dto.NumOfQuestions!,
			hasSubCategories: dto.HasSubCategories!,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined,
			questions: dto.Questions
				? dto.Questions.map(questionRowDto => new Question(questionRowDto/*, dto.Id*/).question)
				: []
		}
	}
	category: ICategory;
}


export class CategoryDto {
	constructor(category: ICategory) {
		const { partitionKey, id, kind, parentCategory, title, link, header, level, variations, created, modified } = category;
		this.categoryDto = {
			PartitionKey: partitionKey,
			Id: id,
			Kind: kind,
			ParentCategory: parentCategory,
			Title: title,
			Link: link,
			Header: header,
			Level: level,
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	categoryDto: ICategoryDto;
}



export class QuestionDto {
	constructor(question: IQuestion) {
		this.questionDto = {
			PartitionKey: question.partitionKey,
			Id: question.id,
			ParentCategory: question.parentCategory,
			Title: question.title,
			CategoryTitle: "",
			//AssignedAnswerDtos: question.assignedAnswers.map((a: IAssignedAnswer) => new AssignedAnswerDto(a).assignedAnswerDto),
			//NumOfAssignedAnswers: question.numOfAssignedAnswers,
			//RelatedFilterDtos: question.relatedFilters.map((a: IRelatedFilter) => new RelatedFilterDto(a).relatedFilterDto),
			//NumOfRelatedFilters: question.numOfAssignedAnswers,
			Source: question.source,
			Status: question.status,
			Created: new WhoWhen2Dto(question.created).whoWhenDto!,
			Modified: new WhoWhen2Dto(question.modified).whoWhenDto!
		}
	}
	questionDto: IQuestionDto;
}

export interface IQuestionRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	ParentCategory: string;
	Title: string;
	CategoryTitle: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IQuestionDto extends IQuestionRowDto {
	AssignedAnswerDtos?: IAssignedAnswerDto[];
	NumOfAssignedAnswers?: number,
	RelatedFilterDtos?: IRelatedFilterDto[]
	NumOfRelatedFilters?: number
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

export interface ICategoryDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	Kind: number;
	ParentCategory: string | null;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level?: number;
	NumOfQuestions?: number;
	HasSubCategories?: boolean;
	Questions?: IQuestionRowDto[];
	HasMoreQuestions?: boolean;
}

export interface ICategoryDtoEx {
	categoryDto: ICategoryDto | null;
	msg: string;
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
	//execute?: (method: string, endpoint: string) => Promise<any>,
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
	categoryNodeReLoading: boolean;
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
	deleteCategory: (category: ICategory) => void,
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
	RESET_CATEGORY_QUESTION_DONE = 'RESET_CATEGORY_QUESTION_DONE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_COLLAPSED = 'SET_COLLAPSED',

	CATEGORY_NODE_LOADING = "CATEGORY_NODE_LOADING",
	SET_CATEGORY_NODES_UP_THE_TREE = "SET_CATEGORY_NODES_UP_THE_TREE",

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


	[ActionTypes.CATEGORY_NODE_LOADING]: {
		loading: boolean
	};

	[ActionTypes.SET_CATEGORY_NODES_UP_THE_TREE]: {
		categoryNodesUpTheTree: ICategoryKeyExtended[];
		categoryKey: ICategoryKey | null;
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
		categoryKey: ICategoryKey | null;
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

	[ActionTypes.RESET_CATEGORY_QUESTION_DONE]: undefined;


	/////////////
	// questions
	[ActionTypes.LOAD_CATEGORY_QUESTIONS]: {
		parentCategory: string | null,
		questionRowDtos: IQuestionRowDto[],
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

