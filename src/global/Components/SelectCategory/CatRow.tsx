import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { CatsActionTypes, CatsActions } from "global/types";
import { ICategory } from 'categories/types'

import CatList from "global/Components/SelectCategory/CatList";

interface ICatRow {
    category: ICategory;
    dispatch: React.Dispatch<CatsActions>;
    setParentCategory: (category: ICategory) => void;
}

const CatRow = ({ category, dispatch, setParentCategory }: ICatRow) => {
    const { id, title, level, isExpanded } = category;

    const { isDarkMode, variant, bg } = useGlobalState();

    const expand = (_id: IDBValidKey) => {
        dispatch({ type: CatsActionTypes.SET_EXPANDED, payload: { id, expanding: !isExpanded } });
    }

    const onSelectCategory = (category: ICategory) => {
        // Load data from server and reinitialize category
        // viewCategory(id);
        setParentCategory(category);
    }

    const Row1 =
        <div className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={(e) => {
                    expand(id!);
                    e.stopPropagation();
                }}
                title="Expand"
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none`}
                title={id}
                onClick={() => onSelectCategory(category)}
            >
                {title}
            </Button>
        </div>

    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {Row1}
            </ListGroup.Item>

            {isExpanded && // Row2
                <ListGroup.Item
                    className="py-0 px-0"
                    variant={"primary"}
                    as="li"
                >
                    <CatList
                        level={level + 1}
                        parentCategory={id}
                        setParentCategory={setParentCategory}
                    />
                </ListGroup.Item>
            }

        </>
    );
};

export default CatRow;
