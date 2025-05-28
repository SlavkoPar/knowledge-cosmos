import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes, ICategoryKey, IQuestionKey, ICategoryKeyExpanded } from "./types";

import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { CategoryProvider, useCategoryContext, useCategoryDispatch } from "./CategoryProvider";

import CategoryList from "categories/components/CategoryList";
import ViewCategory from "categories/components/ViewCategory";
import EditCategory from "categories/components/EditCategory";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";

import { initialCategory, initialQuestion } from "categories/CategoriesReducer";
import ModalAddQuestion from './ModalAddQuestion';
import AddCategory from './components/AddCategory';
import { AutoSuggestQuestions } from './AutoSuggestQuestions';

interface IProps {
    categoryId_questionId?: string;
    fromChatBotDlg?: string;
}

const Providered = ({ categoryId_questionId, fromChatBotDlg }: IProps) => {
    console.log("=============================================")
    console.log("Categories", categoryId_questionId)
    console.log("=============================================")
    const { state, reloadCategoryNode } = useCategoryContext();
    const { categoryKeyExpanded, categoryId_questionId_done, categoryNodeReLoading, categoryNodeLoaded } = state;

    const { setLastRouteVisited, searchQuestions } = useGlobalContext();
    const { isDarkMode, authUser, cats } = useGlobalState();

    const [modalShow, setModalShow] = useState(false);
    const handleClose = () => {
        setModalShow(false);
    }

    const [newQuestion, setNewQuestion] = useState({ ...initialQuestion });
    const [createQuestionError, setCreateQuestionError] = useState("");

    const dispatch = useCategoryDispatch();

    const onSelectQuestion = async (questionKey: IQuestionKey) => {
        //navigate(`/categories/${questionKey.partitionKey}_${questionKey.id}`)
        dispatch({ type: ActionTypes.SET_QUESTION_SELECTED, payload: { questionKey } })
    }

    const [catKeyExpanded, setCatKeyExpanded] = useState<ICategoryKeyExpanded>({
        partitionKey: null,
        id: null,
        questionId: categoryKeyExpanded ? categoryKeyExpanded.questionId : null
    })

    let tekst = '';

    useEffect(() => {
        (async () => {
            if (!categoryNodeReLoading) {
                if (categoryId_questionId) {
                    console.log('1) =>>>>>>>>>>>>>>>>>>> Categories calling categoryId_questionId:', categoryId_questionId);
                    console.log('2) =>>>>>>>>>>>>>>>>>>> Categories calling categoryId_questionId_done:', categoryId_questionId_done);
                    console.log('3) =>>>>>>>>>>>>>>>>>>> Categories calling categoryKeyExpanded:', categoryKeyExpanded);
                    if (categoryId_questionId === 'add_question') {
                        const sNewQuestion = localStorage.getItem('New_Question');
                        if (sNewQuestion) {
                            const q = JSON.parse(sNewQuestion);
                            setNewQuestion({ ...initialQuestion, categoryTitle: 'Select', ...q })
                            setModalShow(true);
                            localStorage.removeItem('New_Question');
                            return null;
                        }
                    }
                    else if (categoryId_questionId !== categoryId_questionId_done) { //} && !categoryNodeLoaded) {
                        const arr = categoryId_questionId.split('_');
                        const categoryId = arr[0];
                        const questionId = arr[1];
                        const keyExp = { partitionKey: null, id: categoryId, questionId }
                        setCatKeyExpanded(keyExp);
                        console.log('4) =>>>>>>>>>>>>>>>>>>> Categories calling keyExp:', keyExp);
                        await reloadCategoryNode(keyExp, fromChatBotDlg ?? 'false')
                            .then(() => { return null; });
                    }
                }
                else if (categoryKeyExpanded && !categoryNodeLoaded) {
                    console.log('999) =>>>>>>>>>>>>>> Categories calling reloadCategoryNode:', { categoryId_questionId, categoryKeyExpanded, categoryId_questionId_done });
                    await reloadCategoryNode(categoryKeyExpanded).then(() => { return null; });
                }
            }
        })()
    }, [categoryKeyExpanded, categoryNodeReLoading, categoryNodeLoaded, reloadCategoryNode, categoryId_questionId, categoryId_questionId_done])

    useEffect(() => {
        setLastRouteVisited(`/categories`);
    }, [setLastRouteVisited])

    if (categoryId_questionId !== 'add_question') {
        if (/*categoryKeyExpanded ||*/ (categoryId_questionId && categoryId_questionId !== categoryId_questionId_done)) {
            console.log("zzzzzz loading...", { categoryKeyExpanded, categoryId_questionId, categoryId_questionId_done })
            // return <div>`zzzzzz loading... "${categoryId_questionId}" "${categoryId_questionId_done}"`</div>
            return <div>loading...`</div>
        }
    }

    console.log('===>>> Categories !!!!!!!!!!!!!!!!!')
    if (!categoryNodeLoaded)
        return null

    return (
        <>
            <Container>
                <h6 style={{ color: 'rgb(13, 110, 253)', marginLeft: '30%' }}>Categories / Questions</h6>

                <Row className={`${isDarkMode ? "dark" : ""}`}>
                    <Col>
                        <div className="d-flex justify-content-start align-items-center">
                            <div className="w-75 my-1">
                                {/* <AutoSuggestQuestions
                                    tekst={tekst}
                                    onSelectQuestion={onSelectQuestion}
                                    allCats={cats}
                                    searchQuestions={searchQuestions}
                                /> */}
                            </div>
                        </div>
                    </Col>
                </Row>

                <Button variant="secondary" size="sm" type="button" style={{ padding: '1px 4px' }}
                    onClick={() => dispatch({
                        type: ActionTypes.ADD_SUB_CATEGORY,
                        payload: {
                            categoryKey: catKeyExpanded,
                            level: 1
                        }
                    })
                    }
                >
                    Add Category
                </Button>
                <Row className="my-1">
                    <Col xs={12} md={5}>
                        <div>
                            <CategoryList categoryKey={catKeyExpanded} level={0} title="root" 
                            />
                             {/* category={{ 
                                     ...initialCategory, 
                                     partitionKey: catKeyExpanded.partitionKey!,
                                     id: catKeyExpanded.id!
                              }}  */}
                        </div>
                    </Col>
                    <Col xs={0} md={7}>
                        {/* {store.mode === FORM_MODES.ADD && <Add category={category??initialCategory} />} */}
                        {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                        <div id='div-details' className="d-none d-md-block">
                            {state.mode === Mode.AddingCategory && <AddCategory categoryKey={catKeyExpanded} inLine={false} />}
                            {state.mode === Mode.ViewingCategory && <ViewCategory inLine={false} />}
                            {state.mode === Mode.EditingCategory && <EditCategory inLine={false} />}
                            {/* {state.mode === FORM_MODES.ADD_QUESTION && <AddQuestion category={null} />} */}
                            {/* TODO check if we set questionId everywhere */}
                            {catKeyExpanded.questionId && state.mode === Mode.ViewingQuestion &&
                                <ViewQuestion inLine={false} />
                            }
                            {catKeyExpanded.questionId && state.mode === Mode.EditingQuestion &&
                                <EditQuestion
                                    questionKey={{
                                        parentCategory: catKeyExpanded.id ?? undefined,
                                        partitionKey: catKeyExpanded.partitionKey,
                                        id: catKeyExpanded.questionId,
                                    }}
                                    inLine={false}
                                />
                            }
                        </div>
                    </Col>
                </Row>
            </Container>
            {modalShow &&
                <ModalAddQuestion
                    show={modalShow}
                    onHide={() => { setModalShow(false) }}
                    newQuestionRow={newQuestion}
                />
            }
        </>
    );
};

type Params = {
    categoryId_questionId?: string;
    fromChatBotDlg?: string;
};

const Categories = () => {
    let { categoryId_questionId, fromChatBotDlg } = useParams<Params>();

    if (categoryId_questionId && categoryId_questionId === 'categories')
        categoryId_questionId = undefined;

    if (categoryId_questionId) {
        const arr = categoryId_questionId!.split('_');
        console.assert(arr.length === 2, "expected 'categoryId_questionId'")
    }
    // const globalState = useGlobalState();
    // const { isAuthenticated } = globalState;

    // if (!isAuthenticated)
    //     return <div>categories loading...</div>;

    return (
        <CategoryProvider>
            <Providered categoryId_questionId={categoryId_questionId} fromChatBotDlg={fromChatBotDlg} />
        </CategoryProvider>
    )
}

export default Categories;

