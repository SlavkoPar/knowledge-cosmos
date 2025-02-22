import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IParentInfo, IAnswer } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import { useGlobalState } from "global/GlobalProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import AnswerRow from "groups/components/answers/AnswerRow";

const AnswerList = ({ title, parentGroup, level }: IParentInfo) => {

  const pageSize = 100;
  const { canEdit } = useGlobalState();

  const { state, loadGroupAnswers, editAnswer, viewAnswer } = useGroupContext();
  const { parentNodes, groups, answerLoading, error } = state;
  const { groupId, answerId } = parentNodes!;

  const group = groups.find(c => c.id === parentGroup)!
  const { answers, numOfAnswers, hasMore } = group;

  async function loadMore() {
    try {
      const includeAnswerId = parentNodes.answerId ? parseInt(parentNodes.answerId) : undefined;
      await loadGroupAnswers({ parentGroup, startCursor: answers.length, level: 0, includeAnswerId });
    }
    catch (error_) {
    }
    finally {
    }
  }

  useEffect(() => {
    if (numOfAnswers > 0 && answers.length === 0)
      loadMore();
  }, [])

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: answerLoading,
    hasNextPage: hasMore!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  useEffect(() => {
    if (groupId != null) {
      if (groupId === parentGroup!.toString() && answerId) {
        if (canEdit)
          editAnswer(parseInt(answerId))
        else
          viewAnswer(parseInt(answerId))
      }
    }
  }, [viewAnswer, parentGroup, groupId, answerId, canEdit]);

  // console.log('AnswerList render', answers, level)

  return (
    <div
      ref={rootRef}
      className="ms-2 border"
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    >
      <List>
        {answers.length === 0 &&
          <div>No answers</div>
        }
        {answers.map((answer: IAnswer) => {
          return <ListItem key={answer.id}>
            <AnswerRow
              answer={answer}
              groupInAdding={group!.inAdding}
            />
          </ListItem>
        })}
        {hasMore && (
          <ListItem ref={infiniteRef}>
            <Loading />
          </ListItem>
        )}
      </List>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default AnswerList;
