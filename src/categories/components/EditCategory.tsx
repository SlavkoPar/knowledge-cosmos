import React from 'react';
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import CategoryForm from "categories/components/CategoryForm";
import { FormMode, ICategory } from "categories/types";
import useFetchWithMsal from 'hooks/useFetchWithMsal';
import { protectedResources } from 'authConfig';

const EditCategory = ({ inLine }: { inLine: boolean }) => {
    const globalState = useGlobalState();
    const { state, updateCategory } = useCategoryContext();
    const category = state.categories.find(c => c.inEditing);

    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.write
    });

    const submitForm = async (categoryObject: ICategory) => {
        const object: ICategory = {
            ...categoryObject,
            modified: {
                date: new Date(),
                nickName: globalState.authUser.nickName
            }
        }
        await updateCategory(execute, object, true /* closeForm */)
    };

    return (
        <CategoryForm
            inLine={inLine}
            category={category!}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Category
        </CategoryForm>
    );
};

export default EditCategory;
