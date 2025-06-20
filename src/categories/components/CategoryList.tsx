import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { CategoryKey, ICategory, ICategoryRow, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";

const CategoryList = ({ title, categoryRow, level, isExpanded }: IParentInfo) => {

    // 1) TODO zar ne treba uzimati subcategories from categorysubCategories 
    // 2) TODO proveri partitionKey, id from <Categories 
    const { state, getSubCategoryRows } = useCategoryContext();
    const { categoryKeyExpanded } = state;

    const { partitionKey, id, questionId } = categoryKeyExpanded 
                ? categoryKeyExpanded
                : { partitionKey: null, id: null, questionId: null };
    const { subCategories } = categoryRow;
    //console.log('<<<<<<<<<CategoryList', categoryRow.id, subCategories )

    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {subCategories!.map((c: ICategoryRow) =>
                        <CategoryRow
                            //categoryRow={{ ...c, isSelected: c.id === id }}
                            categoryRow={c} // {...c}}
                            questionId={c.partitionKey === partitionKey && c.id === id ? questionId : null}
                            key={c.id}
                        />
                    )}
                </ListGroup>
                {/* {state.error && state.error} */}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default CategoryList;
