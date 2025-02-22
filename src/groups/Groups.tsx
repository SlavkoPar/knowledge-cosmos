import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Modal } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes } from "./types";

import { useGlobalState } from "global/GlobalProvider";
import { GroupProvider, useGroupContext, useGroupDispatch } from "./GroupProvider";

import GroupList from "groups/components/GroupList";
import ViewGroup from "groups/components/ViewGroup";
import EditGroup from "groups/components/EditGroup";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";
import AddAnswer from './components/answers/AddAnswer';

import { initialAnswer } from "groups/GroupsReducer";

interface IProps {
    groupId_answerId: string | undefined
}

const Providered = ({ groupId_answerId }: IProps) => {
    const { state, reloadGroupNode } = useGroupContext();
    const { lastGroupExpanded, groupId_answerId_done } = state;

    const { isDarkMode, authUser } = useGlobalState();

    const [showAddAnswer, setShowAddAnswer] = useState(false);
    const handleClose = () => setShowAddAnswer(false);

    const [newAnswer, setNewAnswer] = useState({ ...initialAnswer });
    const [createAnswerError, setCreateAnswerError] = useState("");

    const dispatch = useGroupDispatch();

    useEffect(() => {
        (async () => {
            if (groupId_answerId) {
                if (groupId_answerId === 'add_answer') {
                    const sNewAnswer = localStorage.getItem('New_Answer');
                    if (sNewAnswer) {
                        const q = JSON.parse(sNewAnswer);
                        setNewAnswer({ ...initialAnswer, groupTitle: 'Select', ...q })
                        setShowAddAnswer(true);
                        localStorage.removeItem('New_Answer')
                    }
                }
                else if (groupId_answerId !== groupId_answerId_done) {
                    const arr = groupId_answerId.split('_');
                    const groupId = arr[0];
                    const answerId = arr[1];
                    await reloadGroupNode(groupId, answerId);
                }
            }
            else if (lastGroupExpanded) {
                await reloadGroupNode(lastGroupExpanded, null);
            }
        })()
    }, [lastGroupExpanded, reloadGroupNode, groupId_answerId, groupId_answerId_done])

    if (groupId_answerId !== 'add_answer') {
        if (lastGroupExpanded || (groupId_answerId && groupId_answerId !== groupId_answerId_done))
            return <div>`loading...${lastGroupExpanded} ${groupId_answerId} ${groupId_answerId_done}`</div>
    }

    return (
        <Container>
            <Button variant="secondary" size="sm" type="button"
                onClick={() => dispatch({
                    type: ActionTypes.ADD_SUB_GROUP,
                    payload: {
                        parentGroup: null,
                        level: 0
                    }
                })
                }
            >
                Add Group
            </Button>
            <Row className="my-1">
                <Col xs={12} md={5}>
                    <div>
                        <GroupList parentGroup={'null'} level={1} title="root" />
                    </div>
                </Col>
                <Col xs={0} md={7}>
                    {/* {store.mode === FORM_MODES.ADD && <Add group={group??initialGroup} />} */}
                    {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                    <div id='div-details' className="d-none d-md-block">
                        {state.mode === Mode.ViewingGroup && <ViewGroup inLine={false} />}
                        {state.mode === Mode.EditingGroup && <EditGroup inLine={false} />}
                        {/* {state.mode === FORM_MODES.ADD_ANSWER && <AddAnswer group={null} />} */}
                        {state.mode === Mode.ViewingAnswer && <ViewAnswer inLine={false} />}
                        {state.mode === Mode.EditingAnswer && <EditAnswer inLine={false} />}
                    </div>
                </Col>
            </Row>

            <Modal
                show={showAddAnswer}
                onHide={handleClose}
                animation={true}
                centered
                size="lg"
                className={`${isDarkMode ? "" : ""}`}
                contentClassName={`${isDarkMode ? "bg-light bg-gradient" : ""}`}
            >
                <Modal.Header closeButton>
                    Put the new Answer to Database
                </Modal.Header>
                <Modal.Body className="py-0">
                    <AddAnswer
                        answer={newAnswer}
                        closeModal={() => setShowAddAnswer(false)}
                        inLine={false}
                        showCloseButton={false}
                        setError={(msg) => setCreateAnswerError(msg)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    {createAnswerError}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

type Params = {
    groupId_answerId: string | undefined;
};

const Groups = () => {
    let { groupId_answerId } = useParams<Params>();

    if (groupId_answerId && groupId_answerId === 'null')
        groupId_answerId = undefined;

    if (groupId_answerId) {
        const arr = groupId_answerId!.split('_');
        console.assert(arr.length === 2, "expected 'groupId_answerId'")
    }
    const globalState = useGlobalState();
    const { isAuthenticated, dbp } = globalState;

    if (!isAuthenticated || !dbp)
        return <div>loading...</div>;

    return (
        <GroupProvider>
            <Providered groupId_answerId={groupId_answerId} />
        </GroupProvider>
    )
}

export default Groups;