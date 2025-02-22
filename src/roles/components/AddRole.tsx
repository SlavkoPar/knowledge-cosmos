import React from 'react';
import { useState } from "react";
import { useRoleContext } from 'roles/RoleProvider'
import { useGlobalState } from 'global/GlobalProvider'

import RoleForm from "roles/components/RoleForm";
import InLineRoleForm from "roles/components/InLineRoleForm";
import { FormMode, IRole } from "roles/types";

const AddRole = ({ role, inLine } : { role: IRole, inLine: boolean}) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createRole } = useRoleContext();
    const [formValues] = useState(role)

    const submitForm = (roleObject: IRole) => {
        delete roleObject.inAdding;
        const object: IRole = {
            ...roleObject,
            title: roleObject.title.split(' ')[0].toUpperCase(),
            created: {
                date: new Date(),
                by: {
                   nickName
                }
            }
        }
        createRole(object);
    }

    return (
        <>
            {inLine ?
                <InLineRoleForm
                    inLine={true}
                    role={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineRoleForm>
                :
                <RoleForm
                    inLine={false}
                    role={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create Role
                </RoleForm >
            }
        </>
    )
}

export default AddRole
