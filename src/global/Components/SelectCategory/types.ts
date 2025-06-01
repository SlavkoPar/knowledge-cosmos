import { ICategory, ICategoryKey, IQuestion, IQuestionEx, IQuestionKey, IQuestionRow } from 'categories/types';

import { ActionMap } from "global/types";

export interface ICat {
	partitionKey: string,
	id: string;
	parentCategory: string | null;
	header: string;
	title: string;
	link: string | null;
	titlesUpTheTree: string; // traverse up the tree, until root
	variations: string[];
	hasSubCategories: boolean;
	level: number;
	kind: number;
	isExpanded: boolean;
}



/////////////////////////////////////////////////////////////////////////
// DropDown Select Category

export interface ICatsState {
	loading: boolean,
	parentCategory: string | null,
	title: string,
	cats: ICat[], // drop down categories
	error?: Error;
}

export interface ICatInfo {
	categoryKey: ICategoryKey | null,
	level: number,
	setParentCategory: (cat: ICat) => void;
}

export enum CatsActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATS = 'SET_SUB_CATS',
	SET_ERROR = 'SET_ERROR',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CAT = 'SET_PARENT_CAT'
}

export type CatsPayload = {
	[CatsActionTypes.SET_LOADING]: false;

	[CatsActionTypes.SET_SUB_CATS]: {
		subCats: ICat[];
	};

	[CatsActionTypes.SET_EXPANDED]: {
		id: string;
		expanding: boolean;
	}

	[CatsActionTypes.SET_ERROR]: {
		error: Error;
	};

	[CatsActionTypes.SET_PARENT_CAT]: {
		cat: ICat;
	};

};

export type CatsActions =
	ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];



export type CatActions = ActionMap<CatsPayload>[keyof ActionMap<CatsPayload>];