import React, { useState } from "react";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion, IQuestionRow } from "categories/types";
import { initialQuestion } from "categories/CategoriesReducer";

interface IProps {
    questionRow: IQuestionRow;
    closeModal?: () => void;
    inLine: boolean;
    showCloseButton: boolean;
    source: number;
    setError?: (msg: string) => void;
}

const AddQuestion = ({ questionRow, inLine, closeModal, showCloseButton, source, setError }: IProps) => {
    const globalState = useGlobalState();
    const { authUser } = globalState;
    const { nickName } = authUser;

    const question = { ...initialQuestion, ...questionRow };

    // { error, execute }

    const dispatch = useCategoryDispatch();
    const { state, createQuestion, reloadCategoryNode } = useCategoryContext();
    if (!closeModal) {
        const cat = state.categories.find(c => c.id === questionRow.parentCategory)
        questionRow.categoryTitle = cat ? cat.title : '';
    }
    // const question: IQuestion = {
    //     ...questionRow, 
    //     assignedAnswers: [], 
    //     numOfAssignedAnswers: 0,
    //     relatedFilters: [],
    //     numOfRelatedFilters: 0,
    //     source: 0,
    //     status: 0
    // };
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
                await reloadCategoryNode({ partitionKey: '', id: q.parentCategory, questionId: q.id });
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

