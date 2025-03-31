import React from 'react';
import { useCategoryContext } from 'categories/CategoryProvider'
import { FormMode } from "categories/types";
import QuestionForm from "categories/components/questions/QuestionForm";

const ViewQuestion = ({ inLine }: { inLine: boolean }) => {
    const { state } = useCategoryContext();
    const { questionLoading } = state;
    const category = state.categories.find(c => c.inViewing);
    const question = category!.questions.find(q => q.inViewing)
    if (questionLoading)
        return <div>Loading question...</div>
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
