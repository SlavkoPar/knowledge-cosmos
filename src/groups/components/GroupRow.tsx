
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import APlus from 'assets/APlus.png';

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IGroupInfo, IGroupKey, IParentInfo, Mode } from "groups/types";
import { useGroupContext, useGroupDispatch } from 'groups/GroupProvider'
import { useHover } from 'hooks/useHover';
import { IGroup } from 'groups/types'

import GroupList from "groups/components/GroupList";
import AddGroup from "groups/components/AddGroup";
import EditGroup from "groups/components/EditGroup";
import ViewGroup from "groups/components/ViewGroup";
import AnswerList from './answers/AnswerList';
import useFetchWithMsal from 'hooks/useFetchWithMsal';
import { protectedResources } from 'authConfig';

const GroupRow = ({ group }: { group: IGroup }) => {
    const { partitionKey, id, title, level, inViewing, inEditing, inAdding, hasSubGroups, answers, numOfAnswers, isExpanded } = group;
    const [groupKey] = useState<IGroupKey>({ partitionKey, id }); // otherwise reloads

    const parentInfo: IParentInfo = {
        groupKey,
        includeAnswerId: null,
        level,
        title
    }

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();

    const { state, viewGroup, editGroup, deleteGroup, expandGroup, collapseGroup } = useGroupContext();
    const { answerId } = state;

    const dispatch = useGroupDispatch();

    const alreadyAdding = state.mode === Mode.AddingGroup;
    // TODO proveri ovo
    const showAnswers = (isExpanded && numOfAnswers > 0) // || answers.find(q => q.inAdding) // && !answers.find(q => q.inAdding); // We don't have answers loaded

    const del = () => {
        group.modified = { 
            time: new Date(),
            nickName: authUser.nickName 
        }
        deleteGroup(group);
    };

    const expand = async () => {
        if (isExpanded)
            await collapseGroup(groupKey);
        else
            await expandGroup(groupKey, answerId ?? 'null');
    }

    const edit = () => {
        // Load data from server and reinitialize group
        editGroup(groupKey, answerId ?? 'null');
    }

    const onSelectGroup = () => {
        if (canEdit)
            editGroup(groupKey, answerId ?? 'null');
        else
            viewGroup(groupKey, answerId ?? 'null');
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={expand}
                title="Expand"
                disabled={alreadyAdding || (!hasSubGroups && numOfAnswers === 0)}
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={id!.toString()}
                onClick={onSelectGroup}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={numOfAnswers === 0 ? 'd-none' : 'd-inline'}>
                {numOfAnswers}A
                {/* <FontAwesomeIcon icon={faThumbsUp} size='sm' /> */}
                {/* <img width="22" height="18" src={Q} alt="Answer" /> */}
            </Badge>

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <>
                    <Button variant='link' size="sm" className="ms-1 py-0 px-0"
                        //onClick={() => { dispatch({ type: ActionTypes.EDIT, group }) }}>
                        onClick={() => edit()}
                    >
                        <FontAwesomeIcon icon={faEdit} size='lg' />
                    </Button>
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-primary float-end"
                        title="Add SubGroup"
                        onClick={() => {
                            dispatch({
                                type: ActionTypes.ADD_SUB_GROUP,
                                payload: {
                                    groupKey,
                                    level: group.level + 1
                                }
                            })
                            // if (!isExpanded)
                            //     dispatch({ type: ActionTypes.SET_EXPANDED, payload: { groupKey } });
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} size='lg' />
                    </Button>
                </>
            }

            {/* TODO what about archive answers  numOfAnswers === 0 &&*/}
            {canEdit && !alreadyAdding && hoverProps.isHovered && !hasSubGroups && 
                <div className="position-absolute d-flex align-items-center top-0 end-0">
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-secondary float-end"
                        title="Add Answer"
                        onClick={async () => {
                            const groupInfo: IGroupInfo = { partitionKey, id: group.id, level: group.level }
                            if (!isExpanded) {
                                await dispatch({ type: ActionTypes.SET_EXPANDED, payload: { groupKey } });
                            }
                            await dispatch({ type: ActionTypes.ADD_ANSWER, payload: { groupInfo } });
                        }}
                    >
                        <img width="22" height="18" src={APlus} alt="Add Answer" />
                    </Button>

                    <Button variant='link' size="sm" className="py-0 mx-1 float-end"
                        onClick={del}
                    >
                        <FontAwesomeIcon icon={faRemove} size='lg' />
                    </Button>
                </div>
            }
        </div>

    // console.log({ title, isExpanded })

    // if (group.level !== 1)
    //     return (<div>GroupRow {group.id}</div>)

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {inAdding && state.mode === Mode.AddingGroup ? (
                    // <AddGroup groupKey={groupKey} inLine={true} />
                    <div />
                )
                    : ((inEditing && state.mode === Mode.EditingGroup) ||
                        (inViewing && state.mode === Mode.ViewingGroup)) ? (
                        <>
                            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                            <div id='divInLine' className="ms-0 d-md-none w-100">
                                {inEditing && <EditGroup inLine={false} />}
                                {inViewing && <ViewGroup inLine={false} />}
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
            </ListGroup.Item>

            { state.error && state.whichRowId == id && <div className="text-danger">{state.error.message}</div> }

            {/* !inAdding && */}
            {(isExpanded || inViewing || inEditing || inAdding) && // Row2
                <ListGroup.Item
                    className="py-0 px-0" // border border-3 border-warning"
                    variant={"primary"}
                    as="li"
                >
                    {isExpanded &&
                        <>
                            {hasSubGroups &&
                                <GroupList level={level + 1} groupKey={groupKey} title={title} />
                            }
                            {showAnswers &&
                                <AnswerList level={level + 1} groupKey={groupKey} title={title} />
                            }
                        </>
                    }

                </ListGroup.Item>
            }

           
        </>
    );
};

export default GroupRow;
