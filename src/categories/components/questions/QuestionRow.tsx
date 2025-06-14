import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faQuestion, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, ICategoryInfo, IQuestionKey, IQuestionRow, Mode } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'hooks/useHover';
import { IQuestion } from 'categories/types'

import AddQuestion from "categories/components/questions/AddQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import Q from 'assets/Q.png';
import QPlus from 'assets/QPlus.png';

import { IWhoWhen } from 'global/types';
import { initialQuestion } from 'categories/CategoriesReducer';


//const QuestionRow = ({ question, categoryInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, question: IQuestion, categoryInAdding: boolean | undefined }) => {
const QuestionRow = ({ questionRow, categoryInAdding }: { questionRow: IQuestionRow, categoryInAdding: boolean | undefined }) => {
    const { id, partitionKey, parentCategory, title, inAdding, numOfAssignedAnswers, isSelected } = questionRow;
    const questionKey: IQuestionKey = { partitionKey, id, parentCategory: parentCategory ?? undefined };

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();
    const { state, viewQuestion, editQuestion, deleteQuestion } = useCategoryContext();
    const dispatch = useCategoryDispatch();

    const { questionInViewingOrEditing, categoryKeyExpanded } = state;
    const { questionId } = categoryKeyExpanded ?? { questionId: null };

    //const { questionKey } = questionInViewingOrEditing;
    //const bold = questionInViewingOrEditing && questionInViewingOrEditing.id === id;
    //const bold = categoryKeyExpanded && categoryKeyExpanded.id === id;
    //const bold = included; // id === questionId;
    console.log("------------------------ QuestionRow", { id, questionId })

    const alreadyAdding = state.mode === Mode.AddingQuestion;

    const del = () => {
        questionRow.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteQuestion(questionRow);
    };

    const edit = async (Id: string) => {
        // Load data from server and reinitialize question
        await editQuestion(questionKey);
    }

    const onSelectQuestion = async (id: string) => {
        if (canEdit)
            await editQuestion(questionKey);
        else
            await viewQuestion(questionKey);
    }

    useEffect(() => {
        (async () => {
            if (isSelected) {
                onSelectQuestion(id)
            }
        })()
    }, [isSelected]);

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-primary bg-warning position-relative question-row">
            <Button
                variant='link'
                size="sm"
                className="d-flex align-items-center px-1 text-secondary"
            >
                <img width="22" height="18" src={Q} alt="Question" />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`p-0 mx-0 text-decoration-none text-secondary ${isSelected ? 'fw-bold' : ''}`}
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
                            const categoryInfo: ICategoryInfo = { categoryKey: { partitionKey, id: parentCategory }, level: 0 }
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
        // <div className="py-0 px-0 w-100 list-group-item border">
        <ListGroup.Item
            variant={"primary"}
            className="py-0 px-1 w-100"
            as="li"
        >
            {inAdding && categoryInAdding && state.mode === Mode.AddingQuestion ? (
                <AddQuestion
                    //question={{ ...initialQuestion, ...questionRow}} 
                    questionRow={questionRow}
                    inLine={true}
                    showCloseButton={true}
                    source={0} />
            )
                : (state.mode === Mode.EditingQuestion || state.mode === Mode.ViewingQuestion) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-question' className="ms-0 d-md-none w-100">
                            {state.mode === Mode.EditingQuestion && <EditQuestion questionKey={questionKey} inLine={true} />}
                            {state.mode === Mode.ViewingQuestion && <ViewQuestion inLine={true} />}
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
            {/* </div> */}
        </ListGroup.Item>
    );
};

export default QuestionRow;
