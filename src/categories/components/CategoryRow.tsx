import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faFolder } from '@fortawesome/free-solid-svg-icons'
import QPlus from 'assets/QPlus.png';

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, ICategoryInfo, ICategoryKey, ICategoryKeyExpanded, Mode } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'hooks/useHover';
import { ICategory } from 'categories/types'

import CategoryList from "categories/components/CategoryList";
import EditCategory from "categories/components/EditCategory";
import ViewCategory from "categories/components/ViewCategory";
import QuestionList from './questions/QuestionList';

const CategoryRow = ({ category, questionId }: { category: ICategory, questionId: string|null }) => {
    
    const { partitionKey, id, title, level, hasSubCategories, subCategories,
            numOfQuestions, questionRows, inAdding,  isExpanded, isSelected } = category;
    const [categoryKey] = useState<ICategoryKey>({ partitionKey, id }); // otherwise reloads
    const [categoryKeyExpanded] = useState<ICategoryKeyExpanded>({ partitionKey, id, questionId }); // otherwise reloads

    const { canEdit, isDarkMode, variant, bg, authUser } = useGlobalState();

    const { state, viewCategory, editCategory, deleteCategory, expandCategory, collapseCategory } = useCategoryContext();
    //const { mode, categoryInViewingOrEditing } = state;
    const { mode } = state;

    //const bold = categoryInViewingOrEditing && categoryInViewingOrEditing.id === id;

    const dispatch = useCategoryDispatch();

    const alreadyAdding = mode === Mode.AddingCategory;
    // TODO proveri ovo
    const showQuestions = (isExpanded && numOfQuestions > 0) // || questions.find(q => q.inAdding) // && !questions.find(q => q.inAdding); // We don't have questions loaded
    
    const del = () => {
        category.modified = {
            time: new Date(),
            nickName: authUser.nickName
        }
        deleteCategory(category);
    };

    const handleExpandClick = async () => {
        if (isExpanded)
            await collapseCategory(categoryKey);
        else
            await expandCategory(categoryKey, questionId ?? 'null');
    }

   
    const edit = async () => {
        // Load data from server and reinitialize category
        await editCategory(categoryKey, questionId ?? 'null');
    }

    const onSelectCategory = async () => {
        if (canEdit)
            await editCategory(categoryKey, questionId ?? 'null');
        else
            await viewCategory(categoryKey, questionId ?? 'null');
    }

    useEffect(() => {
        if (!isExpanded && isSelected) {
            onSelectCategory()
        }
    }, [isExpanded, isSelected, onSelectCategory])

    const [hoverRef, hoverProps] = useHover();

    {/* <ListGroup horizontal> */ }
    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-primary category-row ">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1  bg-light"
                onClick={( e) => { handleExpandClick(); e.stopPropagation()} }
                title="Expand"
                disabled={alreadyAdding || (!hasSubCategories && numOfQuestions === 0)}
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1  bg-light"
                // onClick={expand}
                title="Expand"
                disabled= {true} //{alreadyAdding || (!hasSubCategories && numOfQuestions === 0)}
            >
                <FontAwesomeIcon icon={faFolder} size='sm' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none bg-light  ${isSelected ? 'fw-bold' : ''}`}
                title={id}
                onClick={onSelectCategory}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={numOfQuestions === 0 ? 'd-none' : 'd-inline'}>
                {numOfQuestions}Q
                {/* <FontAwesomeIcon icon={faQuestion} size='sm' /> */}
                {/* <img width="22" height="18" src={Q} alt="Question" /> */}
            </Badge>

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <>
                    <Button variant='link' size="sm" className="ms-1 py-0 px-0"
                        //onClick={() => { dispatch({ type: ActionTypes.EDIT, category }) }}>
                        onClick={() => edit()}
                    >
                        <FontAwesomeIcon icon={faEdit} size='lg' />
                    </Button>
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-primary float-end"
                        title="Add SubCategory"
                        onClick={() => {
                            dispatch({
                                type: ActionTypes.ADD_SUB_CATEGORY,
                                payload: {
                                    categoryKey,
                                    level: category.level + 1
                                }
                            })
                            // if (!isExpanded)
                            //     dispatch({ type: ActionTypes.SET_EXPANDED, payload: { categoryKey } });
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} size='lg' />
                    </Button>
                </>
            }

            {/* TODO what about archive questions  numOfQuestions === 0 &&*/}
            {canEdit && !alreadyAdding && hoverProps.isHovered && !hasSubCategories &&
                <div className="position-absolute d-flex align-items-center top-0 end-0">
                    <Button
                        variant='link'
                        size="sm"
                        className="py-0 mx-1 text-secondary float-end"
                        title="Add Question"
                        onClick={async () => {
                            const categoryInfo: ICategoryInfo = { categoryKey: {partitionKey, id: category.id}, level: category.level }
                            if (!isExpanded) {
                                await dispatch({ type: ActionTypes.SET_EXPANDED, payload: { categoryKey } });
                            }
                            await dispatch({ type: ActionTypes.ADD_QUESTION, payload: { categoryInfo } });
                        }}
                    >
                        <img width="22" height="18" src={QPlus} alt="Add Question" />
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

    // if (category.level !== 1)
    //     return (<div>CategoryRow {category.id}</div>)

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {inAdding && mode === Mode.AddingCategory ? (
                    // <AddCategory categoryKey={categoryKey} inLine={true} />
                    <div />
                )
                    : (mode === Mode.EditingCategory || mode === Mode.ViewingCategory) ? (
                        <>
                            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                            <div id='divInLine' className="ms-0 d-md-none w-100">
                                {mode === Mode.EditingCategory && <EditCategory inLine={false} />}
                                {mode === Mode.ViewingCategory && <ViewCategory inLine={false} />}
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

            {state.error && state.whichRowId == id && <div className="text-danger">{state.error.message}</div>}

            {/* !inAdding && */}
            {(isExpanded || inAdding) && // Row2
                <ListGroup.Item
                    className="py-0 px-0 border-0 border-warning border-bottom-0" // border border-3 "
                    variant={"primary"}
                    as="li"
                >
                    {isExpanded &&
                        <>
                            { hasSubCategories &&
                                <CategoryList level={level + 1} categoryKey={categoryKey} title={title} isExpanded={isExpanded} subCategories={subCategories} />
                            }
                            { showQuestions &&
                                <QuestionList level={level + 1} categoryKey={categoryKey} title={title} />
                            }
                        </>
                    }

                </ListGroup.Item>
            }
        </>
    );
};

export default CategoryRow;
