import React, { useEffect, useReducer } from "react";
import { ListGroup } from "react-bootstrap";
import CatRow from "groups/components/SelectGroup/CatRow";
import { CatsActionTypes, ICatInfo, IGroup } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import { CatsReducer, initialState } from "./CatsReducer";

const CatList = ({ parentGroup, level, setParentGroup }: ICatInfo) => {
    const [state, dispatch] = useReducer(CatsReducer, initialState);
    const { getSubCats } = useGroupContext();
    useEffect(() => {
        (async () => {
            const subCats = await getSubCats({ parentGroup, level });
            console.log('getSubCats', parentGroup, level, subCats);
            dispatch({ type: CatsActionTypes.SET_SUB_CATS, payload: { subCats } });
        })()
    }, [getSubCats, parentGroup, level]);

    const mySubGroups = state.cats.filter(c => c.parentGroup === parentGroup);

    const setParentCat = (cat: IGroup) => {
        dispatch({ type: CatsActionTypes.SET_PARENT_GROUP, payload: { group: cat } })
        setParentGroup!(cat);
    }

    return (
        <div className={level > 1 ? 'ms-4' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubGroups.map(group =>
                        <CatRow
                            group={group}
                            dispatch={dispatch}
                            setParentGroup={setParentCat}
                            key={group.id}
                        />
                    )
                    }
                </ListGroup>

                {state.error && state.error}
            </>
        </div>
    );
};

export default CatList;
