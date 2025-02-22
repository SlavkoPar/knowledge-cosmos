import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faThumbsUp, faPlus, faReply, faUser } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IRoleInfo, Mode } from "roles/types";
import { useRoleContext, useRoleDispatch } from 'roles/RoleProvider'
import { useHover } from 'common/components/useHover';
import { IUser } from 'roles/types'

import AddUser from "roles/components/users/AddUser";
import EditUser from "roles/components/users/EditUser";
import ViewUser from "roles/components/users/ViewUser";
// import { IntersectionObserverHookRefCallback } from 'react-intersection-observer-hook';


//const UserRow = ({ user, roleInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, user: IUser, roleInAdding: boolean | undefined }) => {
const UserRow = ({ user, roleInAdding }: { user: IUser, roleInAdding: boolean | undefined }) => {
    const { nickName: id, parentRole, level, name, inViewing, inEditing, inAdding } = user;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewUser, editUser, deleteUser } = useRoleContext();
    const dispatch = useRoleDispatch();

    const alreadyAdding = state.mode === Mode.AddingUser;

    const del = () => {
        deleteUser(id!, parentRole);
    };

    const edit = (nickName: string) => {
        // Load data from server and reinitialize user
        editUser(id);
    }

    const onSelectUser = (nickName: string) => {
        // Load data from server and reinitialize user
        if (canEdit)
            editUser(nickName);
        else
            viewUser(nickName);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-secondary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1 text-secondary"
            >
                <FontAwesomeIcon
                    icon={faUser}
                    size='sm'
                />
            </Button>

            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none text-secondary ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={id!.toString()}
                onClick={() => onSelectUser(id!)}
                disabled={alreadyAdding}
            >
                {name}
            </Button>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, user }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1 text-secondary"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button
                    variant='link'
                    size="sm"
                    className="ms-2 py-0 mx-1 text-secondary"
                    title="Add User"
                    onClick={() => {
                        console.log('click q')
                        const roleInfo: IRoleInfo = { title: parentRole, level }
                        dispatch({ type: ActionTypes.ADD_USER, payload: { roleInfo } })
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} size='lg' />
                    <FontAwesomeIcon icon={faUser} size='lg' style={{ marginLeft: '-5px' }} />
                </Button>
            }
        </div>

    return (
        // <ListGroup.Item
        //     variant={"secondary"}
        //     className="py-0 px-1 w-100"
        //     as="li"
        // >
        <div className="py-0 px-1 w-100 list-role-item">
            {inAdding && roleInAdding && state.mode === Mode.AddingUser ? (
                <AddUser user={user} inLine={true} showCloseButton={true} />
            )
                : ((inEditing && state.mode === Mode.EditingUser) ||
                    (inViewing && state.mode === Mode.ViewingUser)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-user' className="ms-0 d-md-none w-100">
                            {inEditing && <EditUser inLine={true} />}
                            {inViewing && <ViewUser inLine={true} />}
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                )
                    : (
                        Row1
                    )
            }
        </div>
        // </ListGroup.Item>
    );
};

export default UserRow;
