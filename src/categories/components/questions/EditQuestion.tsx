import React from 'react';
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion } from "categories/types";

const EditQuestion = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { loadCats } = useGlobalContext();

    const dispatch = useCategoryDispatch();
    const { state, updateQuestion, reloadCategoryNode } = useCategoryContext();
    const { questionLoading, categories } = state;

    if (questionLoading)
        return <div>Loading question..</div>

    const category = categories.find(c => c.inEditing);
    const question = category!.questions.find(q => q.inEditing)

    const submitForm = async (questionObject: IQuestion) => {
        const object: IQuestion = {
            ...questionObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        const q = await updateQuestion(object);
        if (question!.parentCategory !== q.parentCategory) {
            await loadCats(); // reload, group could have been changed
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentCategory } })
            await reloadCategoryNode({ partitionKey: '', id: q.parentCategory }, q.id);
        }
        setTimeout(() => dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM, payload: { question: q } }), 1000);
    };

    if (!question)
        return null;

    return (
        <QuestionForm
            question={question!}
            showCloseButton={true}
            source={0}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Question
        </QuestionForm>
    );
};

export default EditQuestion;
