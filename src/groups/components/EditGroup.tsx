import React from 'react';
import { useGroupContext } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import GroupForm from "groups/components/GroupForm";
import { FormMode, IGroup } from "groups/types";

const EditGroup = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { state, updateGroup } = useGroupContext();
    const group = state.groups.find(c => c.inEditing);

    const submitForm = (groupObject: IGroup) => {
        const object: IGroup = {
            ...groupObject,
            modified: {
                date: new Date(),
                by: {
                    nickName: globalState.authUser.nickName
                }
            }
        }
        updateGroup(object)
    };

    return (
        <GroupForm
            inLine={inLine}
            group={group!}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Group
        </GroupForm>
    );
};

export default EditGroup;
