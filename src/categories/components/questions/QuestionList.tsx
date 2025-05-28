import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { ICategory, IParentInfo, IQuestion, IQuestionKey, IQuestionRow } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import QuestionRow from "categories/components/questions/QuestionRow";

const QuestionList = ({ title, categoryKey, level }: IParentInfo) => {

  const { state, loadCategoryQuestions } = useCategoryContext();
  const { categories, categoryKeyExpanded, questionLoading, error } = state;

  const category: ICategory = categories.find(c => c.id === categoryKey.id)!;
  const { partitionKey, id, questionRows, numOfQuestions, hasMoreQuestions } = category;

  const { questionId } = categoryKeyExpanded!;

  console.assert(partitionKey === category.partitionKey);

  async function loadMore() {
    try {
      const parentInfo: IParentInfo = {
        categoryKey,
        startCursor: questionRows.length,
        includeQuestionId: questionId ?? null
      }
      console.log('loadMore', { parentInfo })
      await loadCategoryQuestions(parentInfo);
    }
    catch (error) {
    }
    finally {
    }
  }

  useEffect(() => {
    if (numOfQuestions > 0) { // TODO
      loadMore();
    }
  }, [numOfQuestions])

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: questionLoading,
    hasNextPage: hasMoreQuestions!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  
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
        {questionRows.length === 0 &&
          <label>No questions</label>
        }
        {questionRows.map((questionRow: IQuestionRow) => {
          //question.partitionKey = partitionKey;
          return <QuestionRow
            key={questionRow.id}
            questionRow={questionRow}
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
