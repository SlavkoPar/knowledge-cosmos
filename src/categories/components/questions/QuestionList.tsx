import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IParentInfo, IQuestion, IAssignedAnswer } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalState } from "global/GlobalProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import QuestionRow from "categories/components/questions/QuestionRow";

const QuestionList = ({ title, partitionKey, parentCategory, level }: IParentInfo) => {
  const pageSize = 100;
  const { canEdit } = useGlobalState();

  const { state, loadCategoryQuestions, editQuestion, viewQuestion } = useCategoryContext();
  const { parentNodes, categories, questionLoading, error } = state;
  const { categoryId, questionId } = parentNodes!;

  const category = categories.find(c => c.id === parentCategory)!
  const { questions, numOfQuestions, hasMoreQuestions } = category;

  async function loadMore() {
    try {
      const parentInfo: IParentInfo = {
        partitionKey,
        parentCategory,
        startCursor: questions.length,
        includeQuestionId: parentNodes.questionId ?? null
        //includeQuestionId: parentNodes.questionId ? parseInt(parentNodes.questionId) : null
      }
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
    if (categoryId != null) {
      if (categoryId === parentCategory! && questionId) {
        if (canEdit)
          editQuestion({ parentCategory, id: questionId })
        else
          viewQuestion({ parentCategory, id: questionId })
      }
    }
  }, [viewQuestion, parentCategory, categoryId, questionId, canEdit]);

  // console.log('QuestionList render', questions, questions.length)

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
          return <ListItem key={question.id}>
            <QuestionRow
              question={question}
              categoryInAdding={category!.inAdding}
            />
          </ListItem>
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
