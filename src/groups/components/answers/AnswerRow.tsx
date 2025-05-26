import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faThumbsUp, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IGroupInfo, Mode } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'hooks/useHover';
import { IAnswer } from 'groups/types'

import AddAnswer from "groups/components/answers/AddAnswer";
import EditAnswer from "groups/components/answers/EditAnswer";
import ViewAnswer from "groups/components/answers/ViewAnswer";
import A from 'assets/A.png';
import APlus from 'assets/APlus.png';

import { IWhoWhen } from 'global/types';


//const AnswerRow = ({ answer, groupInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, answer: IAnswer, groupInAdding: boolean | undefined }) => {
const AnswerRow = ({ answer, groupInAdding }: { answer: IAnswer, groupInAdding: boolean | undefined }) => {
    const { id, partitionKey, parentGroup, title, inAdding } = answer;

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();
    const { state, viewAnswer, editAnswer, deleteAnswer } = useGroupContext();
    const { answerId, groupInViewingOrEditing } = state;
    const dispatch = useGroupDispatch();
    const bold = groupInViewingOrEditing &&  groupInViewingOrEditing.id === id;


    const alreadyAdding = state.mode === Mode.AddingAnswer;

    const del = () => {
        answer.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteAnswer(answer);
    };

    const edit = (Id: string) => {
        // Load data from server and reinitialize answer
        editAnswer({ partitionKey, id });
    }

    const onSelectAnswer = (id: string) => {
        // Load data from server and reinitialize answer
        if (canEdit)
            editAnswer({ partitionKey, id });
        else
            viewAnswer({ partitionKey, id });
    }
   
    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        // <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-secondary border border-3  position-relative">
        <div ref={hoverRef} className="d-flex align-items-center w-100 text-white bg-info  position-relative">
            <Button
                variant='link'
                size="sm"
                className="d-flex align-items-center p-0 px-1 text-white"
            >
                <img width="22" height="18" src={A} alt="Answer" />
            </Button>

            <Button
                variant='link'
                size="sm"
                className={`p-0 mx-0 text-decoration-none text-white ${bold ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectAnswer(id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            {/* <Badge pill bg="secondary" className={`text-info ${numOfAssignedAnswers === 0 ? 'd-none' : 'd-inline'}`}>
                {numOfAssignedAnswers}a */}
            {/* <FontAwesomeIcon icon={faReply} size='sm' /> */}
            {/* <img width="22" height="18" src={A} alt="Answer"></img> */}
            {/* </Badge> */}

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
                    <Button variant='link' size="sm" className="ms-0 p-0 text-secondary"
                        onClick={del}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                    <Button
                        variant='link'
                        size="sm"
                        className="ms-1 p-0 text-secondary d-flex align-items-center"
                        title="Add Answer"
                        onClick={() => {
                            const groupInfo: IGroupInfo = { partitionKey, id: parentGroup, level: 0 }
                            dispatch({ type: ActionTypes.ADD_ANSWER, payload: { groupInfo } })
                        }}
                    >
                        <img width="22" height="18" src={APlus} alt="Add Answer" />
                    </Button>
                </div>
            }
        </div>

    return (
        // border border-3 border-danger"
        <div className="py-0 px-1 w-100 list-group-item">
            {inAdding && groupInAdding && state.mode === Mode.AddingAnswer ? (
                <AddAnswer answer={answer} inLine={true} showCloseButton={true} source={0} />
            )
                : (state.mode === Mode.EditingAnswer || state.mode === Mode.ViewingAnswer) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-answer' className="ms-0 d-md-none w-100">
                            {state.mode === Mode.EditingAnswer && <EditAnswer inLine={true} />}
                            {state.mode === Mode.ViewingAnswer && <ViewAnswer inLine={true} />}
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
    );
};

export default AnswerRow;
