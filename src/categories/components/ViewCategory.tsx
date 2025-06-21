import React from 'react';

import { useCategoryContext } from 'categories/CategoryProvider'

import { FormMode } from "categories/types";
import CategoryForm from "categories/components/CategoryForm";

const ViewCategory = ({ inLine }: { inLine: boolean }) => {
    const { state } = useCategoryContext();
    const { categoryInViewingOrEditing, categoryKeyExpanded } = state;
    const { questionId } = categoryKeyExpanded!;
    return (
        <CategoryForm
            inLine={inLine}
            category={{ ...categoryInViewingOrEditing! }}
            questionId={questionId}
            mode={FormMode.Viewing}
            submitForm={() => { }}
        >
            View Category
        </CategoryForm>
    );
}

export default ViewCategory;
