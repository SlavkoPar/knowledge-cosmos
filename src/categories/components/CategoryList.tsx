import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { ICategoryKey, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import useFetchWithMsal from "hooks/useFetchWithMsal";
import { protectedResources } from "authConfig";

const CategoryList = ({ title, categoryKey, level }: IParentInfo) => {
    const { state, getSubCategories } = useCategoryContext();
    const { categories, loading } = state;
    // { error, }
    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.read,
    });

    useEffect(() => {
        //getSubCategories(execute, categoryKey);
        (async () => {
            console.log('zovem getSubCategories', {categoryKey})
            await getSubCategories(execute, categoryKey);
        })()
    }, [getSubCategories, execute, categoryKey]);

    if (loading) {
        return <div>loading sub categories...</div>
    }
    const mySubCategories = categoryKey.id === 'null'
        ? categories.filter(c => c.parentCategory === null)
        : categories.filter(c => c.parentCategory === categoryKey.id);
    console.log("+++++++>>>>>>> CategoryList mySubCategories", { categoryKey, categories, mySubCategories});

    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    { mySubCategories.map(category =>
                        <CategoryRow category={category} key={category.id} />)
                    }
                </ListGroup>
                {/* {state.error && state.error} */}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default CategoryList;
