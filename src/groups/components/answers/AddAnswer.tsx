import React, { useState } from "react";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useGlobalState } from 'global/GlobalProvider'

import AnswerForm from "groups/components/answers/AnswerForm";
import { ActionTypes, FormMode, IAnswer } from "groups/types";

interface IProps {
    answer: IAnswer,
    closeModal?: () => void,
    inLine: boolean,
    showCloseButton: boolean,
    setError?: (msg: string) => void
}

const AddAnswer = ({ answer, inLine, closeModal, showCloseButton, setError }: IProps) => {
    const globalState = useGlobalState();
    const { authUser } = globalState;
    const { nickName } = authUser;
   
    const dispatch = useGroupDispatch();
    const { state, createAnswer, reloadGroupNode } = useGroupContext();
    if (!closeModal) {
        const cat = state.groups.find(c => c.id === answer.parentGroup)
        answer.groupTitle = cat? cat.title: '';
    }
    const [formValues] = useState(answer)

    const submitForm = async (answerObject: IAnswer) => {
        const obj: any = {...answerObject}
        delete obj.inAdding;
        delete obj.id;
        const object: IAnswer = {
            ...obj,
            //id: undefined,
            created: {
                date: new Date(),
                by: {
                    nickName
                }
            }
        }
        const answer = await createAnswer(object, closeModal !== undefined);
        if (answer) {
            if (answer.message) {
                setError!(answer.message)
            }
            else if (closeModal) {
                closeModal();
                dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: answer.parentGroup } })
                await reloadGroupNode(answer.parentGroup, answer.id);
            }
        }
    }

    return (
        <>
         {/* <AnswerForm
            initialValues={formValues}
            mode={FormMode.adding}
            submitAnswer={submitAnswer}
            closeModal={closeModal}
        >
            Create Answer
        </AnswerForm > */}
        
            <AnswerForm
                answer={formValues}
                showCloseButton={showCloseButton}
                closeModal={closeModal}
                mode={FormMode.adding}
                submitForm={submitForm}
            >
                Create Answer
            </AnswerForm >
        </>
    )
}

export default AddAnswer

