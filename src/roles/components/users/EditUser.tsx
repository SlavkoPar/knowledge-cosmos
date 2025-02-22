import React from 'react';
import { useRoleContext, useRoleDispatch } from 'roles/RoleProvider'
import { useGlobalState } from 'global/GlobalProvider'

import UserForm from "roles/components/users/UserForm";
import { ActionTypes, FormMode, IUser } from "roles/types";

const EditUser = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();

    const dispatch = useRoleDispatch();
    const { state, updateUser, reloadRoleNode } = useRoleContext();
    const role = state.roles.find(c => c.inEditing);
    const user = role!.users.find(q => q.inEditing)

    const submitForm = async (userObject: IUser) => {
        const object: IUser = {
            ...userObject,
            modified: {
                date: new Date(),
                by: {
                    nickName: globalState.authUser.nickName
                }
            }
        }
        const q = await updateUser(object);
        if (user!.parentRole !== q.parentRole) {
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentRole } })
            await reloadRoleNode(q.parentRole, q.id);
        }
    };

    if (!user)
        return null;

    return (
        <UserForm
            user={user!}
            showCloseButton={true}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update User
        </UserForm>
    );
};

export default EditUser;
