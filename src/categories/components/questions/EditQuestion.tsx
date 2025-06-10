import React, { useEffect, useState } from 'react';
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion, IQuestionKey } from "categories/types";

const EditQuestion = ({ questionKey, inLine }: { questionKey: IQuestionKey, inLine: boolean }) => {
    const { partitionKey, id, parentCategory } = questionKey;
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { loadCats } = useGlobalContext();

    const dispatch = useCategoryDispatch();
    const { state, updateQuestion, reloadCategoryRowNode } = useCategoryContext();
    const { questionLoading, categoryRows: categories, questionInViewingOrEditing } = state;
    //const { partitionKey, id, parentCategory } = questionInViewingOrEditing!;
    //const category = categories.find(c => c.id === parentCategory);
    const [question, setQuestion] = useState<IQuestion | null>(null);
    useEffect(() => {
        //const q = category!.questions.find(q => q.inEditing)
        //if (category) {
        //const q = category!.questions.find(q => q.id === id)
        console.log("#################################### EditQuestion setQuestion ...", { questionInViewingOrEditing })
        //if (q) {
        setQuestion(questionInViewingOrEditing);
        //}
        //}
    }, [questionInViewingOrEditing]) // questionLoading

    // if (questionLoading) {
    //     console.log("#################################### EditQuestion loading ...")
    //     return <div>Loading question..</div>
    // }

    console.log("#################################### EditQuestion inLine:", { inLine }, { question })

    if (!questionInViewingOrEditing) {
        console.log("#################################### EditQuestion loading ...")
        return <div>Loading question..</div>
    }

    const submitForm = async (questionObject: IQuestion) => {
        const object: IQuestion = {
            ...questionObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: nickName
            }
        }
        const categoryChanged = question!.parentCategory !== object.parentCategory;
        const q = await updateQuestion(object, categoryChanged);
        if (question!.parentCategory !== q.parentCategory) {
            await loadCats(); // reload, group could have been changed
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { id: q.parentCategory } })
            await reloadCategoryRowNode({ partitionKey: '', id: q.parentCategory, questionId: q.id });
        }
        if (categoryChanged) {
            setTimeout(() => dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM, payload: { question: q } }), 1000);
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
