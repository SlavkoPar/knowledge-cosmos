import React, { useState } from "react";
import { useRoleContext, useRoleDispatch } from 'roles/RoleProvider'
import { useGlobalState } from 'global/GlobalProvider'

import UserForm from "roles/components/users/UserForm";
import { ActionTypes, FormMode, IUser } from "roles/types";

interface IProps {
    user: IUser,
    closeModal?: () => void,
    inLine: boolean,
    showCloseButton: boolean,
    setError?: (msg: string) => void
}

const AddUser = ({ user, inLine, closeModal, showCloseButton, setError }: IProps) => {
    const globalState = useGlobalState();
    const { authUser } = globalState;
    const { nickName } = authUser;
   
    const dispatch = useRoleDispatch();
    const { state, createUser, reloadRoleNode } = useRoleContext();
    if (!closeModal) {
        const cat = state.roles.find(c => c.title === user.parentRole)
        user.roleTitle = cat? cat.title: '';
    }
    const [formValues] = useState(user)

    const submitForm = async (userObject: IUser) => {
        const obj: any = {...userObject}
        delete obj.inAdding;
        delete obj.id;
        const object: IUser = {
            ...obj,
            //id: undefined,
            created: {
                date: new Date(),
                by: {
                    nickName
                }
            }
        }
        const user = await createUser(object, closeModal !== undefined);
        if (user) {
            if (user.message) {
                setError!(user.message)
            }
            else if (closeModal) {
                closeModal();
                dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: user.parentRole } })
                await reloadRoleNode(user.parentRole, user.id);
            }
        }
    }

    return (
        <>
            <UserForm
                user={formValues}
                showCloseButton={showCloseButton}
                closeModal={closeModal}
                mode={FormMode.adding}
                submitForm={submitForm}
            >
                Create User
            </UserForm >
        </>
    )
}

export default AddUser

