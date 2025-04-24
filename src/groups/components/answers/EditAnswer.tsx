import React from 'react';
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer } from "groups/types";

const EditAnswer = ({ inLine }: { inLine: boolean }) => {

    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { loadShortGroups } = useGlobalContext();

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
        console.log('\\\\\\\\\\\\\\\\ 1')
        const a = await updateAnswer(object);
        console.log('\\\\\\\\\\\\\\\\ 2 a', a)
        console.log('\\\\\\\\\\\\\\\\ 2 answer', answer)
        if (answer!.parentGroup !== a.parentGroup) {
            await loadShortGroups(); // reload, group could have been changed
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: a.parentGroup } })
            await reloadGroupNode({ partitionKey: '', id: a.parentGroup }, a.id);
        }
        setTimeout(() => dispatch({ type: ActionTypes.CLOSE_ANSWER_FORM, payload: { answer: a } }), 1000);
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
