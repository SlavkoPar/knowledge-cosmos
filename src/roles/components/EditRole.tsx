import React from 'react';
import { useRoleContext } from 'roles/RoleProvider'
import { useGlobalState } from 'global/GlobalProvider'

import RoleForm from "roles/components/RoleForm";
import { FormMode, IRole } from "roles/types";

const EditRole = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { state, updateRole } = useRoleContext();
    const role = state.roles.find(c => c.inEditing);

    const submitForm = (roleObject: IRole) => {
        const object: IRole = {
            ...roleObject,
            modified: {
                date: new Date(),
                by: {
                    nickName: globalState.authUser.nickName
                }
            }
        }
        updateRole(object)
    };

    return (
        <RoleForm
            inLine={inLine}
            role={role!}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Role
        </RoleForm>
    );
};

export default EditRole;
