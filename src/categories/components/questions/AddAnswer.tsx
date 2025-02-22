import React, { useState } from "react";
import { useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { FormMode, IAnswer } from "groups/types";
import { useCategoryContext } from "categories/CategoryProvider";

interface IProps {
    answer: IAnswer,
    inLine: boolean,
    closeModal: () => void,
    onAnswerCreated: (answer: IAnswer) => void
}

// const Add = ({ kind, answer, inLine } : { kind: IKind, answer: IAnswer, inLine: boolean}) => {
const AddAnswer = ({ answer, closeModal, onAnswerCreated }: IProps) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;

    const { createAnswer } = useCategoryContext();
    const [formValues] = useState(answer)

    const submitAnswer = async (answerObject: IAnswer) => {
        delete answerObject.id;
        const object: IAnswer = {
            ...answerObject,
            //_id: undefined,
            created: {
                date: new Date(),
                by: {
                    nickName
                }
            }
        }
        const answer = await createAnswer(object);
        onAnswerCreated(answer)
    }

    return (
        // <AnswerForm
        //     initialValues={formValues}
        //     mode={FormMode.adding}
        //     submitAnswer={submitAnswer}
        //     closeModal={closeModal}
        // >
        //     Create Answer
        // </AnswerForm >
        <AnswerForm
            answer={formValues}
            mode={FormMode.adding}
            submitForm={submitAnswer}
            closeModal={closeModal}
            showCloseButton={true}
        >
            Create Answer
        </AnswerForm >
    )
}

export default AddAnswer
