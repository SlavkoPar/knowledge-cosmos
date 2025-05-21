import React, { useEffect, useState, JSX, useRef } from 'react';
import { Container, Row, Col, Button, Form, ListGroup, Offcanvas } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";


import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { useParams } from 'react-router-dom' // useRouteMatch
import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons'

import { ICategory, IQuestion, IQuestionEx, IQuestionKey, ActionTypes } from 'categories/types';
import { IWhoWhen, ICat, IHistory, USER_ANSWER_ACTION, IHistoryFilterDto } from 'global/types';
import { IChatBotAnswer, INewQuestion, INextAnswer, useAI } from 'hooks/useAI'
import { IAnswer } from 'groups/types';

import Q from 'assets/Q.png';
import A from 'assets/A.png';
import { useCategoryDispatch } from 'categories/CategoryProvider';

type ChatBotParams = {
    source: string;
    tekst: string;
    email?: string;
};

type ICatLevel = {
    level: number;
    catId: string | null;
    header: string;
    subCats: ICat[];
    subCatIdSelected: string | null;
}

interface IProps {
    show: boolean,
    onHide: () => void;
}



<style type='css'>
    {/* .list-group {
    --bs-list-group-color: var(--bs-body-color);
    --bs-list-group-bg: var(--bs-body-bg);
    --bs-list-group-border-color: var(--bs-border-color);
    --bs-list-group-border-width: var(--bs-border-width);
    --bs-list-group-border-radius: var(--bs-border-radius);
    --bs-list-group-item-padding-x: 1rem;
    --bs-list-group-item-padding-y: 0.5rem;
    --bs-list-group-action-color: var(--bs-secondary-color);
    --bs-list-group-action-hover-color: var(--bs-emphasis-color);
    --bs-list-group-action-hover-bg: var(--bs-tertiary-bg);
    --bs-list-group-action-active-color: var(--bs-body-color);
    --bs-list-group-action-active-bg: var(--bs-secondary-bg);
    --bs-list-group-disabled-color: var(--bs-secondary-color);
    --bs-list-group-disabled-bg: var(--bs-body-bg);
    --bs-list-group-active-color: #fff;
    --bs-list-group-active-bg: #0d6efd;
    --bs-list-group-active-border-color: #0d6efd;
    display: flex;
    flex-direction: column;
    padding-left: 0;
    margin-bottom: 0;
    border-radius: var(--bs-list-group-border-radius);
} */}
</style>


const ChatBotDlg = ({ show, onHide }: IProps) => {
    let { source, tekst, email } = useParams<ChatBotParams>();
    const dispatch = useCategoryDispatch();
    const [autoSuggestionValue, setAutoSuggestionValue] = useState(tekst!)
    const [setNewQuestion, getCurrQuestion, getNextChatBotAnswer] = useAI([]);
    const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | null>(null);
    const [autoSuggestId, setAutoSuggestId] = useState<number>(1);
    const [showAnswer, setShowAnswer] = useState(false);
    const [chatBotAnswer, setChatBotAnswer] = useState<IChatBotAnswer | null>(null);
    const [hasMoreAnswers, setHasMoreAnswers] = useState<boolean>(false);

    const { getSubCats, getQuestion, addHistory, addHistoryFilter, getAnswersRated, searchQuestions, setLastRouteVisited } = useGlobalContext();
    const { dbp, canEdit, authUser, isDarkMode, variant, bg, cats, catsLoaded, lastRouteVisited } = useGlobalState();
    const navigate = useNavigate();

    const [catsSelected, setCatsSelected] = useState(true);
    const [showAutoSuggest, setShowAutoSuggest] = useState(false);

    const [catLevels, setCatLevels] = useState<ICatLevel[]>([]);

    const [pastEvents, setPastEvents] = useState<IChild[]>([]);

    class QuestionKey {
        constructor(question: IQuestion) {
            this.questionKey = {
                partitionKey: question.partitionKey,
                id: question.id
            }
        }
        questionKey: IQuestionKey;
    }

    enum ChildType {
        AUTO_SUGGEST,
        QUESTION,
        ANSWER
    }

    interface IChild {
        type: ChildType;
        isDisabled: boolean;
        txt: string,
        link: string | null,
        hasMoreAnswers?: boolean
    }
    // const deca: JSX.Element[] = [];
    // useEffect(() => {
    // 	(async () => {
    // 		//await loadCats();
    // 	})()
    // }, [])

    const onEntering = async (node: HTMLElement, isAppearing: boolean): Promise<any> => {
        setCatLevels([]);
        const parentCategory = 'MTS'; // null
        const res = await getSubCats(parentCategory);
        const { subCats, parentHeader } = res;
        console.log('/////////////////////////////////////////////////////', subCats)
        setCatLevels((prevState) => ([
            ...prevState,
            {
                level: 1,
                catId: parentCategory,
                header: parentHeader,
                subCats,
                subCatIdSelected: null
            }
        ]))

    }

    useEffect(() => {
        (async () => {
            //setCatOptions(await getCatsByKind(2));
            // const parentCategory = 'MTS'; // null
            // const res = await getSubCats(parentCategory);
            // const { subCats, parentHeader } = res;
            // console.log('/////////////////////////////////////////////////////', subCats)
            // setCatLevels((prevState) => ([
            //     ...prevState,
            //     {
            //         level: 1,
            //         catId: parentCategory,
            //         header: parentHeader,
            //         subCats,
            //         subCatIdSelected: null
            //     }
            // ]))
        })()
    }, []) // [catsLoaded])

    const scrollableRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     setLastRouteVisited(`/ChatBotPage/0/${encodeURIComponent('daljinski')}/xyz`);
    // }, [setLastRouteVisited])

    // useEffect(() => {
    //     scrollToBottom();
    // }, []);

    if (!catsLoaded) // || catsOptions.length === 0)
        return <div>cats not loaded...</div>

    const onOptionChange = async (id: string, level: number, title: string) => {//event: React.ChangeEvent<HTMLInputElement>) => {
        //const target = event.target;
        //const { id, name } = target;
        //const value = type === 'checkbox' ? target.checked : target.value;
        //const level = parseInt(name as any);
        // update the last level
        const prev = catLevels.map(catLevel => catLevel.level === level
            ? {
                ...catLevel,
                subCatIdSelected: id,
                header: title
            }
            : catLevel
        )
        // setCatLevels((prevState) => (
        // 	catLevels
        // ))

        // const { header } = catLevel;
        // const catSelected = catLevel.subCats.find(sc => sc.id = id)!;
        // catLevel.catSelected = catSelected;

        const res = await getSubCats(id);
        const { subCats, parentHeader } = res;

        console.log('///////////////////////////////////////////////////// id:', id, subCats)
        setCatLevels((prevState) => ([
            ...prev,
            {
                level: level + 1,
                catId: id,
                header: parentHeader,
                subCats,
                subCatIdSelected: null
            }
        ]))
        //setShowUsage(true);
        // setCatOptions((prevState) => ({ 
        // 	stateName: prevState.stateName + 1 
        // }))
        // this.setState({
        // 	 [name]: value
        // });
    }

    const onUsageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name as any;
        setCatsSelected(true);
        setAutoSuggestId(autoSuggestId + 1);
        setShowAutoSuggest(true);
        //setPaymentMethod(value);
    };

    //categoryId: string, questionId: string
    const onSelectQuestion = async (questionKey: IQuestionKey, underFilter: string) => {
        const questionCurr = await getCurrQuestion();
        if (questionCurr) {
            console.log({ questionCurr })
            const historyFilterDto: IHistoryFilterDto = {
                QuestionKey: new QuestionKey(questionCurr).questionKey,
                Filter: underFilter,
                Created: { Time: new Date, NickName: authUser.nickName }
            }
            await addHistoryFilter(historyFilterDto);
        }
        // navigate(`/categories/${categoryId}_${questionId.toString()}`)
        // const question = await getQuestion(questionId);

        // salji kasnije kad klikne na Fixed
        /* TODO proveri
        if (answer) {
            const history: IHistory = {
                questionId: questionKey.id,
                answerId: answer.id,
                fixed: undefined,
                created: { 
                    nickName: authUser.nickName, 
                    time: new Date() 
                }
            }
            addHistory(history);
        }
        */
        if (chatBotAnswer) {
            const props: IChild = {
                type: ChildType.ANSWER,
                isDisabled: true,
                txt: chatBotAnswer.answerTitle,
                link: chatBotAnswer.answerLink
            }
            setPastEvents((prevEvents) => [...prevEvents, props]);
        }

        const questionEx: IQuestionEx = await getQuestion(questionKey);
        const { question } = questionEx;
        if (!question) {
            //alert(questionEx.msg)
            return;
        }
        console.log('Breeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:', { question })
        if (question.numOfRelatedFilters > 0) {
            setAutoSuggestionValue(question.relatedFilters[0].filter)
        }

        const res: INewQuestion = await setNewQuestion(question);
        let { firstChatBotAnswer, hasMoreAnswers } = res; // as unknown as INewQuestion;

        if (question) {
            const props: IChild = {
                type: ChildType.QUESTION,
                isDisabled: true,
                txt: question.title,
                link: null
            }
            setPastEvents((prevEvents) => [...prevEvents, props]);
        }

        setAutoSuggestId((autoSuggestId) => autoSuggestId + 1);
        setShowAutoSuggest(false);
        setSelectedQuestion(question);
        setShowAnswer(true);
        setHasMoreAnswers(hasMoreAnswers);
        //setAnswerId((answerId) => answerId + 1);
        setChatBotAnswer(firstChatBotAnswer);
        // // salji kasnije kad klikne na Fixed
        // if (firstAnswer) {
        // 	addHistory(dbp, {
        // 		conversation: conv,
        // 		client: authUser.nickName,
        // 		questionId: question!.id!,
        // 		answerId: firstAnswer.id!,
        // 		fixed: undefined,
        // 		created: new Date()
        // 	})
        // }
    }

    const onAnswerFixed = async () => {
        const props: IChild = {
            type: ChildType.ANSWER,
            isDisabled: true,
            txt: chatBotAnswer ? chatBotAnswer.answerTitle : 'no answer title',
            link: chatBotAnswer ? chatBotAnswer.answerLink : 'no answer link',
            hasMoreAnswers: true
        }
        setPastEvents((prevHistory) => [...prevHistory, props]);

        const history: IHistory = {
            questionKey: new QuestionKey(selectedQuestion!).questionKey,
            answerKey: chatBotAnswer!.answerKey,
            userAction: USER_ANSWER_ACTION.Fixed,
            created: {
                nickName: authUser.nickName,
                time: new Date()
            }
        }
        addHistory(history);

        //
        // TODO logic 
        //

        setHasMoreAnswers(false);
        //setAnswerId((answerId) => answerId + 1);
        setChatBotAnswer(chatBotAnswer); //undefined);
        setShowAnswer(false);
    }

    const getNextAnswer = async () => {
        // past events
        const props: IChild = {
            type: ChildType.ANSWER,
            isDisabled: true,
            txt: chatBotAnswer ? chatBotAnswer.answerTitle : 'no answer',
            link: chatBotAnswer ? chatBotAnswer.answerLink : 'no link',
            hasMoreAnswers: true
        }
        setPastEvents((prevHistory) => [...prevHistory, props]);

        // next
        //const next: INextAnswer = await (await hook).getNextChatBotAnswer();
        const next: INextAnswer = await getNextChatBotAnswer();
        const { nextChatBotAnswer, hasMoreAnswers } = next;

        if (chatBotAnswer) {
            const history: IHistory = {
                questionKey: new QuestionKey(selectedQuestion!).questionKey,
                answerKey: chatBotAnswer.answerKey,
                userAction: nextChatBotAnswer ? USER_ANSWER_ACTION.NotFixed : USER_ANSWER_ACTION.NotClicked,
                created: {
                    nickName: authUser.nickName,
                    time: new Date()
                }
            }
            addHistory(history);
        }

        // salji gore
        // if (nextAnswer) {
        // 	addHistory(dbp, {
        // 		conversation,
        // 		client: authUser.nickName,
        // 		questionId: selectedQuestion!.id!,
        // 		answerId: nextAnswer.id!,
        // 		fixed: hasMoreAnswers ? undefined : false,
        // 		created: new Date()
        // 	})
        // }
        setHasMoreAnswers(hasMoreAnswers);
        //setAnswerId((answerId) => answerId + 1); PPP
        console.log('----->>>>', { nextChatBotAnswer })
        setChatBotAnswer(nextChatBotAnswer);
    }

    const NavigLink = (link: string) => {
        dispatch({ type: ActionTypes.RESET_CATEGORY_QUESTION_DONE })
        dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { categoryKey: null } });
            // new CategoryKey(parentCat).categoryKey*/ } });
        setTimeout(() => {
            navigate(link)
        }, 100);
    }

    const CatLevelComponent = (props: ICatLevel) => {
        const { level, catId, header, subCats, subCatIdSelected } = props;
        console.log('subCats', { subCats }, { subCatIdSelected })
        // const subCats2 = subCatIdSelected !== null
        //     ? subCats.filter(c => c.id === subCatIdSelected!)
        //     : subCats;
        const marginLeft = ((level - 1) * 10) + 'px';
        return (
            <Row
                className={`my-0 text-dark mx-1 border border-0 rounded-1`}
                id={catId!}
            >
                <Col xs={12} md={12} className="p-1">
                    <div className="d-flex justify-content-start align-items-center" style={{ marginLeft }}>
                        {/* <div className="w-75"> */}

                        {subCatIdSelected
                            ? <div className='text-center bg-light border p-1'>
                                {/* <FontAwesomeIcon icon={faFolder} size='sm' /> */}
                                <i className=''>{header}</i>
                            </div>
                            : <div className='py-1 px-1'>
                                {/* mx-auto */}
                                {/* d-flex */}
                                {/* <ListGroup as='ul' horizontal className="flex-wrap list-unstyled mx-auto"> */}
                                {subCats.map(({ id, title, link }: ICat) => (
                                    // <div key={id} className="px-1 text-start">
                                    // <li className="list-group-item" style={{flexBasis: '33%'}}>
                                    link
                                        ? <Form key={id} className='border border-0 m-1 rounded-1'>
                                            <ul className="list-unstyled text-start mb-0">
                                                <li className="list-group-item p-0 m-0">
                                                    {/* <NavLink to={link} className="px-2 text-decoration-none border">{title}</NavLink> */}
                                                    <Button
                                                        size="sm"
                                                        variant='link'
                                                        className='border py-0 text-decoration-none small'
                                                        onClick={() => NavigLink(link)}
                                                    >
                                                        {/* <FontAwesomeIcon icon={faFolder} size='sm' />&nbsp; */}
                                                        {title}
                                                    </Button>
                                                    {/* <a className="px-1 text-decoration-none" onClick={() => navigate(link)}>
                                                        {title}
                                                    </a> */}
                                                </li>
                                            </ul>
                                        </Form>
                                        : <Form key={id} className='border border-0 m-1 rounded-1'>
                                            <ul className="d-flex flex-wrap list-unstyled  mb-0">
                                                <li className="list-group-item border rounded-3 m-0">
                                                    <Button size="sm" variant='link' className='border py-0 text-decoration-none' onClick={() => onOptionChange(id, level, title)}>
                                                        <FontAwesomeIcon icon={faFolder} size='sm' />&nbsp;
                                                        {title}
                                                    </Button>
                                                </li>
                                            </ul>
                                        </Form>

                                    // <ListGroup.Item as='li' className='p-0 d-inline-block' > </ListGroup.Item>
                                ))}
                                {/* </ListGroup> */}
                            </div>
                        }
                    </div>
                </Col>
            </Row >
        )
    }

    const QuestionComponent = (props: IChild) => {
        const { isDisabled, txt } = props;
        return (
            <Row
                className={`my-1 bg-warning text-dark mx-1 border border-1 rounded-1`}
                id={autoSuggestId.toString()}
            >
                <Col xs={0} md={3} className='mb-1'>
                </Col>
                <Col xs={12} md={9}>
                    <div className="d-flex justify-content-start align-items-center">
                        {/* <div className="w-75"> */}
                        <img width="22" height="18" src={Q} alt="Question" className='me-1' />
                        {txt}
                        {/* </div> */}
                    </div>
                </Col>
            </Row>
        )
    }

    const AnswerComponent = (props: IChild) => {
        console.log('--------------------------------------AnswerComponent', props) 
        const { isDisabled, txt, link } = props;
        return (
            <div
                // id={answerId.toString()}   PPP
                id={chatBotAnswer?.answerKey.id}
                className={`${isDarkMode ? "dark" : "light"} mx-1 border border-0 rounded-1`}
            >
                <Row>
                    <Col xs={12} md={12} className={`${isDisabled ? 'secondary' : 'primary'} d-flex justify-content-start align-items-center`}>
                        <img width="22" height="18" src={A} alt="Answer" className='m-2' />
                        {/* contentEditable="true" aria-multiline="true" */}
                        <div className='bg-info text-light p-1'>
                            {txt} <br />
                            {link ? <a href={link} target="_blank" className="text-reset text-decoration-none fw-lighter fs-6" >{link}</a> : null}
                        </div>
                        {!isDisabled && chatBotAnswer &&
                            <div>
                                <Button
                                    size="sm"
                                    type="button"
                                    onClick={onAnswerFixed}
                                    disabled={!chatBotAnswer}
                                    className='align-middle ms-3 border border-1 rounded-1 py-0'
                                    variant="success"
                                >
                                    Fixed
                                </Button>
                                <Button
                                    size="sm"
                                    type="button"
                                    onClick={getNextAnswer}
                                    disabled={!chatBotAnswer}
                                    className='align-middle ms-2 border border-1 rounded-1 py-0'
                                    variant="primary"
                                >
                                    Haven't fixed
                                </Button>
                            </div>
                        }
                    </Col>
                </Row>
            </div>
        );
    };

    const AutoSuggestComponent = (props: IChild) => {
        const { isDisabled, txt } = props;
        return (
            <Row className={`my-1 ${isDarkMode ? "dark" : ""}`} key={autoSuggestId}>
                <Col xs={12} md={3} className='mb-1 text-start'>
                    <label className="text-info">Please enter the Question</label>
                </Col>
                <Col xs={0} md={12}>
                    {isDisabled &&
                        <label className="text-info">Please enter the Question</label>
                    }
                    {/* <div className="d-flex justify-content-start align-items-center"> */}
                    <div className="text-start">
                        <div className="w-75">
                            {isDisabled &&
                                <div>
                                    {txt}
                                </div>
                            }
                            {!isDisabled &&
                                <>
                                    {/* <div>{Date.now().toString()}</div> */}
                                    <AutoSuggestQuestions
                                        tekst={txt}
                                        onSelectQuestion={onSelectQuestion}
                                        allCategories={cats}
                                        searchQuestions={searchQuestions}
                                    />
                                </>
                            }
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }

    // const scrollToBottom = () => {
    //     scrollableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    // };

    return (
        <div className="pe-6 overflow-auto chat-bot-dlg">
            {/* <Button variant="primary" onClick={onHide}>
                Toggle static offcanvas
            </Button> */}

            {/* backdrop="static" */}
            <Offcanvas show={show} onHide={onHide} placement='end' scroll={true} backdrop={true} onEntering={onEntering}> {/* backdropClassName='chat-bot-dlg' */}
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                        Buddy
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Container id='container' fluid className='text-primary'> {/* align-items-center" */}
                        <Row className="m-0">
                            <Col>
                                <p className='p-0 m-0 fw-lighter'>For test, Select:</p>
                                <ul className="m-0">
                                    <li className='p-0 fw-lighter'>Sale</li>
                                    <li className='mx-2 fw-lighter'>Phones, TV, ...</li>
                                    <li className='mx-4 p-0 mb-4 fw-lighter'>Televisions, remote controllers, ...</li>
                                </ul>
                            </Col>
                        </Row>
                        <Row className="m-0 badge">
                            <Col className='border border-0 border-primary mx-1 text-white p-0'>
                                {/* <div className="d-inline"> */}
                                {/* <div key='Welcome'>
                                    <p><b>Welcome</b>, I am Buddy and I am here to help You</p>
                                </div> */}

                                <div className='border border-0 border-primary mx-0 text-white'>
                                    {catLevels.map((catLevel) =>
                                        <CatLevelComponent key={catLevel.level} {...catLevel} />
                                    )}
                                </div>

                                <div key='history' className='history'>
                                    {
                                        pastEvents.map(childProps => {
                                            switch (childProps.type) {
                                                case ChildType.AUTO_SUGGEST:
                                                    return <AutoSuggestComponent {...childProps} />;
                                                case ChildType.QUESTION:
                                                    return <QuestionComponent {...childProps} />;
                                                case ChildType.ANSWER:
                                                    return <AnswerComponent {...childProps} />;
                                                default:
                                                    return <div>unknown</div>
                                            }
                                        })
                                    }
                                </div>

                                {showAnswer &&
                                    <div key="answer">
                                        <AnswerComponent type={ChildType.ANSWER} isDisabled={false} txt={chatBotAnswer ? chatBotAnswer.answerTitle : 'no answers'} hasMoreAnswers={hasMoreAnswers} link={chatBotAnswer ? chatBotAnswer.answerLink : ''} />
                                    </div>
                                }

                                {catsSelected && !showAutoSuggest &&
                                    <Button
                                        key="newQuestion"
                                        variant="secondary"
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                            setAutoSuggestId(autoSuggestId + 1);
                                            setShowAutoSuggest(true);
                                        }}
                                        className='m-1 border border-1 rounded-1 py-0'
                                    >
                                        New Question
                                    </Button>
                                }

                                {showAutoSuggest &&
                                    <div className="pb-35">
                                        <AutoSuggestComponent type={ChildType.AUTO_SUGGEST} isDisabled={false} txt={autoSuggestionValue!} link={null} />
                                    </div>
                                }
                                {/* </div> */}
                                <div ref={scrollableRef}>dno dna</div>
                            </Col>
                        </Row>
                    </Container>
                </Offcanvas.Body>
            </Offcanvas>

        </div>
    )
};

export default ChatBotDlg;