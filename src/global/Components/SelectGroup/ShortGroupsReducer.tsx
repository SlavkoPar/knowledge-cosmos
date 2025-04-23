import { Reducer } from 'react'
import { IGroup } from "groups/types";
import { ShortGroupsActionTypes, ShortGroupsActions, IShortGroupsState } from "global/types";

export const initialState: IShortGroupsState = {
  loading: false,
  parentGroup: null,
  title: '',
  shortGroups: []
}

export const ShortGroupsReducer: Reducer<IShortGroupsState, ShortGroupsActions> = (state, action) => {

  switch (action.type) {
    case ShortGroupsActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ShortGroupsActionTypes.SET_SUB_SHORTGROUPS: {
      const { groups } = action.payload;
      return {
        ...state,
        shortGroups: state.shortGroups.concat(groups),
        loading: false
      }
    }

    case ShortGroupsActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case ShortGroupsActionTypes.SET_EXPANDED: {
      const { id, expanding } = action.payload;
      let { shortGroups } = state;
      if (!expanding) {
        const arr = markForClean(shortGroups, id!)
        console.log('clean:', arr)
        const ids = arr.map(c => c.id)
        if (ids.length > 0) {
          shortGroups = shortGroups.filter(c => !ids.includes(c.id))
        }
      }
      return {
        ...state,
        shortGroups: state.shortGroups.map(c => c.id === id
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case ShortGroupsActionTypes.SET_PARENT_SHORTGROUP: {
      const { group } = action.payload;
      const { partitionKey, id,  title } = group;
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

function markForClean(groups: IGroup[], parentGroup: string) {
  let deca = groups
    .filter(c => c.parentGroup === parentGroup)
    .map(c => ({ id: c.id, parentGroup: c.parentGroup }))

  deca.forEach(c => {
    deca = deca.concat(markForClean(groups, c.id!))
  })
  return deca
}
