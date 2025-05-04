import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IParentInfo, IAnswer, IAssignedAnswer } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import { useGlobalState } from "global/GlobalProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import AnswerRow from "groups/components/answers/AnswerRow";

const AnswerList = ({ title, groupKey, level }: IParentInfo) => {
  const pageSize = 100;
  const { canEdit } = useGlobalState();

  const { state, loadGroupAnswers, editAnswer, viewAnswer } = useGroupContext();
  const { groups, answerLoading, error, answerId } = state;

  const group = groups.find(c => c.id === groupKey.id)!
  const { partitionKey, answers, numOfAnswers, hasMoreAnswers } = group;

  /*
  const { execute: readExecute } = useFetchWithMsal("", {
    scopes: protectedResources.KnowledgeAPI.scopes.read,
  });

  const { execute: writeExecute } = useFetchWithMsal("", {
    scopes: protectedResources.KnowledgeAPI.scopes.write,
  });
  */

  async function loadMore() {
    try {
      const parentInfo: IParentInfo = {
        //execute: readExecute,
        groupKey,
        startCursor: answers.length,
        includeAnswerId: answerId ?? null
      }
      await loadGroupAnswers(parentInfo);
    }
    catch (error) {
    }
    finally {
    }
  }

  useEffect(() => {
    if (numOfAnswers > 0) // TODO && answers.length === 0)
      loadMore();
  }, [])

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: answerLoading,
    hasNextPage: hasMoreAnswers!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  useEffect(() => {
    if (groupKey != null) {
      //if (groupId === groupKey.id && answerId) {
      if (groupKey && answerId) {
        if (canEdit)
          editAnswer({ partitionKey: groupKey.id, id: answerId })
        else
          viewAnswer({ partitionKey: groupKey.id, id: answerId })
      }
    }
  }, [viewAnswer, groupKey, answerId, canEdit]);

  // console.log('AnswerList render', answers, answers.length)

  if (answerLoading)
    return <div> ... loading</div>

  return (
    <div
      ref={rootRef}
      className="ms-2" // border border-3 border-info"
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    >
      <List>
        {answers.length === 0 &&
          <label>No answers</label>
        }
        {answers.map((answer: IAnswer) => {
          //answer.partitionKey = partitionKey;
          return <ListItem key={answer.id}>
            <AnswerRow
              answer={answer}
              groupInAdding={group!.inAdding}
            />
          </ListItem>
        })}
        {hasMoreAnswers && (
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
