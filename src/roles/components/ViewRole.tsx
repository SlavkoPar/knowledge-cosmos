import React from 'react';

import { useRoleContext } from 'roles/RoleProvider'

import { FormMode } from "roles/types";
import RoleForm from "roles/components/RoleForm";

const ViewRole = ({ inLine }: { inLine: boolean }) => {
    const { state } = useRoleContext();
    const role = state.roles.find(c => c.inViewing);
    
    return (
        <RoleForm
            inLine={inLine}
            role={role!}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Role
        </RoleForm>
    );
}

export default ViewRole;
