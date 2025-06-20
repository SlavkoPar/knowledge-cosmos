import { ActionMap, IWhoWhen, IRecord, IRecordDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto } from 'global/types';
import { IAnswer, IAnswerKey } from 'groups/types';

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
	numOfAssignedAnswers: number;
	parentCategory: string | null;
	categoryTitle?: string;
	isSelected?: boolean;
}

export interface IQuestion extends IQuestionRow {
	assignedAnswers: IAssignedAnswer[];
	relatedFilters: IRelatedFilter[]
	numOfRelatedFilters: number,
	source: number;
	status: number;
	fromUserAssignedAnswer?: IFromUserAssignedAnswer[];
	//CategoryTitle?: string;
}

export interface ICategoryKey {
	partitionKey: string | null;
	id: string | null;
}

export interface ICategoryKeyExpanded { //extends ICategoryKey {
	partitionKey: string | null;
	id: string | null;
	questionId: string | null;
}

export interface ILocStorage {
	lastCategoryKeyExpanded: ICategoryKeyExpanded | null
}


export interface ICategoryKeyExtended extends ICategoryKey {
	title: string;
}


export interface IQuestionKey {
	parentCategory?: string;
	partitionKey: string | null;   // ona day we are going to enable question
	id: string;
}


export interface IVariation {
	name: string;
}

export interface ICategoryRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	Kind: number;
	RootId?: string;
	ParentCategory: string | null;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level: number;
	HasSubCategories: boolean;
	SubCategories: ICategoryRowDto[];
	NumOfQuestions: number;
	QuestionRowDtos?: IQuestionRowDto[];
	HasMoreQuestions?: boolean;
	IsExpanded?: boolean;
}

export interface ICategoryRow extends IRecord {
	partitionKey: string; // | null is a valid value so you can store data with null value in indexeddb 
	id: string;
	kind: number;
	rootId: string;
	parentCategory: string | null; // | null is a valid value so you can store data with null value in indexeddb 
	title: string;
	link: string | null;
	header: string;
	level: number;
	hasSubCategories: boolean;
	subCategories: ICategoryRow[];
	variations: string[];
	numOfQuestions: number;
	questionRows: IQuestionRow[];
	hasMoreQuestions?: boolean;
	isExpanded?: boolean;
	titlesUpTheTree?: string;
}
export interface ICategory extends ICategoryRow {

}

export class CategoryRow {
	constructor(categoryRowDto: ICategoryRowDto) {
		const { PartitionKey, Id, RootId, ParentCategory, Kind, Title, Link, Header, Variations, Level,
			HasSubCategories, SubCategories,
			NumOfQuestions, QuestionRowDtos,
			IsExpanded } = categoryRowDto;
		this.categoryRow = {
			partitionKey: PartitionKey,
			id: Id,
			parentCategory: ParentCategory,
			title: Title,
			link: Link,
			header: Header,
			titlesUpTheTree: '', // traverse up the tree, until root
			variations: Variations,
			hasSubCategories: HasSubCategories!,
			subCategories: SubCategories.map(dto => new CategoryRow(dto).categoryRow),
			numOfQuestions: NumOfQuestions,
			questionRows: QuestionRowDtos ? QuestionRowDtos.map(dto => new QuestionRow(dto).questionRow) : [],
			level: Level,
			kind: Kind,
			isExpanded: IsExpanded,
			rootId: RootId!
		}
	}
	categoryRow: ICategoryRow;
}

export class QuestionRow {
	constructor(rowDto: IQuestionRowDto) { //, parentCategory: string) {
		this.questionRow = {
			partitionKey: rowDto.PartitionKey,
			id: rowDto.Id,
			parentCategory: rowDto.ParentCategory,
			numOfAssignedAnswers: rowDto.NumOfAssignedAnswers ?? 0,
			title: rowDto.Title,
			categoryTitle: rowDto.CategoryTitle,
			created: new Dto2WhoWhen(rowDto.Created!).whoWhen,
			modified: rowDto.Modified
				? new Dto2WhoWhen(rowDto.Modified).whoWhen
				: undefined,
			isSelected: rowDto.Included !== undefined
		}
	}
	questionRow: IQuestionRow
}

export class QuestionRowDto {
	constructor(row: IQuestionRow) { //, parentCategory: string) {
		this.questionRowDto = {
			PartitionKey: row.partitionKey,
			Id: row.id,
			ParentCategory: row.parentCategory ?? '',
			NumOfAssignedAnswers: row.numOfAssignedAnswers ?? 0,
			Title: '',
			CategoryTitle: '',
			Created: new WhoWhen2Dto(row.created!).whoWhenDto!,
			Modified: new WhoWhen2Dto(row.modified).whoWhenDto!,
			Included: row.isSelected
		}
	}
	questionRowDto: IQuestionRowDto
}


export class CategoryKey {
	constructor(cat: ICategoryRow | ICategory | ICategoryKeyExtended) {
		this.categoryKey = cat
			? {
				partitionKey: cat.partitionKey,
				id: cat.id
			}
			: null
	}
	categoryKey: ICategoryKey | null;
}




export interface ICategoryDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	Kind: number;
	RootId?: string;
	ParentCategory: string | null;
	Title: string;
	Link: string | null;
	Header: string;
	Variations: string[];
	Level: number;
	HasSubCategories?: boolean;
	SubCategories?: ICategoryDto[];
	NumOfQuestions?: number;
	QuestionRowDtos?: IQuestionRowDto[];
	HasMoreQuestions?: boolean;
	IsExpanded?: boolean;
}

export class Category {
	constructor(dto: ICategoryDto) {
		const { PartitionKey, Id, Kind, RootId, ParentCategory, Title, Link, Header, Level, Variations, NumOfQuestions,
			HasSubCategories, SubCategories, Created, Modified, QuestionRowDtos, IsExpanded } = dto;

		const subCategories = SubCategories
			? SubCategories.map((dto: ICategoryDto) => new Category(dto).category)
			: [];

		const questionRows = QuestionRowDtos
			? QuestionRowDtos.map((dto: IQuestionDto) => new Question(dto).question)
			: [];

		this.category = {
			partitionKey: PartitionKey,
			id: Id,
			kind: Kind,
			rootId: RootId!,
			parentCategory: ParentCategory!,
			title: Title,
			link: Link,
			header: Header,
			level: Level!,
			variations: Variations ?? [],
			hasSubCategories: HasSubCategories!,
			subCategories,
			created: new Dto2WhoWhen(Created!).whoWhen,
			modified: Modified
				? new Dto2WhoWhen(Modified).whoWhen
				: undefined,
			numOfQuestions: NumOfQuestions!,
			questionRows,
			isExpanded: IsExpanded === true
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
			Header: header ?? '',
			Level: level,
			Variations: variations,
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: new WhoWhen2Dto(modified).whoWhenDto!
		}
	}
	categoryDto: ICategoryDto;
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
			isSelected: dto.Included !== undefined,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	question: IQuestion
}

export class QuestionKey {
	constructor(question: IQuestion | undefined) {
		this.questionKey = question
			? {
				partitionKey: question.partitionKey,
				id: question.id,
				parentCategory: question.parentCategory ?? undefined
			}
			: null
	}
	questionKey: IQuestionKey | null;
}

export class QuestionDto {
	constructor(question: IQuestion) {
		this.questionDto = {
			PartitionKey: question.partitionKey,
			Id: question.id,
			ParentCategory: question.parentCategory ?? 'null',  // TODO proveri
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
	NumOfAssignedAnswers?: number,
	Title: string;
	CategoryTitle: string;
	Included?: boolean;
	Source?: number;
	Status?: number;
}

export interface IQuestionDto extends IQuestionRowDto {
	AssignedAnswerDtos?: IAssignedAnswerDto[];
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



export interface ICategoryDtoEx {
	categoryDto: ICategoryDto | null;
	msg: string;
}

export interface ICategoryRowDtoEx {
	categoryRowDto: ICategoryRowDto | null;
	msg: string;
}


export interface ICategoryDtoListEx {
	categoryDtoList: ICategoryDto[];
	msg: string;
}


export interface ICategoryInfo {
	categoryKey: ICategoryKey;
	level: number
}

export interface IParentInfo {
	//execute?: (method: string, endpoint: string) => Promise<any>,
	// partitionKey: string | null,
	// parentCategory: string | null,
	//categoryKey: ICategoryKey,
	categoryRow: ICategoryRow,
	startCursor?: number,
	includeQuestionId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean,
	isExpanded?: boolean
	//subCategories?: ICategory[]
}

export interface ICategoriesState {
	mode: string | null;
	firstLevelCategoryRows: ICategoryRow[];
	categoryKeyExpanded: ICategoryKeyExpanded | null;
	categoryId_questionId_done?: string;
	categoryNodeReLoading: boolean;
	categoryNodeLoaded: boolean;
	loading: boolean;
	questionLoading: boolean,
	error?: Error;
	whichRowId?: string; // category.id or question.id
	categoryInViewingOrEditing: ICategory | null;
	categoryInAdding: ICategory | null;
	questionInViewingOrEditing: IQuestion | null;
}

export interface ILocStorage {
	lastCategoryKeyExpanded: ICategoryKeyExpanded | null;
}

export interface ILoadCategoryQuestions {
	categoryKey: ICategoryKey,
	startCursor: number,
	includeQuestionId: string | null
}

export interface ICategoriesContext {
	state: ICategoriesState,
	reloadCategoryRowNode: (categoryKeyExpanded: ICategoryKeyExpanded, fromChatBotDlg?: string) => Promise<any>;
	getSubCategoryRows: (categoryKey: ICategoryKey) => Promise<any>,
	createCategory: (category: ICategory) => void,
	viewCategory: (categoryRow: ICategoryRow, includeQuestionId: string) => void,
	editCategory: (categoryRow: ICategoryRow, includeQuestionId: string) => void,
	updateCategory: (category: ICategory, closeForm: boolean) => void,
	deleteCategory: (category: ICategory) => void,
	deleteCategoryVariation: (categoryKey: ICategoryKey, name: string) => void,
	expandCategory: (rootId: string, categoryKey: ICategoryKey, includeQuestionId: string | null) => void,
	collapseCategory: (categoryRow: ICategoryRow) => void,
	//////////////
	// questions
	loadCategoryQuestions: (catParams: ILoadCategoryQuestions) => void;  //(parentInfo: IParentInfo) => void,
	createQuestion: (question: IQuestion, fromModal: boolean) => Promise<any>;
	viewQuestion: (questionKey: IQuestionKey) => void;
	editQuestion: (questionKey: IQuestionKey) => void;
	updateQuestion: (question: IQuestion, categoryChanged: boolean) => Promise<any>;
	assignQuestionAnswer: (action: string, questionKey: IQuestionKey, answerKey: IAnswerKey, assigned: IWhoWhen) => Promise<any>;
	deleteQuestion: (questionRow: IQuestionRow) => void;
}

export interface ICategoryFormProps {
	inLine: boolean;
	category: ICategory;
	questionId: string | null;
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


/////////////////////////////////////////////////
// Assigned Answers

export interface IAssignedAnswer {
	questionKey: IQuestionKey;
	answerKey: IAnswerKey;
	answerTitle: string;
	answerLink: string;
	created: IWhoWhen,
	modified: IWhoWhen | null
}

export interface IAssignedAnswerDto {
	QuestionKey: IQuestionKey;
	AnswerKey: IAnswerKey;
	AnswerTitle: string;
	AnswerLink: string;
	Created: IWhoWhenDto;
	Modified: IWhoWhenDto | null;
}

export interface IAssignedAnswerDtoEx {
	assignedAnswerDto: IAssignedAnswerDto | null;
	msg: string;
}

export class AssignedAnswerDto {
	constructor(assignedAnswer: IAssignedAnswer) {
		const { questionKey, answerKey, answerTitle, answerLink, created, modified } = assignedAnswer;
		this.assignedAnswerDto = {
			QuestionKey: questionKey,
			AnswerKey: answerKey,
			AnswerTitle: answerTitle ?? '',
			AnswerLink: answerTitle ?? '',
			Created: new WhoWhen2Dto(created).whoWhenDto!,
			Modified: modified ? new WhoWhen2Dto(modified).whoWhenDto! : null
		}
	}
	assignedAnswerDto: IAssignedAnswerDto;
}

export class AssignedAnswer {
	constructor(dto: IAssignedAnswerDto) {
		const { QuestionKey, AnswerKey, AnswerTitle, AnswerLink, Created, Modified } = dto;
		this.assignedAnswer = {
			questionKey: QuestionKey,
			answerKey: AnswerKey,
			answerTitle: AnswerTitle,
			answerLink: AnswerLink,
			created: new Dto2WhoWhen(Created).whoWhen!,
			modified: Modified ? new Dto2WhoWhen(Modified).whoWhen! : null
		}
	}
	assignedAnswer: IAssignedAnswer;
}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_CATEGORY_LOADING = 'SET_CATEGORY_LOADING',
	SET_CATEGORY_QUESTIONS_LOADING = 'SET_CATEGORY_QUESTIONS_LOADING',
	SET_FIRST_LEVEL_CATEGORY_ROWS = 'SET_FIRST_LEVEL_CATEGORY_ROWS',
	SET_SUB_CATEGORIES = 'SET_SUB_CATEGORIES',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_CATEGORY = 'ADD_SUB_CATEGORY',
	SET_CATEGORY = 'SET_CATEGORY',
	SET_CATEGORY_ROW = 'SET_CATEGORY_ROW',
	SET_CATEGORY_ROW_EXPANDED = 'SET_CATEGORY_ROW_EXPANDED',
	SET_CATEGORY_ROW_COLLAPSED = 'SET_CATEGORY_ROW_COLLAPSED',
	SET_ADDED_CATEGORY = 'SET_ADDED_CATEGORY',
	SET_CATEGORY_TO_VIEW = 'SET_CATEGORY_TO_VIEW',
	SET_CATEGORY_TO_EDIT = 'SET_CATEGORY_TO_EDIT',
	DELETE = 'DELETE',
	RESET_CATEGORY_QUESTION_DONE = 'RESET_CATEGORY_QUESTION_DONE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',

	CATEGORY_NODE_RE_LOADING = "CATEGORY_NODE_RE_LOADING",
	SET_CATEGORY_ROWS_UP_THE_TREE = "SET_CATEGORY_ROWS_UP_THE_TREE",

	// questions
	LOAD_CATEGORY_QUESTIONS = 'LOAD_CATEGORY_QUESTIONS',
	ADD_QUESTION = 'ADD_QUESTION',
	SET_VIEWING_EDITING_QUESTION = 'SET_VIEWING_EDITING_QUESTION',
	SET_QUESTION_TO_VIEW = 'SET_QUESTION_TO_VIEW',
	SET_QUESTION_TO_EDIT = 'SET_QUESTION_TO_EDIT',

	SET_QUESTION_SELECTED = 'SET_QUESTION_SELECTED',
	SET_QUESTION = 'SET_QUESTION',
	SET_QUESTION_AFTER_ASSIGN_ANSWER = 'SET_QUESTION_AFTER_ASSIGN_ANSWER',
	SET_QUESTION_ANSWERS = 'SET_QUESTION_ANSWERS',
	DELETE_QUESTION = 'DELETE_QUESTION',

	CLOSE_QUESTION_FORM = 'CLOSE_QUESTION_FORM',
	CANCEL_QUESTION_FORM = 'CANCEL_QUESTION_FORM'
}

export const actionsThatModifyFirstLevelCategoryRow = [
	// ActionTypes.SET_FIRST_LEVEL_CATEGORY_ROWS keep commented
	// ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE
	ActionTypes.SET_CATEGORY_ROW_EXPANDED,
	ActionTypes.SET_CATEGORY_ROW_COLLAPSED,
	ActionTypes.SET_CATEGORY_TO_VIEW,
	ActionTypes.SET_CATEGORY_TO_EDIT,
	ActionTypes.SET_QUESTION_TO_VIEW,
	ActionTypes.SET_QUESTION_TO_EDIT,
	ActionTypes.CLOSE_CATEGORY_FORM,
	ActionTypes.CANCEL_CATEGORY_FORM
]

export const actionTypesToLocalStore = [
	// ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE
	ActionTypes.SET_CATEGORY_ROW_EXPANDED,
	ActionTypes.SET_CATEGORY_ROW_COLLAPSED,
	ActionTypes.SET_CATEGORY_TO_VIEW,
	ActionTypes.SET_CATEGORY_TO_EDIT,
	ActionTypes.SET_QUESTION_TO_VIEW,
	ActionTypes.SET_QUESTION_TO_EDIT,
];


export type CategoriesPayload = {
	[ActionTypes.SET_LOADING]: {
		categoryRow?: ICategoryRow;
	}

	[ActionTypes.SET_CATEGORY_LOADING]: {
		categoryRow?: ICategoryRow;
		id: string;
		loading: boolean;
	}

	[ActionTypes.SET_CATEGORY_QUESTIONS_LOADING]: {
		categoryRow?: ICategoryRow;
		questionLoading: boolean;
	}

	[ActionTypes.CATEGORY_NODE_RE_LOADING]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.SET_CATEGORY_ROWS_UP_THE_TREE]: {
		// categoryNodesUpTheTree: ICategoryKeyExtended[]; /// we could have used Id only
		categoryRow: ICategoryRow;
		// categoryKeyExpanded: ICategoryKeyExpanded;
		questionId: string | null,
		fromChatBotDlg: boolean;
	};


	[ActionTypes.SET_FIRST_LEVEL_CATEGORY_ROWS]: {
		categoryRow?: ICategoryRow;
		id: string | null;
		firstLevelCategoryRows: ICategoryRow[];
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		categoryRow?: ICategoryRow;
		id: string | null;
		subCategoryRows: ICategoryRow[];
	};

	[ActionTypes.ADD_SUB_CATEGORY]: {
		categoryRow?: ICategoryRow;
		rootId: string,
		categoryKey: ICategoryKey,
		level: number
	}

	[ActionTypes.SET_CATEGORY]: {
		categoryRow: ICategory;
	};


	[ActionTypes.SET_CATEGORY_TO_VIEW]: {
		categoryRow: ICategoryRow; // ICategory extends ICategoryRow
	};

	[ActionTypes.SET_CATEGORY_TO_EDIT]: {
		categoryRow: ICategoryRow; // ICategory extends ICategoryRow
	};

	[ActionTypes.SET_CATEGORY_ROW_EXPANDED]: {
		categoryRow: ICategoryRow;
	};

	[ActionTypes.SET_CATEGORY_ROW_COLLAPSED]: {
		categoryRow: ICategoryRow;
	};

	[ActionTypes.SET_ADDED_CATEGORY]: {
		categoryRow?: ICategoryRow;
		category: ICategory;
	};

	[ActionTypes.DELETE]: {
		categoryRow?: ICategoryRow;
		id: string;
	};


	[ActionTypes.CLOSE_CATEGORY_FORM]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.CANCEL_CATEGORY_FORM]: {
		categoryRow?: ICategoryRow;
	};


	[ActionTypes.SET_ERROR]: {
		categoryRow?: ICategoryRow;
		error: Error;
		whichRowId?: string;
	};

	[ActionTypes.RESET_CATEGORY_QUESTION_DONE]: {
		categoryRow?: ICategoryRow
	};


	/////////////
	// questions
	[ActionTypes.LOAD_CATEGORY_QUESTIONS]: {
		categoryRow: ICategoryRow
	};

	[ActionTypes.ADD_QUESTION]: {
		categoryRow?: ICategoryRow;
		categoryInfo: ICategoryInfo;
	}

	[ActionTypes.SET_VIEWING_EDITING_QUESTION]: {
		categoryRow?: ICategoryRow;
	};

	[ActionTypes.SET_QUESTION_TO_VIEW]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_TO_EDIT]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION_SELECTED]: {
		categoryRow?: ICategoryRow;
		questionKey: IQuestionKey;
	};

	[ActionTypes.SET_QUESTION]: {
		categoryRow?: ICategoryRow;
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_AFTER_ASSIGN_ANSWER]: {
		categoryRow?: ICategoryRow;
		question: IQuestion
	};

	[ActionTypes.SET_QUESTION_ANSWERS]: {
		categoryRow?: ICategoryRow;
		answers: IAssignedAnswer[];
	};

	[ActionTypes.DELETE_QUESTION]: {
		categoryRow?: ICategoryRow;
		question: IQuestion
	};

	[ActionTypes.CLOSE_QUESTION_FORM]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};

	[ActionTypes.CANCEL_QUESTION_FORM]: {
		categoryRow?: ICategoryRow;
		question: IQuestion;
	};
};

export type CategoriesActions =
	ActionMap<CategoriesPayload>[keyof ActionMap<CategoriesPayload>];

