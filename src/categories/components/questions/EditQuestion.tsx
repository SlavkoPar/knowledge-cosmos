import React, { useEffect, useState } from 'react';
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion, IQuestionKey, QuestionKey } from "categories/types";

const EditQuestion = ({ inLine }: { inLine: boolean }) => {
    // const { partitionKey, id, parentCategory } = questionKey;
    // const globalState = useGlobalState();
    // const { nickName } = globalState.authUser;
    // const { loadAllCategoryRows } = useGlobalContext();

    //const dispatch = useCategoryDispatch();
    const { state, updateQuestion } = useCategoryContext();
    const { questionLoading, questionInViewingOrEditing } = state;
    const { rootId } = questionInViewingOrEditing!;
    //const { partitionKey, id, parentCategory } = questionInViewingOrEditing!;
    //const category = categories.find(c => c.id === parentCategory);
    //const [question, setQuestion] = useState<IQuestion | null>(null);
    /*
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
    */

    // if (questionLoading) {
    //     console.log("#################################### EditQuestion loading ...")
    //     return <div>Loading question..</div>
    // }

    console.log("#################################### EditQuestion inLine:", { inLine }, { questionInViewingOrEditing })

    if (!questionInViewingOrEditing) {
        console.log("#################################### EditQuestion loading ...")
        return <div>Loading question to edit...</div>
    }

    const submitForm = async (questionObject: IQuestion) => {
        const newQuestion: IQuestion = {
            ...questionObject,
            created: undefined,
            modified: {
                time: new Date(),
                nickName: ''
            }
        }

        const { parentCategory} = questionInViewingOrEditing;
        const categoryChanged = parentCategory !== newQuestion.parentCategory;
        //const questionKey = new QuestionKey(questionInViewingOrEditing).questionKey;
        const question = await updateQuestion(rootId!, parentCategory!, newQuestion, categoryChanged);
        if (questionInViewingOrEditing.parentCategory !== question.parentCategory) {
            /*
             await loadAllCategoryRows(); // reload, group could have been changed
             await openCategoryNode({ partitionKey: '', id: q.parentCategory, questionId: q.id });
            */
        }
        // if (categoryChanged) {
        //     setTimeout(() => dispatch({ type: ActionTypes.CLOSE_QUESTION_FORM, payload: { question: question } }), 1000);
        // }
    };

    // if (!questionInViewingOrEditing)
    //     return null;

    return (
        <QuestionForm
            question={questionInViewingOrEditing!}
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
