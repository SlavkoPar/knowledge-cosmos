import React from 'react';
import { useState } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import CategoryForm from "categories/components/CategoryForm";
import InLineCategoryForm from "categories/components/InLineCategoryForm";
import { FormMode, ICategory, ICategoryKey } from "categories/types";
import useFetchWithMsal from 'hooks/useFetchWithMsal';
import { protectedResources } from 'authConfig';

const AddCategory = ({ categoryKey, inLine } : { categoryKey: ICategoryKey, inLine: boolean}) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createCategory, state } = useCategoryContext();

    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.write
    });

    // do not use categoryKey
    const category: ICategory = state.categories.find(c => c.inAdding)!;
    console.assert(category, 'category.inAdding should have been found')
    
    const [formValues] = useState(category);

    const submitForm = async (categoryObject: ICategory) => {
        delete categoryObject.inAdding;
        const object: ICategory = {
            ...categoryObject,
            partitionKey: category.partitionKey,
            id: categoryObject.title.split(' ')[0].toUpperCase(),
            created: {
                date: new Date(),
                nickName
            }
        }
        await createCategory(execute, object);
    }

    return (
        <>
            {inLine ?
                <InLineCategoryForm
                    inLine={true}
                    category={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineCategoryForm>
                :
                <CategoryForm
                    inLine={false}
                    category={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create Category
                </CategoryForm >
            }
        </>
    )
}

export default AddCategory
