import { IQuestionKey } from 'categories/types';
import { ActionMap, IWhoWhen, IRecord, IRecordDto, Dto2WhoWhen, WhoWhen2Dto, IWhoWhenDto, IShortGroup } from 'global/types';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingGroup: 'AddingGroup',
	ViewingGroup: 'ViewingGroup',
	EditingGroup: 'EditingGroup',
	DeletingGroup: 'DeletingGroup',

	// tags
	AddingVariation: 'AddingVariation',
	EditingVariation: 'EditingVariation',
	ViewingVariation: 'ViewingVariation',

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



//////////////////////////////////////
// Answer

export interface IAnswerRow extends IRecord {
	partitionKey: string;
	id: string;
	title: string;
	link: string | null;
	parentGroup: string;
	groupTitle: string;
	included?: boolean;
}

export interface IAnswer extends IAnswerRow {
	source: number;
	status: number;
	//GroupTitle?: string;
}

export interface IGroupKey {
	partitionKey: string;
	id: string;
}

export interface IGroupKeyExtended extends IGroupKey {
	title: string;
}


export interface IAnswerKey {
	partitionKey: string;
	id: string;
}


export interface IVariation {
	name: string;
}

export interface IGroup extends IRecord {
	partitionKey: string; // | null is a valid value so you can store data with null value in indexeddb 
	id: string;
	kind: number;
	parentGroup: string | null; // | null is a valid value so you can store data with null value in indexeddb 
	// but it is not a valid key
	title: string;
	link: string | null;
	header: string;
	level: number;
	variations: string[];
	answers: IAnswer[];
	numOfAnswers: number;
	hasMoreAnswers?: boolean;
	isExpanded?: boolean;
	isSelected?: boolean;
	hasSubGroups: boolean;
	groups?: IGroup[]; // used for export to json
	titlesUpTheTree?: string;
}


export class AnswerRow {
	constructor(rowDto: IAnswerRowDto) { //, parentCategory: string) {
		this.answerRow = {
			parentGroup: rowDto.ParentGroup,
			partitionKey: rowDto.PartitionKey,
			id: rowDto.Id,
			title: rowDto.Title,
			groupTitle: rowDto.GroupTitle,
			link: rowDto.Link,
			created: new Dto2WhoWhen(rowDto.Created!).whoWhen,
			modified: rowDto.Modified
				? new Dto2WhoWhen(rowDto.Modified).whoWhen
				: undefined,
			included: rowDto.Included
		}
	}
	answerRow: IAnswerRow
}


export class Answer {
	constructor(dto: IAnswerDto) { //, parentGroup: string) {
		this.answer = {
			parentGroup: dto.ParentGroup,
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			title: dto.Title,
			link: dto.Link,
			groupTitle: dto.GroupTitle,
			source: dto.Source,
			status: dto.Status,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined
		}
	}
	answer: IAnswer
}



export class Group {
	constructor(dto: IGroupDto) {
		this.group = {
			partitionKey: dto.PartitionKey,
			id: dto.Id,
			kind: dto.Kind,
			parentGroup: dto.ParentGroup!,
			header: dto.Header,
			link: dto.Link,
			title: dto.Title,
			level: dto.Level!,
			variations: dto.Variations ?? [],
			numOfAnswers: dto.NumOfAnswers!,
			hasSubGroups: dto.HasSubGroups!,
			created: new Dto2WhoWhen(dto.Created!).whoWhen,
			modified: dto.Modified
				? new Dto2WhoWhen(dto.Modified).whoWhen
				: undefined,
			answers: dto.Answers
				? dto.Answers.map(answerDto => new Answer(answerDto/*, dto.Id*/).answer)
				: []
		}
	}
	group: IGroup;
}


export class GroupDto {
	constructor(group: IGroup) {
		this.groupDto = {
			PartitionKey: group.partitionKey,
			Id: group.id,
			Kind: group.kind,
			ParentGroup: group.parentGroup,
			Header: group.header,
			Title: group.title,
			Link: group.link,
			Level: group.level,
			Variations: group.variations,
			Created: new WhoWhen2Dto(group.created).whoWhenDto!,
			Modified: new WhoWhen2Dto(group.modified).whoWhenDto!
		}
	}
	groupDto: IGroupDto;
}

export interface IGroupDtoEx {
	groupDto: IGroupDto | null;
	msg: string;
}



export class AnswerDto {
	constructor(answer: IAnswer) {
		this.answerDto = {
			PartitionKey: answer.partitionKey,
			Id: answer.id,
			ParentGroup: answer.parentGroup,
			Title: answer.title,
			Link: answer.link ?? null,
			GroupTitle: "",
			Source: answer.source,
			Status: answer.status,
			Created: new WhoWhen2Dto(answer.created).whoWhenDto!,
			Modified: new WhoWhen2Dto(answer.modified).whoWhenDto!
		}
	}
	answerDto: IAnswerDto;
}

export interface IAnswerRowDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	ParentGroup: string;
	// but it is not a valid key
	Title: string;
	Link: string | null;
	GroupTitle: string;
	Included?: boolean;
	Source: number;
	Status: number;
}

export interface IAnswerDto extends IAnswerRowDto {
}

export interface IAnswerEx {
	answer: IAnswer | null;
	msg: string;
}

export interface IAnswerDtoEx {
	answerDto: IAnswerDto | null;
	msg: string;
}

export interface IAnswersMore {
	answers: IAnswerDto[];
	hasMoreAnswers: boolean;
}

export interface IGroupDto extends IRecordDto {
	PartitionKey: string;
	Id: string;
	Kind: number;
	ParentGroup: string | null;
	Header: string;
	Title: string;
	Link: string | null;
	Variations: string[];
	Level?: number;
	NumOfAnswers?: number;
	HasSubGroups?: boolean;
	Answers?: IAnswerDto[];
	HasMoreAnswers?: boolean;
}

export interface IGroupDtoListEx {
	groupDtoList: IGroupDto[];
	msg: string;
}


export class GroupKey {
	constructor(shortGroup: IShortGroup | undefined) {
		this.groupKey = shortGroup
			? {
				partitionKey: shortGroup.partitionKey,
				id: shortGroup.id
			}
			: null
	}
	groupKey: IGroupKey | null;
}


export interface IGroupInfo {
	partitionKey: string;
	id: string,
	level: number
}

export interface IParentInfo {
	execute?: (method: string, endpoint: string) => Promise<any>,
	// partitionKey: string | null,
	// parentGroup: string | null,
	groupKey: IGroupKey,
	startCursor?: number,
	includeAnswerId?: string | null
	level?: number,
	title?: string, // to easier follow getting the list of sub-groups
	inAdding?: boolean,
}


export interface IGroupsState {
	mode: string | null;
	groups: IGroup[];
	groupNodesUpTheTree: IGroupKeyExtended[];
	groupKeyExpanded: IGroupKey | null;
	groupId: string | null;
	answerId: string | null;
	groupId_answerId_done?: string;
	groupNodeReLoading: boolean;
	groupNodeLoaded: boolean;
	//reloadGroupInfo: IParentGroups;
	loading: boolean;
	answerLoading: boolean,
	error?: Error;
	whichRowId?: string; // group.id or answer.id
}

export interface ILocStorage {
	lastGroupKeyExpanded: IGroupKey | null;
	answerId: string | null;
}


export interface IGroupsContext {
	state: IGroupsState,
	reloadGroupNode: (groupKey: IGroupKey, answerId: string | null) => Promise<any>;
	getSubGroups: (groupKey: IGroupKey) => Promise<any>,
	createGroup: (group: IGroup) => void,
	viewGroup: (groupKey: IGroupKey, includeAnswerId: string) => void,
	editGroup: (groupKey: IGroupKey, includeAnswerId: string) => void,
	updateGroup: (group: IGroup, closeForm: boolean) => void,
	deleteGroup: (group: IGroup) => void,
	deleteGroupVariation: (groupKey: IGroupKey, name: string) => void,
	expandGroup: (groupKey: IGroupKey, includeAnswerId: string) => void,
	collapseGroup: (groupKey: IGroupKey) => void,
	//////////////
	// answers
	//getGroupAnswers: ({ parentGroup, level, inAdding }: IParentInfo) => void,
	loadGroupAnswers: (parentInfo: IParentInfo) => void,
	//createAnswer: (answer: IAnswer, fromModal: boolean) => Promise<any>;
	viewAnswer: (answerKey: IAnswerKey) => void;
	editAnswer: (answerKey: IAnswerKey) => void;
	updateAnswer: (answer: IAnswer) => Promise<any>;
	createAnswer: (answer: IAnswer) => Promise<any>;
	deleteAnswer: (answer: IAnswer) => void;
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
	source: number,
	children: string
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
	SET_COLLAPSED = 'SET_COLLAPSED',

	RELOAD_GROUP_NODE = "RELOAD_GROUP_NODE",
	GROUP_NODE_LOADING = "GROUP_NODE_LOADING",
	SET_GROUP_NODES_UP_THE_TREE = "SET_GROUP_NODES_UP_THE_TREE",

	// answers
	LOAD_GROUP_ANSWERS = 'LOAD_GROUP_ANSWERS',
	ADD_ANSWER = 'ADD_ANSWER',
	VIEW_ANSWER = 'VIEW_ANSWER',
	EDIT_ANSWER = 'EDIT_ANSWER',

	SET_ANSWER = 'SET_ANSWER',
	SET_ANSWER_AFTER_ASSIGN_ANSWER = 'SET_ANSWER_AFTER_ASSIGN_ANSWER',
	SET_ANSWER_ANSWERS = 'SET_ANSWER_ANSWERS',
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


	[ActionTypes.RELOAD_GROUP_NODE]: {
		groupNodesUpTheTree: IGroupKeyExtended[];
		groupId: string | null;
		answerId: string | null;
	};

	[ActionTypes.SET_SUB_GROUPS]: {
		subGroups: IGroup[];
	};

	[ActionTypes.ADD_SUB_GROUP]: {
		groupKey: IGroupKey,
		level: number
	}

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
		groupKey: IGroupKey;
	};

	[ActionTypes.CLEAN_TREE]: undefined;

	[ActionTypes.CLOSE_GROUP_FORM]: undefined;

	[ActionTypes.CANCEL_GROUP_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		groupKey: IGroupKey;
	}

	[ActionTypes.SET_COLLAPSED]: {
		groupKey: IGroupKey;
	}

	[ActionTypes.SET_ERROR]: {
		error: Error;
		whichRowId?: string;
	};

	[ActionTypes.GROUP_NODE_LOADING]: {
		loading: boolean
	};

	[ActionTypes.SET_GROUP_NODES_UP_THE_TREE]: {
		groupNodesUpTheTree: IGroupKeyExtended[]; /// we could have used Id only
		groupKey: IGroupKey | null;
		answerId: string | null;
	};

	/////////////
	// answers
	[ActionTypes.LOAD_GROUP_ANSWERS]: {
		parentGroup: string | null,
		answerRowDtos: IAnswerRowDto[],
		hasMoreAnswers: boolean
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

	[ActionTypes.SET_ANSWER_ANSWERS]: {
		answers: IAssignedAnswer[];
	};

	[ActionTypes.DELETE_ANSWER]: {
		answer: IAnswer
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

