import React from 'react';
import { useState } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import CategoryForm from "categories/components/CategoryForm";
import InLineCategoryForm from "categories/components/InLineCategoryForm";
import { FormMode, ICategory } from "categories/types";

const AddCategory = ({ category, inLine } : { category: ICategory, inLine: boolean}) => {
    const globalState = useGlobalState();
    const { nickName } = globalState.authUser;
    const { createCategory } = useCategoryContext();
    const [formValues] = useState(category)

    const submitForm = (categoryObject: ICategory) => {
        delete categoryObject.inAdding;
        const object: ICategory = {
            ...categoryObject,
            id: categoryObject.title.split(' ')[0].toUpperCase(),
            created: {
                date: new Date(),
                by: {
                    nickName
                }
            }
        }
        createCategory(object);
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
