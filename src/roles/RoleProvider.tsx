import { useGlobalState } from 'global/GlobalProvider'
import React, { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';


import { ActionTypes, IRole, IUser, IRolesContext, IParentInfo } from 'roles/types';  //, IFromUserAssignedUser
import { initialRolesState, RolesReducer } from 'roles/RolesReducer';
import { IDateAndBy } from 'global/types';

const RolesContext = createContext<IRolesContext>({} as any);
const RoleDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const RoleProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { dbp } = globalState;

  const [state, dispatch] = useReducer(RolesReducer, initialRolesState);
  const { parentNodes } = state;
  const { parentNodesIds } = parentNodes!;

  const reloadRoleNode = useCallback(async (roleId: string, userId: string | null): Promise<any> => {
    try {
      const ids: { id: string, title: string }[] = [];
      let role = await dbp!.get("Roles", roleId);
      if (role) {
        ids.push({ id: role.id, title: role.title });
      }
      while (role && role.parentRole !== 'null') {
        role = await dbp!.get("Roles", role.parentRole);
        if (role) {
          ids.push({ id: role.id, title: role.title })
        }
      }
      dispatch({
        type: ActionTypes.SET_PARENT_ROLES, payload: {
          parentNodes: {
            roleId,
            nickName: userId,
            parentNodesIds: ids.map(c => c.id)
          }
        }
      })

      // const res = await axios.get(`/api/roles/get-parent-roles/${roleId}`);
      // const { status, data } = res;
      // if (status === 200) {
      //   console.log('!!! get-parent-roles', { cId: roleId.toString(), data })
      //   dispatch({
      //     type: ActionTypes.SET_PARENT_ROLES, payload: {
      //       parentNodes: {
      //         roleId,
      //         userId,
      //         parentNodesIds: data.map((c: { _id: string, title: string }) => c._id)
      //       }
      //     }
      //   })
      // }
    }
    catch (err) {
      console.error(err);
    }
    return false;
  }, [dispatch]);

  const getSubCats = useCallback(async ({ parentRole, level }: IParentInfo): Promise<any> => {
    try {

      try {
        const tx = dbp!.transaction('Roles')
        const index = tx.store.index('parentRole_idx');
        const list: IRole[] = [];
        for await (const cursor of index.iterate(parentRole)) {
          console.log(cursor.value);
          list.push(cursor.value)
        }
        await tx.done;
        const subCats = list.map((c: IRole) => ({
          ...c,
          users: [],
          isExpanded: false
        }))
        return subCats;
      }
      catch (error: any) {
        console.log(error)
        dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      }

      // const url = `/api/roles/${wsId}-${parentRole}`
      // const res = await axios.get(url)
      // const { status, data } = res;
      // if (status === 200) {
      //   const subRoles = data.map((c: IRole) => ({
      //     ...c,
      //     users: [],
      //     isExpanded: false
      //   }))
      //   return subRoles;
      // }
      // else {
      //   console.log('Status is not 200', status)
      //   dispatch({
      //     type: ActionTypes.SET_ERROR,
      //     payload: { error: new Error('Status is not 200 status:' + status) }
      //   });
      // }
    }
    catch (err: any | Error) {
      console.log(err);
    }
  }, []);

  const getSubRoles = useCallback(async ({ parentRole, level }: IParentInfo) => {
    //const url = `/api/roles/${wsId}-${parentRole}`
    try {
      const tx = dbp!.transaction('Roles')
      const index = tx.store.index('parentRole_idx');
      const list: IRole[] = [];
      for await (const cursor of index.iterate(parentRole)) {
        const role: IRole = cursor.value;
        console.log(role);
        // const index = tx.store.index('parentRole_idx');
        // const arr = await index.getAllKeys(role.id);
        // role.hasSubRoles = arr.length > 0;
        list.push(role);
      }
      await tx.done;
      const subRoles = list.map((c: IRole) => ({
        ...c,
        users: [],
        isExpanded: parentNodesIds ? parentNodesIds.includes(c.title) : false
      }))
      dispatch({ type: ActionTypes.SET_SUB_ROLES, payload: { subRoles } });
    }
    catch (error: any) {
      console.log(error)
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    //console.log('FETCHING --->>> getSubRoles', level, parentRole)
    //dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data }) => {
    //     const subRoles = data.map((c: IRole) => ({
    //       ...c,
    //       users: [],
    //       isExpanded: parentNodesIds ? parentNodesIds.includes(c._id!.toString()) : false
    //     }))
    //     dispatch({ type: ActionTypes.SET_SUB_ROLES, payload: { subRoles } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  }, [parentNodesIds]);

  const createRole = useCallback(async (role: IRole) => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    try {
      await dbp!.add('Roles', role);
      console.log('Role successfully created')
      dispatch({ type: ActionTypes.SET_ADDED_ROLE, payload: { role: { ...role, users: [] } } });
      dispatch({ type: ActionTypes.CLOSE_ROLE_FORM })
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);

  const setRole = async (id: string, type: ActionTypes.SET_ROLE) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!dbp) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("db is null") } });
      return;
    }
    const role = await dbp.get("Roles", id);
    dispatch({ type, payload: { role: { ...role } } });
  };

  const getRole = async (id: string, type: ActionTypes.VIEW_ROLE | ActionTypes.EDIT_ROLE) => {
    dispatch({ type: ActionTypes.SET_LOADING });
    if (!dbp) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error: new Error("db is null") } });
      return;
    }
    const role: IRole = await dbp.get("Roles", id);
    //      hasMore: true
    dispatch({
      type, payload: {
        role: {
          ...role
        }
      }
    });
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data: role }) => {
    //     dispatch({ type, payload: { role } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const viewRole = useCallback((id: string) => {
    getRole(id, ActionTypes.VIEW_ROLE)
  }, []);

  const editRole = useCallback((id: string) => {
    getRole(id, ActionTypes.EDIT_ROLE)
  }, []);

  const updateRole = useCallback(async (c: IRole) => {
    const { title } = c;
    dispatch({ type: ActionTypes.SET_ROLE_LOADING, payload: { title, loading: false } });
    try {
      const role = await dbp!.get('Roles', title);
      const obj: IRole = {
        ...role,
        title: c.title,
        modified: c.modified
      }
      await dbp!.put('Roles', obj);
      console.log("Role successfully updated");
      dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { role: obj } });
      dispatch({ type: ActionTypes.SET_ROLE, payload: { role: obj } });
      dispatch({ type: ActionTypes.CLOSE_ROLE_FORM })
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  }, []);

  const deleteRole = async (title: string) => {
    try {
      const role = await dbp!.delete('Roles', title);
      console.log("Role successfully deleted");
      dispatch({ type: ActionTypes.DELETE, payload: { title } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };

  const expandRole = async (role: IRole, expanding: boolean) => {
    const { title, numOfUsers, users } = role;
    try {
      // if (numOfUsers > 0 && users.length === 0) {
      //   await loadRoleUsers({ parentRole: id, startCursor: 0, level: 0 });
      // }
      dispatch({ type: ActionTypes.SET_EXPANDED, payload: { title, expanding } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
  };


  /////////////
  // Users
  //

  const pageSize = 12;
  const loadRoleUsers = useCallback(async ({ parentRole, startCursor, includeUserId }: IParentInfo)
    : Promise<any> => {
    const users: IUser[] = [];
    try {
      dispatch({ type: ActionTypes.SET_ROLE_USERS_LOADING, payload: { userLoading: true } }) // id: parentRole,
      let n = 0;
      let included = false;
      let hasMore = false;
      let advanced = false;
      console.time();
      const tx = dbp!.transaction('Users', 'readonly');
      const index = tx.store.index('parentRole_nickName_idx');
      for await (const cursor of index.iterate(IDBKeyRange.bound([parentRole, ''], [parentRole, 'zzzzz'], true, true))) {
        if (startCursor! > 0 && !advanced) {
          cursor.advance(startCursor!);
          advanced = true;
        }
        else {
          console.log(cursor.value.title);
          users.push({ ...cursor.value, nickName: cursor.primaryKey })
          n++;
          if (includeUserId && cursor.primaryKey === includeUserId)
            included = true;
          if (n >= pageSize && (includeUserId ? included : true)) {
            hasMore = true;
            break;
          }
        }
      }
      await tx.done;
      console.log('>>>loadRoleUsers of:', parentRole, users)
      console.timeEnd();
      dispatch({ type: ActionTypes.LOAD_ROLE_USERS, payload: { parentRole, users, hasMore } });
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      dispatch({ type: ActionTypes.SET_ROLE_USERS_LOADING, payload: { userLoading: false } })
    }
    return true;

  }, []);


  const createUser = useCallback(async (user: IUser, fromModal: boolean): Promise<any> => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    try {
      const tx = dbp!.transaction(['Roles', 'Users'], 'readwrite');
      const id = await tx.objectStore('Users').add(user);
      console.log('User successfully created')
      const role: IRole = await tx.objectStore('Roles').get(user.parentRole);
      role.numOfUsers += 1;
      await tx.objectStore('Roles').put(role);

      // TODO check setting inViewing, inEditing, inAdding to false
      dispatch({ type: ActionTypes.SET_USER, payload: { user } });
      return user;
    }
    catch (error: any) {
      console.log('error', error);
      if (fromModal)
        return { message: 'Something is wrong' };
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
      return {};
    }
  }, []);


  const getUser = async (nickName: string, type: ActionTypes.VIEW_USER | ActionTypes.EDIT_USER) => {
    // const url = `/api/users/get-user/${id}`;
    try {
      const user: IUser = await dbp!.get("Users", nickName);
      const role: IRole = await dbp!.get("Roles", user.parentRole)
      user.nickName = nickName;
      user.roleTitle = role.title;
      dispatch({ type, payload: { user } });
    }
    catch (error: any) {
      console.log(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }

    //console.log(`FETCHING --->>> ${url}`)
    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .get(url)
    //   .then(({ data }) => {
    //     const user: IUser = data;
    //     const { fromUserAssignedUser } = user;
    //     user.userUsers.forEach(userUser => {
    //       const user = fromUserAssignedUser!.find((fromUser: IFromUserAssignedUser) => fromUser._id === userUser.assigned.by.userId);
    //       userUser.user.createdBy = user ? user.createdBy : 'unknown'
    //     })
    //     delete user.fromUserAssignedUser;
    //     dispatch({ type, payload: { user } });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const viewUser = useCallback((nickName: string) => {
    getUser(nickName, ActionTypes.VIEW_USER);
  }, []);

  const editUser = useCallback((nickName: string) => {
    getUser(nickName, ActionTypes.EDIT_USER);
  }, []);

  const updateUser = useCallback(async (q: IUser): Promise<any> => {
    const { nickName: id } = q;
    //dispatch({ type: ActionTypes.SET_ROLE_LOADING, payload: { title, loading: false } });
    try {
      const user = await dbp!.get('Users', id!);
      const obj: IUser = {
        ...user,
        name: q.name,
        modified: q.modified
      }
      await dbp!.put('Users', obj, id);
      console.log("User successfully updated");
      obj.nickName = id;
      dispatch({ type: ActionTypes.SET_USER, payload: { user: obj } });
      return obj;
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }
    // try {
    //   const url = `/api/users/update-user/${user._id}`
    //   const res = await axios.put(url, user)
    //   const { status, data } = res;
    //   if (status === 200) {
    //     // TODO check setting inViewing, inEditing, inAdding to false
    //     console.log("User successfully updated");
    //     dispatch({ type: ActionTypes.SET_USER, payload: { user: data } });
    //     return data;
    //   }
    //   else {
    //     console.log('Status is not 200', status)
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: new Error('Status is not 200 status:' + status)
    //       }
    //     })
    //     return {};
    //   }
    // }
    // catch (err: any | Error) {
    //   if (axios.isError(err)) {
    //     dispatch({
    //       type: ActionTypes.SET_ERROR,
    //       payload: {
    //         error: new Error(axios.isError(err) ? err.response?.data : err)
    //       }
    //     })
    //     return {};
    //   }
    //   else {
    //     console.log(err);
    //   }
    //   return {}
    // }
  }, []);


  const deleteUser = async (nickName: string, parentRole: string) => {
    dispatch({ type: ActionTypes.SET_LOADING })
    try {
      const res = await dbp!.delete('Users', nickName);
      console.log("User successfully deleted");
      dispatch({ type: ActionTypes.DELETE_USER, payload: { nickName, parentRole } });
    }
    catch (error: any) {
      console.log('error', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: { error } });
    }

    // dispatch({ type: ActionTypes.SET_LOADING })
    // axios
    //   .delete(`/api/users/delete-user/${_id}`)
    //   .then(res => {
    //     if (res.status === 200) {
    //       console.log("User successfully deleted");
    //       dispatch({ type: ActionTypes.DELETE_USER, payload: { user: res.data.user } });
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    //   });
  };

  const contextValue: IRolesContext = {
    state,
    reloadRoleNode,
    getSubRoles, getSubCats, createRole, viewRole, editRole, updateRole, deleteRole,
    expandRole, loadRoleUsers, createUser, viewUser, editUser, updateUser, deleteUser
  }
  return (
    <RolesContext.Provider value={contextValue}>
      <RoleDispatchContext.Provider value={dispatch}>
        {children}
      </RoleDispatchContext.Provider>
    </RolesContext.Provider>
  );
}

export function useRoleContext() {
  return useContext(RolesContext);
}

export const useRoleDispatch = () => {
  return useContext(RoleDispatchContext)
};

