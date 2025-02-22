import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faThumbsUp, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IGroupInfo, Mode } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'common/components/useHover';
import { IAnswer } from 'groups/types'

import AddAnswer from "groups/components/answers/AddAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";
import ViewAnswer from "groups/components/answers/ViewAnswer";

import A from 'assets/A.png';
import APlus from 'assets/APlus.png';

//const AnswerRow = ({ answer, groupInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, answer: IAnswer, groupInAdding: boolean | undefined }) => {
const AnswerRow = ({ answer, groupInAdding }: { answer: IAnswer, groupInAdding: boolean | undefined }) => {
    const { id, parentGroup, level, title, inViewing, inEditing, inAdding, numOfAnswers } = answer;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewAnswer, editAnswer, deleteAnswer } = useGroupContext();
    const dispatch = useGroupDispatch();

    const alreadyAdding = state.mode === Mode.AddingAnswer;

    const del = () => {
        deleteAnswer(id!, parentGroup);
    };

    const edit = (id: number) => {
        // Load data from server and reinitialize answer
        editAnswer(id);
    }

    const onSelectAnswer = (id: number) => {
        // Load data from server and reinitialize answer
        if (canEdit)
            editAnswer(id);
        else
            viewAnswer(id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-secondary position-relative">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1 text-secondary"
            >
                {/* <FontAwesomeIcon
                    icon={faThumbsUp}
                    size='sm'
                /> */}
                <img width="22" height="18" src={A} alt="Answer" />
            </Button>

            {/* <Badge pill bg="secondary" className={`text-info ${numOfAnswers === 0 ? 'd-none' : 'd-inline'}`}>
                {numOfAnswers}<FontAwesomeIcon icon={faReply} size='sm' />
            </Badge> */}

            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none text-secondary ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectAnswer(id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, answer }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <div className="position-absolute d-flex align-items-center top-0 end-0">
                    <Button variant='link' size="sm" className="ms-1 py-0 mx-0 text-secondary"
                        onClick={del}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                    {/* }

            {canEdit && !alreadyAdding && hoverProps.isHovered && */}

                    <Button
                        variant='link'
                        size="sm"
                        className="ms-1 py-0 mx-0 text-secondary"
                        title="Add Answer"
                        onClick={() => {
                            console.log('click q')
                            const groupInfo: IGroupInfo = { id: parentGroup, level }
                            dispatch({ type: ActionTypes.ADD_ANSWER, payload: { groupInfo } })
                        }}
                    >
                        {/* <FontAwesomeIcon icon={faPlus} size='lg' /> */}
                        {/* <FontAwesomeIcon icon={faThumbsUp} size='lg' style={{ marginLeft: '-5px' }} /> */}
                        {/* <img width="18" height="14" src={A} alt="Answer" style={{ marginLeft: '-2px' }} /> */}
                        <img width="22" height="18" src={APlus} alt="Add Answer" />
                    </Button>
                </div>
            }
        </div>

    return (
        // <ListGroup.Item
        //     variant={"secondary"}
        //     className="py-0 px-1 w-100"
        //     as="li"
        // >
        <div className="py-0 px-1 w-100 list-group-item">
            {inAdding && groupInAdding && state.mode === Mode.AddingAnswer ? (
                <AddAnswer answer={answer} inLine={true} showCloseButton={true} />
            )
                : ((inEditing && state.mode === Mode.EditingAnswer) ||
                    (inViewing && state.mode === Mode.ViewingAnswer)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-answer' className="ms-0 d-md-none w-100">
                            {inEditing && <EditAnswer inLine={true} />}
                            {inViewing && <ViewAnswer inLine={true} />}
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

export default AnswerRow;
