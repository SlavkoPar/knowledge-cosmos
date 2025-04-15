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
    const [formValues] = useState(question);

    const submitForm = async (questionObject: IQuestion) => {
        const obj: any = { ...questionObject }
        delete obj.inAdding;
        // delete obj.id;
        const object: IQuestion = {
            ...obj,
            partitionKey: question.partitionKey,
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        const q = await createQuestion(object, closeModal !== undefined);
        if (q) {
            if (q.message) {
                setError!(q.message)
            }
            else if (closeModal) {
                closeModal();
                dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentCategory } })
                await reloadCategoryNode({ partitionKey: '', id: q.parentCategory }, q.id);
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

