import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Modal } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes } from "./types";

import { useGlobalState } from "global/GlobalProvider";
import { RoleProvider, useRoleContext, useRoleDispatch } from "./RoleProvider";

import RoleList from "roles/components/RoleList";
import ViewRole from "roles/components/ViewRole";
import EditRole from "roles/components/EditRole";
import ViewUser from "roles/components/users/ViewUser";
import EditUser from "roles/components/users/EditUser";
import AddUser from './components/users/AddUser';

import { initialUser } from "roles/RolesReducer";

interface IProps {
    roleId_userId: string | undefined
}

const Providered = ({ roleId_userId }: IProps) => {
    const { state, reloadRoleNode } = useRoleContext();
    const { lastRoleExpanded, roleId_userId_done } = state;

    const { isDarkMode, authUser } = useGlobalState();

    const [showAddUser, setShowAddUser] = useState(false);
    const handleClose = () => setShowAddUser(false);

    const [newUser, setNewUser] = useState({ ...initialUser });
    const [createUserError, setCreateUserError] = useState("");

    const dispatch = useRoleDispatch();

    useEffect(() => {
        (async () => {
            if (roleId_userId) {
                if (roleId_userId === 'add_user') {
                    const sNewUser = localStorage.getItem('New_User');
                    if (sNewUser) {
                        const q = JSON.parse(sNewUser);
                        setNewUser({ ...initialUser, roleTitle: 'Select', ...q })
                        setShowAddUser(true);
                        localStorage.removeItem('New_User')
                    }
                }
                else if (roleId_userId !== roleId_userId_done) {
                    const arr = roleId_userId.split('_');
                    const roleId = arr[0];
                    const userId = arr[1];
                    await reloadRoleNode(roleId, userId);
                }
            }
            else if (lastRoleExpanded) {
                await reloadRoleNode(lastRoleExpanded, null);
            }
        })()
    }, [lastRoleExpanded, reloadRoleNode, roleId_userId, roleId_userId_done])

    if (roleId_userId !== 'add_user') {
        if (lastRoleExpanded || (roleId_userId && roleId_userId !== roleId_userId_done))
            return <div>`loading...${lastRoleExpanded} ${roleId_userId} ${roleId_userId_done}`</div>
    }

    return (
        <Container>
            <Button variant="secondary" size="sm" type="button"
                onClick={() => dispatch({
                    type: ActionTypes.ADD_SUB_ROLE,
                    payload: {
                        parentRole: null,
                        level: 0
                    }
                })
                }
            >
                Add Role
            </Button>
            <Row className="my-1">
                <Col xs={12} md={5}>
                    <div>
                        <RoleList parentRole={'null'} level={1} title="root" />
                    </div>
                </Col>
                <Col xs={0} md={7}>
                    {/* {store.mode === FORM_MODES.ADD && <Add role={role??initialRole} />} */}
                    {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                    <div id='div-details' className="d-none d-md-block">
                        {state.mode === Mode.ViewingRole && <ViewRole inLine={false} />}
                        {state.mode === Mode.EditingRole && <EditRole inLine={false} />}
                        {/* {state.mode === FORM_MODES.ADD_USER && <AddUser role={null} />} */}
                        {state.mode === Mode.ViewingUser && <ViewUser inLine={false} />}
                        {state.mode === Mode.EditingUser && <EditUser inLine={false} />}
                    </div>
                </Col>
            </Row>

            <Modal
                show={showAddUser}
                onHide={handleClose}
                animation={true}
                centered
                size="lg"
                className={`${isDarkMode ? "" : ""}`}
                contentClassName={`${isDarkMode ? "bg-light bg-gradient" : ""}`}
            >
                <Modal.Header closeButton>
                    Put the new User to Database
                </Modal.Header>
                <Modal.Body className="py-0">
                    <AddUser
                        user={newUser}
                        closeModal={() => setShowAddUser(false)}
                        inLine={false}
                        showCloseButton={false}
                        setError={(msg) => setCreateUserError(msg)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    {createUserError}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

type Params = {
    roleId_userId: string | undefined;
};

const Roles = () => {
    let { roleId_userId } = useParams<Params>();

    if (roleId_userId && roleId_userId === 'null')
        roleId_userId = undefined;

    if (roleId_userId) {
        const arr = roleId_userId!.split('_');
        console.assert(arr.length === 2, "expected 'roleId_userId'")
    }
    const globalState = useGlobalState();
    const { isAuthenticated, dbp } = globalState;

    if (!isAuthenticated || !dbp)
        return <div>loading...</div>;

    return (
        <RoleProvider>
            <Providered roleId_userId={roleId_userId} />
        </RoleProvider>
    )
}

export default Roles;