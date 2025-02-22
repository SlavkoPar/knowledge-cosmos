import React from 'react';
import { useRoleContext } from 'roles/RoleProvider'
import { FormMode } from "roles/types";
import UserForm from "roles/components/users/UserForm";

const ViewUser = ({ inLine }: { inLine: boolean }) => {
    const { state } = useRoleContext();
    const role = state.roles.find(c => c.inViewing);
    const user = role!.users.find(q => q.inViewing)

    return (
        <UserForm
            user={user!}
            showCloseButton={true}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View User
        </UserForm>
    );
}

export default ViewUser;
