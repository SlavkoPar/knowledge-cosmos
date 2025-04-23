import React, { useEffect, useReducer } from "react";
import { ListGroup } from "react-bootstrap";
import ShortGroupRow from "global/Components/SelectGroup/ShortGroupRow";
import { ShortGroupsReducer, initialState } from "global/Components/SelectGroup/ShortGroupsReducer";
import { IGroup } from "groups/types";
import { ShortGroupsActionTypes, IShortGroupInfo } from "global/types";
import { useGlobalContext } from "global/GlobalProvider";

const ShortGroupList = ({ groupKey, level, setParentGroup }: IShortGroupInfo) => {
    const [state, dispatch] = useReducer(ShortGroupsReducer, initialState);
    const { getSubGroups } = useGlobalContext();
    useEffect(() => {
        (async () => {
            const subGroups = await getSubGroups(groupKey);
            console.log('getSubGroups', groupKey, subGroups);
            dispatch({ type: ShortGroupsActionTypes.SET_SUB_SHORTGROUPS, payload: { groups: subGroups } });
        })()
    }, [getSubGroups, groupKey]);

    const parentGroup = groupKey.id === 'null' ? null : groupKey.id;
    const mySubGroups = state.shortGroups.filter(c => c.parentGroup === parentGroup);
    console.log({ mySubGroups })

    const setParentShortGroup = (group: IGroup) => {
        dispatch({ type: ShortGroupsActionTypes.SET_PARENT_SHORTGROUP, payload: { group } })
        setParentGroup!(group);
    }

    return (
        <div className={level > 1 ? 'ms-4' : ''}>
            <ListGroup as="ul" variant='dark' className="mb-0">
                {mySubGroups.map(group =>
                    <ShortGroupRow
                        group={group}
                        dispatch={dispatch}
                        setParentGroup={setParentShortGroup}
                        key={group.id}
                    />
                )
                }
            </ListGroup>

            {state.error && state.error.message}
        </div>
    );
};

export default ShortGroupList;
