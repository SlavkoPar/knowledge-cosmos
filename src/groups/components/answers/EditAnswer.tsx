import React from 'react';
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer } from "groups/types";
import useFetchWithMsal from 'hooks/useFetchWithMsal';
import { protectedResources } from 'authConfig';

const EditAnswer = ({ inLine }: { inLine: boolean }) => {

    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.write,
    });

    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;

    const dispatch = useGroupDispatch();
    const { state, updateAnswer, reloadGroupNode } = useGroupContext();
    const { answerLoading, groups } = state;

    if (answerLoading)
        return <div>Loading answer..</div>

    const group = groups.find(c => c.inEditing);
    const answer = group!.answers.find(q => q.inEditing)

    const submitForm = async (answerObject: IAnswer) => {
        const object: IAnswer = {
            ...answerObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        const q = await updateAnswer(object);
        if (answer!.parentGroup !== q.parentGroup) {
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentGroup } })
            await reloadGroupNode({ partitionKey: '', id: q.parentGroup }, q.id);
        }
    };

    if (!answer)
        return null;

    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            source={0}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Answer
        </AnswerForm>
    );
};

export default EditAnswer;
