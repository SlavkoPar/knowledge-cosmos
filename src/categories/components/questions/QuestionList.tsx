import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IParentInfo, IQuestion } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalState } from "global/GlobalProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import QuestionRow from "categories/components/questions/QuestionRow";
import useFetchWithMsal from "hooks/useFetchWithMsal";
import { protectedResources } from "authConfig";

const QuestionList = ({ title, categoryKey, level }: IParentInfo) => {
  const pageSize = 100;
  const { canEdit } = useGlobalState();

  const { state, loadCategoryQuestions, editQuestion, viewQuestion } = useCategoryContext();
  const { categories,  questionId, questionLoading, error } = state;

  const category = categories.find(c => c.id === categoryKey.id)!
  const { partitionKey, questions, numOfQuestions, hasMoreQuestions } = category;

  //error: msalError1, 
  const { execute: readExecute } = useFetchWithMsal("", {
    scopes: protectedResources.KnowledgeAPI.scopes.read,
  });

  // error: msalError2, 
  const { execute: writeExecute } = useFetchWithMsal("", {
    scopes: protectedResources.KnowledgeAPI.scopes.write,
  });

  async function loadMore() {
    try {
      const parentInfo: IParentInfo = {
        categoryKey,
        startCursor: questions.length,
        includeQuestionId: questionId ?? null
      }
      console.log('loadMore', {parentInfo})
      await loadCategoryQuestions(parentInfo);
    }
    catch (error) {
    }
    finally {
    }
  }

  useEffect(() => {
    if (numOfQuestions > 0) // TODO && questions.length === 0)
      loadMore();
  }, [])

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: questionLoading,
    hasNextPage: hasMoreQuestions!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  useEffect(() => {
    (async () => {
      if (categoryKey != null) {
        //if (categoryId === categoryKey.id && questionId) {
        if (categoryKey && questionId) {
          if (canEdit) {
            await editQuestion({ partitionKey: categoryKey.id, id: questionId })
          }
          else
            await viewQuestion({ partitionKey: categoryKey.id, id: questionId })
        }
      }
		})()
  }, [editQuestion, viewQuestion, categoryKey, questionId, canEdit]); //, questionLoading

  // console.log('QuestionList render', questions, questions.length)

  // if (questionLoading)
  //   return <div> ... loading</div>

  return (
    <div
      ref={rootRef}
      className="ms-2" // border border-3 border-info"
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    >
      <List>
        {questions.length === 0 &&
          <label>No questions</label>
        }
        {questions.map((question: IQuestion) => {
          //question.partitionKey = partitionKey;
          return <QuestionRow
              key={question.id}
              question={question}
              categoryInAdding={category!.inAdding}
            />
        })}
        {hasMoreQuestions && (
          <ListItem ref={infiniteRef}>
            <Loading />
          </ListItem>
        )}
      </List>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default QuestionList;
