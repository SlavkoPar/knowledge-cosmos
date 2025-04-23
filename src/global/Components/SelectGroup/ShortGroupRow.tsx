import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ShortGroupsActionTypes, ShortGroupsActions } from "global/types";
import { IGroup } from 'groups/types'

import ShortGroupList from "global/Components/SelectGroup/ShortGroupList";

interface IGroupRow {
    group: IGroup;
    dispatch: React.Dispatch<ShortGroupsActions>;
    setParentGroup: (group: IGroup) => void;
}

const ShortGroupRow = ({ group, dispatch, setParentGroup }: IGroupRow) => {
    const { partitionKey, id, title, level, isExpanded } = group;
    const groupKey = { partitionKey, id };

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: ShortGroupsActionTypes.SET_EXPANDED, payload: { id, expanding: !isExpanded } });
    }

    const onSelectGroup = (group: IGroup) => {
        // Load data from server and reinitialize group
        // viewGroup(id);
        setParentGroup(group);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={(e) => {
                    expand(id!);
                    e.stopPropagation();
                }}
                title="Expand"
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none`}
                title={id}
                onClick={() => onSelectGroup(group)}
            >
                {title}
            </Button>
        </div>

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {Row1}
            </ListGroup.Item>

            {isExpanded && // Row2
                <ListGroup.Item
                    className="py-0 px-0"
                    variant={"primary"}
                    as="li"
                >
                    <ShortGroupList
                        level={level + 1}
                        groupKey={groupKey}
                        setParentGroup={setParentGroup}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default ShortGroupRow;
