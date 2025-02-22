import React, { useEffect, useReducer } from "react";
import { ListGroup } from "react-bootstrap";
import SelRoleRow from "roles/components/SelectRole/SelRoleRow";
import { RoleShortActionTypes, ICatInfo, IRole } from "roles/types";
import { useRoleContext } from "roles/RoleProvider";
import { SelRoleReducer, initialState } from "./SelRoleReducer";

const SelRoleList = ({ parentRole, level, setParentRole }: ICatInfo) => {
    const [state, dispatch] = useReducer(SelRoleReducer, initialState);
    const { getSubCats } = useRoleContext();
    useEffect(() => {
        (async () => {
            const subCats = await getSubCats({ parentRole, level });
            console.log('getSubCats', parentRole, level, subCats);
            dispatch({ type: RoleShortActionTypes.SET_SUB_CATS, payload: { subCats } });
        })()
    }, [getSubCats, parentRole, level]);

    const mySubRoles = state.cats.filter(c => c.parentRole === parentRole);

    const setParentCat = (cat: IRole) => {
        dispatch({ type: RoleShortActionTypes.SET_PARENT_ROLE, payload: { role: cat } })
        setParentRole!(cat);
    }

    return (
        <div className={level > 1 ? 'ms-4' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubRoles.map(role =>
                        <SelRoleRow
                            role={role}
                            dispatch={dispatch}
                            setParentRole={setParentCat}
                            key={role.title}
                        />
                    )
                    }
                </ListGroup>

                {state.error && state.error}
            </>
        </div>
    );
};

export default SelRoleList;
