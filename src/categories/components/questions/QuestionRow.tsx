import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faQuestion, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, ICategoryInfo, Mode } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'common/components/useHover';
import { IQuestion } from 'categories/types'

import AddQuestion from "categories/components/questions/AddQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import Q from 'assets/Q.png';
import QPlus from 'assets/QPlus.png';

//const QuestionRow = ({ question, categoryInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, question: IQuestion, categoryInAdding: boolean | undefined }) => {
const QuestionRow = ({ question, categoryInAdding }: { question: IQuestion, categoryInAdding: boolean | undefined }) => {
    const { id, parentCategory, level, title, inViewing, inEditing, inAdding, numOfAssignedAnswers } = question;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewQuestion, editQuestion, deleteQuestion } = useCategoryContext();
    const dispatch = useCategoryDispatch();

    const alreadyAdding = state.mode === Mode.AddingQuestion;

    const del = () => {
        deleteQuestion(id!, parentCategory);
    };

    const edit = (id: number) => {
        // Load data from server and reinitialize question
        editQuestion(id);
    }

    const onSelectQuestion = (id: number) => {
        // Load data from server and reinitialize question
        if (canEdit)
            editQuestion(id);
        else
            viewQuestion(id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        // <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-secondary border border-3  position-relative">
        <div ref={hoverRef} className="d-flex align-items-center w-100 text-secondary position-relative">
            <Button
                variant='link'
                size="sm"
                className="p-0 px-0 text-secondary"
            >
                <img width="22" height="18" src={Q} alt="Question" />
            </Button>

            <Button
                variant='link'
                size="sm"
                className={`p-0 mx-0 text-decoration-none text-secondary ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectQuestion(id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={`text-info ${numOfAssignedAnswers === 0 ? 'd-none' : 'd-inline'}`}>
                {numOfAssignedAnswers}a
                {/* <FontAwesomeIcon icon={faReply} size='sm' /> */}
                {/* <img width="22" height="18" src={A} alt="Answer"></img> */}
            </Badge>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, question }) }}>
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
                        title="Add Question"
                        onClick={() => {
                            const categoryInfo: ICategoryInfo = { id: parentCategory, level }
                            dispatch({ type: ActionTypes.ADD_QUESTION, payload: { categoryInfo } })
                        }}
                    >
                        <img width="22" height="18" src={QPlus} alt="Add Question" />
                    </Button>
                </div>
            }
        </div>

    return (
        // border border-3 border-danger"
        <div className="py-0 px-1 w-100 list-group-item">
            {inAdding && categoryInAdding && state.mode === Mode.AddingQuestion ? (
                <AddQuestion question={question} inLine={true} showCloseButton={true} source={0} />
            )
                : ((inEditing && state.mode === Mode.EditingQuestion) ||
                   (inViewing && state.mode === Mode.ViewingQuestion)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-question' className="ms-0 d-md-none w-100">
                            {inEditing && <EditQuestion inLine={true} />}
                            {inViewing && <ViewQuestion inLine={true} />}
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

export default QuestionRow;
