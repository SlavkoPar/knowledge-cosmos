import React, { useEffect, useState } from "react";
import { Button, ListGroup, Modal } from "react-bootstrap";
import { IAssignedAnswer, IQuestionKey } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalContext } from "global/GlobalProvider";
import AssignedAnswer from "./AssignedAnswer";
import { AutoSuggestAnswers } from 'categories/AutoSuggestAnswers'
import { IWhoWhen } from "global/types";
import { IAnswer, IAnswerKey } from "groups/types";
import AddAnswer from "categories/components/questions/AddAnswer"
import { initialAnswer } from "groups/GroupsReducer"; // PRE

interface IProps {
    questionKey: IQuestionKey,
    questionTitle: string,
    assignedAnswers: IAssignedAnswer[],
    isDisabled: boolean
}

const AssignedAnswers = ({ questionKey, questionTitle, assignedAnswers, isDisabled }: IProps) => {

    const { globalState, joinAssignedAnswers, searchAnswers } = useGlobalContext();
    const { authUser, isDarkMode, variant, shortGroups } = globalState;

    //const [assignedAnswers2, setAssignAnswers2] = useState<IAssignedAnswer[]>([]);

    const [showAdd, setShowAdd] = useState(false);
    const handleClose = () => setShowAdd(false);

    const closeModal = () => {
        handleClose();
    }

    // useEffect(() => {
    //     (async () => {
    //         if (assignedAnswers.length > 0) {
    //             //const arr = await joinAssignedAnswers(assignedAnswers);
    //             setAssignAnswers2(assignedAnswers);
    //         }
    //     })()
    // }, [assignedAnswers])

    const { state, assignQuestionAnswer, unAssignQuestionAnswer } = useCategoryContext();
    const [showAssign, setShowAssign] = useState(false);

    const onSelectQuestionAnswer = async (answerKey: IAnswerKey) => {
        const assigned: IWhoWhen = {
            time: new Date(),
            nickName: globalState.authUser.nickName
        }
        // TODO in next version do not update MongoDB immediately, wait until users presses Save
        // User could have canceled question update
        await assignQuestionAnswer(questionKey, answerKey, assigned);
        setShowAssign(false);
    }

    const onAnswerCreated = async (answer: IAnswer | null) => {
        if (answer) {
            const { partitionKey, id } =  answer;
            const answerKey = {partitionKey, id} 
            await onSelectQuestionAnswer(answerKey);
        }
        handleClose()
    }

    const unAssignAnswer = async (answerKey: IAnswerKey) => {
        const unAssigned: IWhoWhen = {
            time: new Date(),
            nickName: globalState.authUser.nickName
        }
        await unAssignQuestionAnswer(questionKey, answerKey, unAssigned);
    }

    return (
        <div className={'mx-0 my-1 border rounded-2 px-3 py-1 border border-info'} >
            <div>
                <label className="text-info">Answers</label>
                <ListGroup as="ul" variant={variant} className='my-1'>
                    {assignedAnswers.map((assignedAnswer: IAssignedAnswer) =>
                        <AssignedAnswer
                            questionTitle={questionTitle}
                            assignedAnswer={assignedAnswer}
                            groupInAdding={false}
                            isDisabled={isDisabled}
                            unAssignAnswer={unAssignAnswer}
                        />)
                        // key={assignedAnswer.answer.id.toString()}
                    }
                </ListGroup>
                {state.error && <div>state.error</div>}
                {/* {state.loading && <div>...loading</div>} */}
            </div>
            {true && // we expect no question will ever assign all the answers from the database
                <div className="d-flex justify-content-start w-100 align-items-center py-1">
                    <Button
                        size="sm"
                        className="button-edit py-0 rounded-1"
                        title="Assign a new Answer"
                        style={{ border: '1px solid silver', fontSize: '12px' }}
                        variant={variant}
                        disabled={isDisabled}
                        onClick={
                            (e) => {
                                setShowAssign(true);
                                e.preventDefault()
                            }
                        }>
                        Assign answer
                    </Button>
                    <Button
                        size="sm"
                        className="button-edit py-0 rounded-1 mx-1"
                        title="Add and Assign a new Answer"
                        style={{ border: '1px solid silver', fontSize: '12px' }}
                        variant={variant}
                        disabled={isDisabled}
                        onClick={
                            (e) => {
                                setShowAdd(true);
                                e.preventDefault()
                            }
                        }>
                        Add a new answer
                    </Button>
                </div>
            }

            <Modal
                show={showAdd}
                onHide={handleClose}
                animation={true}
                centered
                size="lg"
                className={`${isDarkMode ? "" : ""}`}
                contentClassName={`${isDarkMode ? "bg-info bg-gradient" : ""}`}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{questionTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddAnswer
                        answer={initialAnswer}
                        inLine={true}
                        closeModal={closeModal}
                        onAnswerCreated={onAnswerCreated}
                    />
                </Modal.Body>
            </Modal>

            <Modal
                show={showAssign}
                onHide={() => setShowAssign(false)}
                animation={true}
                size="lg"
                centered
                className={`${isDarkMode ? "dark" : ""}`}
                contentClassName={`${isDarkMode ? "dark" : ""}`}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign the answer</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '40vh', width: '50vw' }} className="question-answers">

                    <AutoSuggestAnswers
                        tekst={''}
                        alreadyAssigned={
                            assignedAnswers.length === 0
                                ? []
                                : assignedAnswers.map((a: IAssignedAnswer) => a.answerKey.id)
                        }
                        shortGroups={shortGroups}
                        onSelectQuestionAnswer={onSelectQuestionAnswer}
                        searchAnswers={searchAnswers}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AssignedAnswers;
