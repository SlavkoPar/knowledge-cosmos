import React, { useEffect, useState } from 'react';
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
    const { questionLoading, categories, questionKeyInViewingOrEditing: questionInViewingOrEditing } = state;
    const { partitionKey, id, parentCategory } = questionInViewingOrEditing!;
    const category = categories.find(c => c.id === parentCategory);
    const [question, setQuestion] = useState<IQuestion | undefined>(undefined);
    useEffect(() => {
        //const q = category!.questions.find(q => q.inEditing)
        if (category) {
            const q = category!.questions.find(q => q.id === id)
            console.log("#################################### EditQuestion setQuestion ...", { q })
            if (q) {
                setQuestion(q);
            }
        }
    }, [questionInViewingOrEditing]) // questionLoading

    // if (questionLoading) {
    //     console.log("#################################### EditQuestion loading ...")
    //     return <div>Loading question..</div>
    // }

    console.log("#################################### EditQuestion inLine:", { inLine }, { question })

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
            await reloadCategoryNode({ partitionKey: '', id: q.parentCategory, questionId: q.id });
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
