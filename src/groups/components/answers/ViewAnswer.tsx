import React from 'react';
import { useGroupContext } from 'groups/GroupProvider'
import { FormMode } from "groups/types";
import AnswerForm from "groups/components/answers/AnswerForm";

const ViewAnswer = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const { answerLoading } = state;
    const group = state.groups.find(c => c.inViewing);
    const answer = group!.answers.find(q => q.inViewing)
    if (answerLoading)
        return <div>Loading answer...</div>
    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            source={0}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Answer
        </AnswerForm>
    );
}

export default ViewAnswer;
