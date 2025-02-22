import React from 'react';
import { useState } from "react";
import { useGroupContext } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import GroupForm from "groups/components/GroupForm";
import InLineGroupForm from "groups/components/InLineGroupForm";
import { FormMode, IGroup } from "groups/types";

const AddGroup = ({ group, inLine } : { group: IGroup, inLine: boolean}) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createGroup } = useGroupContext();
    const [formValues] = useState(group)

    const submitForm = (groupObject: IGroup) => {
        delete groupObject.inAdding;
        const object: IGroup = {
            ...groupObject,
            id: groupObject.title.split(' ')[0].toUpperCase(),
            created: {
                date: new Date(),
                by: {
                    nickName
                }
            }
        }
        createGroup(object);
    }

    return (
        <>
            {inLine ?
                <InLineGroupForm
                    inLine={true}
                    group={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineGroupForm>
                :
                <GroupForm
                    inLine={false}
                    group={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create Group
                </GroupForm >
            }
        </>
    )
}

export default AddGroup
