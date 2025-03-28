import React, { useState } from "react";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion } from "categories/types";
import useFetchWithMsal from "hooks/useFetchWithMsal";
import { protectedResources } from "authConfig";

interface IProps {
    question: IQuestion;
    closeModal?: () => void;
    inLine: boolean;
    showCloseButton: boolean;
    source: number;
    setError?: (msg: string) => void;
}

const AddQuestion = ({ question, inLine, closeModal, showCloseButton, source, setError }: IProps) => {
    const globalState = useGlobalState();
    const { authUser } = globalState;
    const { nickName } = authUser;

    // { error, execute }
    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.write,
    });

    const dispatch = useCategoryDispatch();
    const { state, createQuestion, reloadCategoryNode } = useCategoryContext();
    if (!closeModal) {
        const cat = state.categories.find(c => c.id === question.parentCategory)
        question.categoryTitle = cat ? cat.title : '';
    }
    const [formValues] = useState(question)

    const submitForm = async (questionObject: IQuestion) => {
        const obj: any = { ...questionObject }
        delete obj.inAdding;
        delete obj.id;
        const object: IQuestion = {
            ...obj,
            //id: undefined,
            created: {
                date: new Date(),
                by: {
                    nickName
                }
            }
        }
        const question = await createQuestion(object, closeModal !== undefined);
        if (question) {
            if (question.message) {
                setError!(question.message)
            }
            else if (closeModal) {
                closeModal();
                dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: question.parentCategory } })
                await reloadCategoryNode(execute, { partitionKey: '', id: question.parentCategory }, question.id);
            }
        }
    }

    return (
        <QuestionForm
            question={formValues}
            showCloseButton={showCloseButton}
            source={source}
            closeModal={closeModal}
            mode={FormMode.adding}
            submitForm={submitForm}
        >
            Create Question
        </QuestionForm >
    )
}

export default AddQuestion

