import React from 'react';
import { useState } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import CategoryForm from "categories/components/CategoryForm";
import InLineCategoryForm from "categories/components/InLineCategoryForm";
import { FormMode, ICategory, ICategoryKey } from "categories/types";

const AddCategory = ({ categoryKey, inLine }: { categoryKey: ICategoryKey, inLine: boolean }) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createCategory, state } = useCategoryContext();

    // do not use categoryKey
    const category: ICategory = state.categories.find(c => c.inAdding)!;
    console.assert(category, 'category.inAdding should have been found')

    const [formValues] = useState(category);

    const submitForm = async (categoryObject: ICategory) => {
        delete categoryObject.inAdding;
        const object: ICategory = {
            ...categoryObject,
            partitionKey: categoryKey.partitionKey,
            id: categoryObject.title.split(' ')[0].toUpperCase(),
            created: {
                time: new Date(),
                nickName: nickName
            },
            modified: undefined
        }
        console.log("**********object", object)
        await createCategory(object);
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
