import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes, ICategoryKey } from "./types";

import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { CategoryProvider, useCategoryContext, useCategoryDispatch } from "./CategoryProvider";

import CategoryList from "categories/components/CategoryList";
import ViewCategory from "categories/components/ViewCategory";
import EditCategory from "categories/components/EditCategory";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";

import { initialQuestion } from "categories/CategoriesReducer";
import ModalAddQuestion from './ModalAddQuestion';
import useFetchWithMsal from 'hooks/useFetchWithMsal';
import { protectedResources } from 'authConfig';
import AddCategory from './components/AddCategory';

interface IProps {
    categoryId_questionId: string | undefined
}

const Providered = ({ categoryId_questionId }: IProps) => {
    const { state, reloadCategoryNode } = useCategoryContext();
    const { categoryKeyExpanded, categoryId_questionId_done, questionId, categoryNodeLoaded } = state;
    console.log('Providered', { categoryKeyExpanded, categoryNodeLoaded })

    // { error, execute }
    const { execute } = useFetchWithMsal("", {
        scopes: protectedResources.KnowledgeAPI.scopes.read,
    });
    const { isDarkMode, authUser } = useGlobalState();

    const [modalShow, setModalShow] = useState(false);
    const handleClose = () => {
        setModalShow(false);
    }

    const [newQuestion, setNewQuestion] = useState({ ...initialQuestion });
    const [createQuestionError, setCreateQuestionError] = useState("");

    const dispatch = useCategoryDispatch();
    const [categoryKey] = useState<ICategoryKey>({ partitionKey: 'null', id: 'null' })

    useEffect(() => {
        (async () => {
            if (categoryId_questionId) {
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
                    console.log('1) ===>>> Categories calling reloadCategoryNode:', { categoryId_questionId, categoryKeyExpanded, categoryId_questionId_done });
                    const arr = categoryId_questionId.split('_');
                    const categoryId = arr[0];
                    const questionId = arr[1];
                    await reloadCategoryNode(execute, { partitionKey: '', id: categoryId }, questionId).then(() => { return null; });
                }
            }
            else if (categoryKeyExpanded && !categoryNodeLoaded) {
                console.log('2) ===>>> Categories calling reloadCategoryNode:', { categoryId_questionId, categoryKeyExpanded, categoryId_questionId_done });
                await reloadCategoryNode(execute, categoryKeyExpanded, questionId).then(() => { return null; });
            }
        })()
    }, [categoryKeyExpanded, categoryNodeLoaded, reloadCategoryNode, categoryId_questionId, categoryId_questionId_done])

    if (categoryId_questionId !== 'add_question') {
        if (/*categoryKeyExpanded ||*/ (categoryId_questionId && categoryId_questionId !== categoryId_questionId_done)) {
            console.log("zzzzzz loading...", { categoryKeyExpanded, categoryId_questionId, categoryId_questionId_done })
            return <div>`zzzzzz loading... "${categoryId_questionId}" "${categoryId_questionId_done}"`</div>
        }
    }

    console.log('===>>> Categories !!!!!!!!!!!!!!!!!')
    if (!categoryNodeLoaded)
        return null

    return (
        <>
            <Container>
                <h6 style={{ color: 'rgb(13, 110, 253)', marginLeft: '30%' }}>Categories / Questions</h6>
                <Button variant="secondary" size="sm" type="button" style={{padding: '1px 4px'}}
                    onClick={() => dispatch({
                        type: ActionTypes.ADD_SUB_CATEGORY,
                        payload: {
                            categoryKey,
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
                            <CategoryList categoryKey={categoryKey} level={0} title="root" />
                        </div>
                    </Col>
                    <Col xs={0} md={7}>
                        {/* {store.mode === FORM_MODES.ADD && <Add category={category??initialCategory} />} */}
                        {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                        <div id='div-details' className="d-none d-md-block">
                            {state.mode === Mode.AddingCategory && <AddCategory categoryKey={categoryKey} inLine={false} />}
                            {state.mode === Mode.ViewingCategory && <ViewCategory inLine={false} />}
                            {state.mode === Mode.EditingCategory && <EditCategory inLine={false} />}
                            {/* {state.mode === FORM_MODES.ADD_QUESTION && <AddQuestion category={null} />} */}
                             {/* TODO check if we set questionId everywhere */}
                            {questionId && state.mode === Mode.ViewingQuestion && <ViewQuestion inLine={false} />}
                            {questionId && state.mode === Mode.EditingQuestion && <EditQuestion inLine={false} />}
                        </div>
                    </Col>
                </Row>
            </Container>
            {modalShow &&
                <ModalAddQuestion
                    show={modalShow}
                    onHide={() => { setModalShow(false) }}
                    newQuestion={newQuestion}
                />
            }
        </>
    );
};

type Params = {
    categoryId_questionId?: string;
};

const Categories = () => {
    let { categoryId_questionId } = useParams<Params>();

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
            <Providered categoryId_questionId={categoryId_questionId} />
        </CategoryProvider>
    )
}

export default Categories;

