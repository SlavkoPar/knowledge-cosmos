import React from 'react';
import { useGroupContext } from 'groups/GroupProvider'
import { FormMode } from "groups/types";
import AnswerForm from "groups/components/answers/AnswerForm";

const ViewAnswer = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const group = state.groups.find(c => c.inViewing);
    const answer = group!.answers.find(q => q.inViewing)

    return (
        <AnswerForm
            answer={answer!}
            showCloseButton={true}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Answer
        </AnswerForm>
    );
}

export default ViewAnswer;
