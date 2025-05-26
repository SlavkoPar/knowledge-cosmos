import React, { useEffect, useState } from 'react';
import { useCategoryContext } from 'categories/CategoryProvider'
import { FormMode, IQuestion } from "categories/types";
import QuestionForm from "categories/components/questions/QuestionForm";

const ViewQuestion = ({ inLine }: { inLine: boolean }) => {
    const { state } = useCategoryContext();
    const { questionLoading, categories, questionInViewingOrEditing } = state;
    const { partitionKey, id, parentCategory } = questionInViewingOrEditing!;

    const category = categories.find(c => c.id === parentCategory);
    const [question, setQuestion] = useState<IQuestion | undefined>(undefined);

    useEffect(() => {
            if (category) {
                const q = category!.questions.find(q => q.id === id)
                console.log("#################################### ViewQuestion setQuestion ...", { q })
                if (q) {
                    setQuestion(q);
                }
            }
        }, [questionInViewingOrEditing]) 

    // if (questionLoading)
    //     return <div>Loading question...</div>
    return (
        <QuestionForm
            question={question!}
            showCloseButton={true}
            source={0}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Question
        </QuestionForm>
    );
}

export default ViewQuestion;
