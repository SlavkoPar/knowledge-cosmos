import React, { useEffect, useState } from 'react';
import { useGroupContext } from 'groups/GroupProvider'
import { FormMode, IAnswer } from "groups/types";
import AnswerForm from "groups/components/answers/AnswerForm";

const ViewAnswer = ({ inLine }: { inLine: boolean }) => {
    const { state } = useGroupContext();
    const { answerLoading, groups, answerInViewingOrEditing } = state;
    const { partitionKey, id, parentGroup } = answerInViewingOrEditing!;

    const group = groups.find(g => g.id === parentGroup);
    const [answer, setAnswer] = useState<IAnswer | undefined>(undefined);

    useEffect(() => {
        //const q = category!.questions.find(q => q.inEditing)
        if (group) {
            const q = group!.answers.find(a => a.id === id)
            if (q) {
                setAnswer(q);
            }
        }
    }, [answerInViewingOrEditing]) // questionLoading

    // if (answerLoading)
    //     return <div>Loading answer...</div>
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
