import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { CategoryKey, ICategory, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";


const CategoryList = ({ title, categoryKey, level }: IParentInfo) => {
    const { state, getSubCategories } = useCategoryContext();
    const { categories, categoryKeyExpanded } = state;
    // { error, }
    const { partitionKey, id: categoryId } = categoryKey;
    const { questionId } = categoryKeyExpanded!;

    useEffect(() => {
        (async () => {
            await getSubCategories(categoryKey)
                .then((response: boolean) => {
                });
        })()
    }, [getSubCategories, categoryKey]);

    const mySubCategories = categoryKey.id === 'null'
        ? categories.filter(c => c.parentCategory === null)
        : categories.filter(c => c.parentCategory === categoryId);
    // console.log("+++++++>>>>>>> CategoryList ", { categoryKey, mySubCategories });

    return (
        <div className={level! > 1 ? 'ms-2' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubCategories.map((c: ICategory) =>
                        <CategoryRow
                            category={{ ...c, isSelected: c.id === categoryId }}
                            questionId={questionId}
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
