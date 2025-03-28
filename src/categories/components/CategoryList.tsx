import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import useFetchWithMsal from "hooks/useFetchWithMsal";
import { protectedResources } from "authConfig";

const CategoryList = ({ title, partitionKey, parentCategory, level }: IParentInfo) => {
    const { state, getSubCategories } = useCategoryContext();

    const { error, execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.read,
    });

    if (error)
        console.error(error)

    useEffect(() => {
        // if (!called) {
            getSubCategories(execute, {
                partitionKey: partitionKey ?? 'null',
                id: parentCategory!
            });
            // setCalled(true);
        // }
    }, [getSubCategories, partitionKey, parentCategory]);

    const mySubCategories = state.categories.filter(c => c.parentCategory === parentCategory);
    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubCategories.map(category =>
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
