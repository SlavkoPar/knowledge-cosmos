import React, { Reducer } from 'react'
import { RoleShortActionTypes, IRole, ICatsState, CatsActions } from "roles/types";

export const initialState: ICatsState = {
  loading: false,
  parentRole: null,
  title: '',
  cats: []
}

export const SelRoleReducer: Reducer<ICatsState, CatsActions> = (state, action) => {

  switch (action.type) {
    case RoleShortActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case RoleShortActionTypes.SET_SUB_CATS: {
      const { subCats } = action.payload;
      return {
        ...state,
        cats: state.cats.concat(subCats),
        loading: false
      }
    }

    case RoleShortActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case RoleShortActionTypes.SET_EXPANDED: {
      const { title, expanding } = action.payload;
      let { cats } = state;
      if (!expanding) {
        const arr = markForClean(cats, title!)
        console.log('clean:', arr)
        const ids = arr.map(c => c.title)
        if (ids.length > 0) {
          cats = cats.filter(c => !ids.includes(c.title))
        }
      }
      return {
        ...state,
        cats: state.cats.map(c => c.title === title
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case RoleShortActionTypes.SET_PARENT_ROLE: {
      const { role } = action.payload;
      const { title } = role;
      return {
        ...state,
        parentRole: title!
      };
    }

    default:
      return state;  // TODO throw error
  }
};

function markForClean(roles: IRole[], parentRole: IDBValidKey) {
  let deca = roles
    .filter(c => c.parentRole === parentRole)
    .map(c => ({ title: c.title, parentRole: c.parentRole }))

  deca.forEach(c => {
    deca = deca.concat(markForClean(roles, c.title!))
  })
  return deca
}
