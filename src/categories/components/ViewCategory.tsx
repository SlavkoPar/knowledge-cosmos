import React from 'react';

import { useCategoryContext } from 'categories/CategoryProvider'

import { FormMode } from "categories/types";
import CategoryForm from "categories/components/CategoryForm";

const ViewCategory = ({ inLine }: { inLine: boolean }) => {
    const { state } = useCategoryContext();
    const { categoryRows: categories, categoryInViewingOrEditing, categoryKeyExpanded } = state;
    const { id } = categoryInViewingOrEditing!;
    const category = categories.find(c => c.id === id);
    const { questionId } = categoryKeyExpanded!;

    return (
        <CategoryForm
            inLine={inLine}
            category={category!}
            questionId={questionId}
            mode={FormMode.viewing}
            submitForm={() => { }}
        >
            View Category
        </CategoryForm>
    );
}

export default ViewCategory;
