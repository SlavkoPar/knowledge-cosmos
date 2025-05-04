import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";


const CategoryList = ({ title, categoryKey, level }: IParentInfo) => {
    const { state, getSubCategories } = useCategoryContext();
    const { categories } = state;
    // { error, }


    useEffect(() => {
        //getSubCategories(execute, categoryKey);
        (async () => {
            console.log('zovem getSubCategories', {categoryKey})
            await getSubCategories(categoryKey)
                .then((response: boolean)=> {
                });
        })()
    }, [getSubCategories, categoryKey]);

   
    const mySubCategories = categoryKey.id === 'root'
        ? categories.filter(c => c.parentCategory === null)
        : categories.filter(c => c.parentCategory === categoryKey.id);

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
