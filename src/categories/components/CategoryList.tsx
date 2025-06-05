import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { CategoryKey, ICategory, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";


const CategoryList = ({ title, categoryKey, level, isExpanded }: IParentInfo) => {
    const { state, getSubCategories } = useCategoryContext();
    const { categoryKeyExpanded } = state;
    const { partitionKey, id, questionId } = categoryKeyExpanded!;

    const [subCategories, setSubCategories] = useState<ICategory[]>([]);

    useEffect(() => {
        (async () => {
            //if (isExpanded) {
                await getSubCategories(categoryKey)
                    .then((list: ICategory[]) => {
                        console.log("+++++++>>>>>>> CategoryList ", { categoryKey, list });
                        setSubCategories(list)
                    });
            //}
        })()
    }, [getSubCategories, categoryKey, isExpanded]);

    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {subCategories.map((c: ICategory) =>
                        <CategoryRow
                            category={{ ...c, isSelected: c.id === id }}
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
