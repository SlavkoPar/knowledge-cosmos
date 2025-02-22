import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { CatsActionTypes, CatsActions } from "groups/types";
import { IGroup } from 'groups/types'

import CatList from "groups/components/SelectGroup/CatList";

interface ICatRow {
    group: IGroup;
    dispatch: React.Dispatch<CatsActions>;
    setParentGroup: (group: IGroup) => void;
}    

const CatRow = ({ group, dispatch, setParentGroup }: ICatRow) => {
    const { id, title, level, isExpanded } = group;

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: CatsActionTypes.SET_EXPANDED, payload: { id, expanding: !isExpanded } });
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
                    <CatList
                        level={level + 1}
                        parentGroup={id}
                        setParentGroup={setParentGroup}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default CatRow;
