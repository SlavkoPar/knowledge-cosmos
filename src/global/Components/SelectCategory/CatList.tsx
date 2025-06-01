import React, { useEffect, useReducer, useState } from "react";
import { ListGroup } from "react-bootstrap";
import CatRow from "global/Components/SelectCategory/CatRow";
import { CatsReducer, initialState } from "global/Components/SelectCategory/CatsReducer";
import { ICat } from "global/types";
import { useGlobalContext } from "global/GlobalProvider";
import { CatsActionTypes, ICatInfo } from "./types";
import { ICategoryKey } from "categories/types";

const CatList = ({ categoryKey, level, setParentCategory }: ICatInfo) => {
    const [state, dispatch] = useReducer(CatsReducer, initialState);
    const { getSubCats } = useGlobalContext();

    const { id } = categoryKey ?? { id: null };
    const [catKey, setCatKey] = useState<ICategoryKey|null>(categoryKey)

    useEffect(() => {
        (async () => {
            const res = await getSubCats(id);
            const { subCats, parentHeader } = res;
            console.log('getSubCats', categoryKey, subCats);
            dispatch({ type: CatsActionTypes.SET_SUB_CATS, payload: { subCats } });
        })()
    }, [getSubCats, catKey]);

    //const parentCategory = categoryKey.id === 'null' ? null : categoryKey.id;
    //const parentCategory = categoryKey ? categoryKey.id : null;
    const mySubCats = state.cats.filter(c => c.parentCategory === id);
    console.log({ mySubCategories: mySubCats })

    const setParentCat = (cat: ICat) => {
        dispatch({ type: CatsActionTypes.SET_PARENT_CAT, payload: { cat } })
        setParentCategory!(cat);
    }

    return (
        <div className={level > 1 ? 'ms-4 h-25' : 'h-25'} style={{ overflowY: 'auto' }}>
            <ListGroup as="ul" variant='dark' className="mb-0">
                {mySubCats.map(cat =>
                    <CatRow
                        cat={cat}
                        dispatch={dispatch}
                        setParentCat={setParentCat}
                        key={cat.id}
                    />
                )
                }
            </ListGroup>

            {state.error && state.error.message}
        </div>
    );
};

export default CatList;
