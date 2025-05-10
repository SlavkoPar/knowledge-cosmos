import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEnvelope, faRemove } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Modal } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { useHover } from 'hooks/useHover';
import { useCategoryContext } from "categories/CategoryProvider";
import { formatDate } from 'common/utilities'
import React, { useState } from "react";
import { IRelatedFilter } from 'categories/types';

interface IProps {
    relatedFilter: IRelatedFilter,
    unAssignFilter: (relatedFilter: IRelatedFilter) => void
}

const RelatedFilter = ({ relatedFilter, unAssignFilter }: IProps) => {

    const { questionKey, filter, created } = relatedFilter;

    const { time, nickName } = created!;

    const rowTitle = `Created by: ${nickName}, ${formatDate(new Date(time))}`

    const { authUser, canEdit, isDarkMode, variant, bg } = useGlobalState();
    const { state } = useCategoryContext();

    const alreadyAdding = false;

    const del = () => {
        unAssignFilter(relatedFilter);
    };

    const edit = (id: number) => {
        // Load data from server and reinitialize answer
        //editAnswer(id);
    }

    const onSelectAnswer = (filter: string) => {
        // Load data from server and reinitialize answer
        //viewAnswer(id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-info">
            <Button
                variant='link'
                size="sm"
                className="py-0 mx-1 text-decoration-none text-info text-wrap"
                title={rowTitle}
                onClick={() => onSelectAnswer(filter)}
                disabled={alreadyAdding}
            >
                {filter}
            </Button>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered && !isDisabled &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1 text-info"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            } */}
        </div>

    return (
        <ListGroup.Item
            key={filter}
            variant={"info"}
            className="py-1 px-1"
            as="li"
        >
            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
            {Row1}
        </ListGroup.Item>

    );
};

export default RelatedFilter;
