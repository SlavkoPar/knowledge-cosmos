import React, { useEffect, useState, JSX } from 'react';
import { useParams } from 'react-router-dom' // useRouteMatch

import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import CatList from 'global/Components/SelectCategory/CatList';
import { ICategory, IQuestion, IQuestionKey } from 'categories/types';
import { ICat } from 'global/types';
import AssignedAnswersChatBot from 'global/ChatBotPage/AssignedAnswersChatBot';
import { INewQuestion, INextAnswer, useAI } from './hooks/useAI'
import { IAnswer } from 'groups/types';
//import AnswerList from 'groups/components/answers/AnswerList';

import Q from 'assets/Q.png';
import A from 'assets/A.png';

type ChatBotParams = {
	source: string;
	tekst: string;
	email?: string;
};

const ChatBotPage: React.FC = () => {

	let { source, tekst, email } = useParams<ChatBotParams>();

	// TODO do we need this?
	// const globalState = useGlobalState();
	// const {isAuthenticated} = globalState;

	// if (!isAuthenticated)
	//     return <div>loading...</div>;

	const hook = useAI([]);

	const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | null>(null);

	const [autoSuggestId, setAutoSuggestId] = useState<number>(1);
	const [answerId, setAnswerId] = useState<number>(1);
	const [showAnswer, setShowAnswer] = useState(false);
	const [answer, setAnswer] = useState<IAnswer | undefined>(undefined);
	const [hasMoreAnswers, setHasMoreAnswers] = useState<boolean>(false);
	const [conversation, setConversation] = useState<number | undefined>(undefined);

	const { loadCats, getCatsByKind, getMaxConversation, addHistory, getAnswersRated, searchQuestions } = useGlobalContext();
	const { dbp, canEdit, authUser, isDarkMode, variant, bg, cats, catsLoaded } = useGlobalState();

	const setParentCategory = (cat: ICategory) => {
		alert(cat.title)
	}

	const [showUsage, setShowUsage] = useState(false);
	const [catsSelected, setCatsSelected] = useState(false);
	const [showAutoSuggest, setShowAutoSuggest] = useState(false);

	const [catsOptions, setCatOptions] = useState<ICat[]>([]);
	const [catsOptionsSel, setCatsOptionsSel] = useState<Map<string, boolean>>(new Map<string, boolean>());

	const [catsUsage, setCatUsage] = useState<ICat[]>([]);
	const [catsUsageSel, setCatUsageSel] = useState<Map<string, boolean>>(new Map<string, boolean>());


	const [pastEvents, setPastEvents] = useState<IChild[]>([]);

	enum ChildType {
		AUTO_SUGGEST,
		QUESTION,
		ANSWER
	}

	interface IChild {
		type: ChildType;
		isDisabled: boolean;
		txt: string,
		hasMoreAnswers?: boolean
	}
	// const deca: JSX.Element[] = [];
	useEffect(() => {
		(async () => {
			//await loadCats();
		})()
	}, [])

	useEffect(() => {
		(async () => {
			setCatOptions(await getCatsByKind(2));
			setCatUsage(await getCatsByKind(3));
		})()
	}, [catsLoaded])


	if (!catsLoaded || catsOptions.length === 0)
		return <div>loading...</div>

	const onOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name as any;
		setShowUsage(true)
		// setCatOptions((prevState) => ({ 
		// 	stateName: prevState.stateName + 1 
		// }))
		// this.setState({
		// 	 [name]: value
		// });
	}

	//const onUsageChange = ({ target: { value } }) => {
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
	const onSelectQuestion = async (questionKey: IQuestionKey) => {
		// navigate(`/knowledge-cosmos/categories/${categoryId}_${questionId.toString()}`)
		// const question = await getQuestion(questionId);

		// salji kasnije kad klikne na Fixed
		if (answer) {
			addHistory(dbp, {
				conversation,
				client: authUser.nickName,
				questionId: selectedQuestion!.id!,
				answerId: answer.id!,
				fixed: undefined,
				created: new Date()
			})
		}

		let conv = conversation;
		if (!conversation) {
			const last = await getMaxConversation(dbp!);
			conv = last + 1
			setConversation(conv);
		}

		if (answer) {
			const props: IChild = {
				type: ChildType.ANSWER,
				isDisabled: true,
				txt: answer.title,
			}
			setPastEvents((prevEvents) => [...prevEvents, props]);
		}
		const res: INewQuestion = await (await hook).setNewQuestion(questionKey);
		const { question, firstAnswer, hasMoreAnswers } = res; // as unknown as INewQuestion;
		const answersRated = await getAnswersRated(dbp, question!.id!);
		console.log({ answersRated });
		if (question) {
			const props: IChild = {
				type: ChildType.QUESTION,
				isDisabled: true,
				txt: question.title,
			}
			setPastEvents((prevEvents) => [...prevEvents, props]);
		}

		setAutoSuggestId((autoSuggestId) => autoSuggestId + 1);
		setShowAutoSuggest(false);
		setSelectedQuestion(question);
		setShowAnswer(true);
		setHasMoreAnswers(hasMoreAnswers);
		setAnswerId((answerId) => answerId + 1);
		setAnswer(firstAnswer);
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


	const answerFixed = async () => {
		const props: IChild = {
			type: ChildType.ANSWER,
			isDisabled: true,
			txt: answer ? answer.title : 'no answers',
			hasMoreAnswers: true
		}
		setPastEvents((prevHistory) => [...prevHistory, props]);

		addHistory(dbp, {
			conversation,
			client: authUser.nickName,
			questionId: selectedQuestion!.id!,
			answerId: answer!.id!,
			fixed: true,
			created: new Date()
		})
		//
		// TODO logic 
		//

		setHasMoreAnswers(false);
		//setAnswerId((answerId) => answerId + 1);
		setAnswer(undefined);
		setShowAnswer(false);
	}

	const getNextAnswer = async () => {
		// past events
		const props: IChild = {
			type: ChildType.ANSWER,
			isDisabled: true,
			txt: answer ? answer.title : 'no answers',
			hasMoreAnswers: true
		}
		setPastEvents((prevHistory) => [...prevHistory, props]);

		// next
		const next: INextAnswer = await (await hook).getNextAnswer();
		const { nextAnswer, hasMoreAnswers } = next;

		if (answer) {
			addHistory(dbp, {
				conversation,
				client: authUser.nickName,
				questionId: selectedQuestion!.id!,
				answerId: answer.id!,
				fixed: nextAnswer ? false : undefined,
				created: new Date()
			})
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
		setAnswerId((answerId) => answerId + 1);
		setAnswer(nextAnswer);
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
		const { isDisabled, txt } = props;
		return (
			<div
				id={answerId.toString()}
				className={`${isDarkMode ? "dark" : "light"} mx-6 border border-1 rounded-1`}
			>
				<Row>
					<Col xs={12} md={12} className={`${isDisabled ? 'secondary' : 'primary'} d-flex justify-content-start align-items-center`}>
						<img width="22" height="18" src={A} alt="Answer" className='m-2' />
						{/* contentEditable="true" aria-multiline="true" */}
						<div>
							{txt}
						</div>
						{!isDisabled && answer &&
							<div>
								<Button
									size="sm"
									type="button"
									onClick={answerFixed}
									disabled={!hasMoreAnswers}
									className='align-middle ms-3 border border-1 rounded-1 py-0'
									variant="success"
								>
									Fixed
								</Button>
								<Button
									size="sm"
									type="button"
									onClick={getNextAnswer}
									disabled={!hasMoreAnswers}
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
				<Col xs={12} md={3} className='mb-1'>
					<label className="text-info">Please enter the Question</label>
					{/* <CatList
				parentCategory={'null'}
				level={1}
				setParentCategory={setParentCategory}
			/> */}
				</Col>
				<Col xs={0} md={12}>
					{isDisabled &&
						<label className="text-info">Please enter the Question</label>
					}
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75">
							{isDisabled &&
								<div>
									{txt}
								</div>
							}
							{!isDisabled &&
								<AutoSuggestQuestions
									tekst={tekst}
									onSelectQuestion={onSelectQuestion}
									allCategories={cats}
									searchQuestions={searchQuestions}
								/>
							}
						</div>
					</div>
				</Col>
			</Row>
		)
	}

	return (
		<Container id='container' fluid className='text-info'> {/* align-items-center" */}
			<div key='Welcome'>
				<p><b>Welcome</b>, I am Buddy and I am here to help You</p>
			</div>

			<Form key='options' className='text-center border border-1 m-1 rounded-1'>
				<div className='text-center'>
					Select Options
				</div>
				<div className='text-center'>
					{/* <ListGroup horizontal> */}
					{catsOptions.map(({ id: id, title: title }: ICat) => (
						// <ListGroup.Item>
						<Form.Check // prettier-ignore
							id={id}
							key={id}
							label={title}
							name="opcije"
							type='checkbox'
							inline
							className=''
							onChange={onOptionChange}
						/>
						// </ListGroup.Item>
					))}
					{/* </ListGroup> */}
				</div>
			</Form>

			{showUsage &&
				<Form key="usage" className='text-center border border-1 m-1 rounded-1'>
					<div className='text-center'>
						Select services for which you need support
					</div>
					<div className='text-center'>
						{catsUsage.map(({ id: id, title: title }: ICat) => (
							<Form.Check // prettier-ignore
								id={id}
								label={title}
								name="usluge"
								type='checkbox'
								inline
								className=''
								onChange={onUsageChange}
							/>
						))}
					</div>
				</Form>
			}

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

			{/* {selectedQuestion &&
				<div>
					<QuestionComponent type={ChildType.QUESTION} isDisabled={true} txt={selectedQuestion.title} hasMoreAnswers={hasMoreAnswers} />
				</div>
			} */}

			{showAnswer &&
				<div key="answer">
					<AnswerComponent type={ChildType.ANSWER} isDisabled={false} txt={answer ? answer.title : 'no answers'} hasMoreAnswers={hasMoreAnswers} />
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

			{/* {showAutoSuggest && <AutoSuggestComponent type={ChildType.AUTO_SUGGEST} isDisabled={false} txt={tekst!} />} */}
		</Container>
	);
}

export default ChatBotPage

