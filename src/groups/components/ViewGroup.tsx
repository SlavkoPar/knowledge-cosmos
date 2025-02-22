import React from 'react';

import { useGroupContext } from 'groups/GroupProvider'

import { FormMode } from "groups/types";
import GroupForm from "groups/components/GroupForm";

const ViewGroup = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const group = state.groups.find(c => c.inViewing);
    
    return (
        <GroupForm
            inLine={inLine}
            group={group!}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Group
        </GroupForm>
    );
}

export default ViewGroup;
