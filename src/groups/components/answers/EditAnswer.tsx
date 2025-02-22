import React from 'react';
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer } from "groups/types";

const EditAnswer = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();

    const dispatch = useGroupDispatch();
    const { state, updateAnswer, reloadGroupNode } = useGroupContext();
    const group = state.groups.find(c => c.inEditing);
    const answer = group!.answers.find(q => q.inEditing)

    const submitForm = async (answerObject: IAnswer) => {
        const object: IAnswer = {
            ...answerObject,
            modified: {
                date: new Date(),
                by: {
                    nickName: globalState.authUser.nickName
                }
            }
        }
        const q = await updateAnswer(object);
        if (answer!.parentGroup !== q.parentGroup) {
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentGroup } })
            await reloadGroupNode(q.parentGroup, q.id);
        }
    };

    if (!answer)
        return null;

    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Answer
        </AnswerForm>
    );
};

export default EditAnswer;
