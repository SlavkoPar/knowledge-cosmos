import React, { Reducer } from 'react'
import { CatsActionTypes, IGroup, ICatsState, CatsActions } from "groups/types";

export const initialState: ICatsState = {
  loading: false,
  parentGroup: null,
  title: '',
  cats: []
}

export const CatsReducer: Reducer<ICatsState, CatsActions> = (state, action) => {
  
  switch (action.type) {
    case CatsActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case CatsActionTypes.SET_SUB_CATS: {
      const { subCats } = action.payload;
      return {
        ...state,
        cats: state.cats.concat(subCats),
        loading: false
      }
    }

    case CatsActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case CatsActionTypes.SET_EXPANDED: {
      const { id, expanding } = action.payload;
      let { cats } = state;
      if (!expanding) {
        const arr = markForClean(cats, id!)
        console.log('clean:', arr)
        const ids = arr.map(c => c.id)
        if (ids.length > 0) {
          cats = cats.filter(c => !ids.includes(c.id))
        }
      }
      return {
        ...state,
        cats: state.cats.map(c => c.id === id
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case CatsActionTypes.SET_PARENT_GROUP: {
      const { group } = action.payload;
      const { id, title } = group;
      return {
        ...state,
        parentGroup: id!,
        title
      };
    }

    default:
      return state;  // TODO throw error
  }
};

function markForClean(groups: IGroup[], parentGroup: IDBValidKey) {
  let deca = groups
    .filter(c => c.parentGroup === parentGroup)
    .map(c => ({ id: c.id, parentGroup: c.parentGroup }))

  deca.forEach(c => {
    deca = deca.concat(markForClean(groups, c.id!))
  })
  return deca
}
