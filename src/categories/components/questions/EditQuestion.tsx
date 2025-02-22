import React from 'react';
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion } from "categories/types";

const EditQuestion = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();

    const dispatch = useCategoryDispatch();
    const { state, updateQuestion, reloadCategoryNode } = useCategoryContext();
    const category = state.categories.find(c => c.inEditing);
    const question = category!.questions.find(q => q.inEditing)

    const submitForm = async (questionObject: IQuestion) => {
        const object: IQuestion = {
            ...questionObject,
            modified: {
                date: new Date(),
                by: {
                    nickName: globalState.authUser.nickName
                }
            }
        }
        const q = await updateQuestion(object);
        if (question!.parentCategory !== q.parentCategory) {
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentCategory } })
            await reloadCategoryNode(q.parentCategory, q.id);
        }
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
