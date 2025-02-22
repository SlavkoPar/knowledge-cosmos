import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";

const CategoryList = ({ title, parentCategory, level }: IParentInfo) => {
    const { state, getSubCategories } = useCategoryContext();
    useEffect(() => {
        console.log('getSubCategories', title, level)
        getSubCategories({ parentCategory, level });
    }, [getSubCategories, title, parentCategory, level]);

    const mySubCategories = state.categories.filter(c => c.parentCategory === parentCategory);
    return (
        <div className={level>1?'ms-2':''}>
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
