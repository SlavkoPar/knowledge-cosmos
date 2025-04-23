import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes, IGroupKey } from "./types";

import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { GroupProvider, useGroupContext, useGroupDispatch } from "./GroupProvider";

import GroupList from "groups/components/GroupList";
import ViewGroup from "groups/components/ViewGroup";
import EditGroup from "groups/components/EditGroup";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";

import { initialAnswer } from "groups/GroupsReducer";
import ModalAddAnswer from './ModalAddAnswer';
import useFetchWithMsal from 'hooks/useFetchWithMsal';
import { protectedResources } from 'authConfig';
import AddGroup from './components/AddGroup';

interface IProps {
    groupId_answerId: string | undefined
}

const Providered = ({ groupId_answerId }: IProps) => {
    const { state, reloadGroupNode } = useGroupContext();
    const { groupKeyExpanded, groupId_answerId_done, answerId, groupNodeLoaded } = state;
    console.log('Providered', { groupKeyExpanded, groupNodeLoaded })

    const { isDarkMode, authUser } = useGlobalState();

    const [modalShow, setModalShow] = useState(false);
    const handleClose = () => {
        setModalShow(false);
    }

    const [newAnswer, setNewAnswer] = useState({ ...initialAnswer });
    const [createAnswerError, setCreateAnswerError] = useState("");

    const dispatch = useGroupDispatch();
    const [groupKey] = useState<IGroupKey>({ partitionKey: 'null', id: 'null' })

    useEffect(() => {
        (async () => {
            if (groupId_answerId) {
                if (groupId_answerId === 'add_answer') {
                    const sNewAnswer = localStorage.getItem('New_Answer');
                    if (sNewAnswer) {
                        const q = JSON.parse(sNewAnswer);
                        setNewAnswer({ ...initialAnswer, groupTitle: 'Select', ...q })
                        setModalShow(true);
                        localStorage.removeItem('New_Answer');
                        return null;
                    }
                }
                else if (groupId_answerId !== groupId_answerId_done) { //} && !groupNodeLoaded) {
                    console.log('1) ===>>> Groups calling reloadGroupNode:', { groupId_answerId, groupKeyExpanded, groupId_answerId_done });
                    const arr = groupId_answerId.split('_');
                    const groupId = arr[0];
                    const answerId = arr[1];
                    await reloadGroupNode({ partitionKey: '', id: groupId }, answerId).then(() => { return null; });
                }
            }
            else if (groupKeyExpanded && !groupNodeLoaded) {
                console.log('2) ===>>> Groups calling reloadGroupNode:', { groupId_answerId, groupKeyExpanded, groupId_answerId_done });
                await reloadGroupNode(groupKeyExpanded, answerId).then(() => { return null; });
            }
        })()
    }, [groupKeyExpanded, groupNodeLoaded, reloadGroupNode, groupId_answerId, groupId_answerId_done])

    if (groupId_answerId !== 'add_answer') {
        if (/*groupKeyExpanded ||*/ (groupId_answerId && groupId_answerId !== groupId_answerId_done)) {
            console.log("zzzzzz loading...", { groupKeyExpanded, groupId_answerId, groupId_answerId_done })
            return <div>`zzzzzz loading... "${groupId_answerId}" "${groupId_answerId_done}"`</div>
        }
    }

    console.log('===>>> Groups !!!!!!!!!!!!!!!!!')
    if (!groupNodeLoaded)
        return null

    return (
        <>
            <Container>
                <h6 style={{ color: 'rgb(13, 110, 253)', marginLeft: '30%' }}>Groups / Answers</h6>
                <Button variant="secondary" size="sm" type="button" style={{ padding: '1px 4px' }}
                    onClick={() => dispatch({
                        type: ActionTypes.ADD_SUB_GROUP,
                        payload: {
                            groupKey,
                            level: 1
                        }
                    })
                    }
                >
                    Add Group
                </Button>
                <Row className="my-1">
                    <Col xs={12} md={5}>
                        <div>
                            <GroupList groupKey={groupKey} level={0} title="root" />
                        </div>
                    </Col>
                    <Col xs={0} md={7}>
                        {/* {store.mode === FORM_MODES.ADD && <Add group={group??initialGroup} />} */}
                        {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                        <div id='div-details' className="d-none d-md-block">
                            {state.mode === Mode.AddingGroup && <AddGroup groupKey={groupKey} inLine={false} />}
                            {state.mode === Mode.ViewingGroup && <ViewGroup inLine={false} />}
                            {state.mode === Mode.EditingGroup && <EditGroup inLine={false} />}
                            {/* {state.mode === FORM_MODES.ADD_ANSWER && <AddAnswer group={null} />} */}
                            {/* TODO check if we set answerId everywhere */}
                            {answerId && state.mode === Mode.ViewingAnswer && <ViewAnswer inLine={false} />}
                            {answerId && state.mode === Mode.EditingAnswer && <EditAnswer inLine={false} />}
                        </div>
                    </Col>
                </Row>
            </Container>
            {modalShow &&
                <ModalAddAnswer
                    show={modalShow}
                    onHide={() => { setModalShow(false) }}
                    newAnswer={newAnswer}
                />
            }
        </>
    );
};

type Params = {
    groupId_answerId?: string;
};

const Groups = () => {
    let { groupId_answerId } = useParams<Params>();

    if (groupId_answerId && groupId_answerId === 'groups')
        groupId_answerId = undefined;

    if (groupId_answerId) {
        const arr = groupId_answerId!.split('_');
        console.assert(arr.length === 2, "expected 'groupId_answerId'")
    }
    // const globalState = useGlobalState();
    // const { isAuthenticated } = globalState;

    // if (!isAuthenticated)
    //     return <div>groups loading...</div>;

    return (
        <GroupProvider>
            <Providered groupId_answerId={groupId_answerId} />
        </GroupProvider>
    )
}

export default Groups;

