import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import useFetchWithMsal from "hooks/useFetchWithMsal";
import { protectedResources } from "authConfig";

const CategoryList = ({ title, categoryKey, level }: IParentInfo) => {
    const { state, getSubCategories } = useCategoryContext();
    const { categories } = state;
    // { error, }
    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.read,
    });

    useEffect(() => {
        //getSubCategories(execute, categoryKey);
        (async () => {
            console.log('zovem getSubCategories', {categoryKey})
            await getSubCategories(execute, categoryKey)
                .then((response:boolean)=> {
                    //setPozvao(true);
                });
        })()
    }, [getSubCategories, execute, categoryKey]);

   
    const mySubCategories = categoryKey.id === 'null'
        ? categories.filter(c => c.parentCategory === null)
        : categories.filter(c => c.parentCategory === categoryKey.id);
    console.log("+++++++>>>>>>> CategoryList ", { categoryKey, categories, mySubCategories});

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
