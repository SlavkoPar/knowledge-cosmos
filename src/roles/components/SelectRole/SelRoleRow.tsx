import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { RoleShortActionTypes, CatsActions } from "roles/types";
import { IRole } from 'roles/types'

import SelRoleList from "roles/components/SelectRole/SelRoleList";

interface ICatRow {
    role: IRole;
    dispatch: React.Dispatch<CatsActions>;
    setParentRole: (role: IRole) => void;
}

const SelRoleRow = ({ role, dispatch, setParentRole }: ICatRow) => {
    const { title, level, isExpanded } = role;

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: RoleShortActionTypes.SET_EXPANDED, payload: { title, expanding: !isExpanded } });
    }

    const onSelectRole = (role: IRole) => {
        // Load data from server and reinitialize role
        // viewRole(id);
        setParentRole(role);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={(e) => {
                    expand(title!);
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
                title={title}
                onClick={() => onSelectRole(role)}
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
                    <SelRoleList
                        level={level + 1}
                        parentRole={title}
                        setParentRole={setParentRole}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default SelRoleRow;
