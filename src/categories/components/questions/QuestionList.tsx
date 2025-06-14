import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { ICategory, IParentInfo, IQuestion, IQuestionKey, IQuestionRow } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import QuestionRow from "categories/components/questions/QuestionRow";

const QuestionList = ({ title, categoryKey, level }: IParentInfo) => {

  const { state, loadCategoryQuestions } = useCategoryContext();
  const { categories, categoryKeyExpanded, questionLoading, error } = state;
  const { questionId } = categoryKeyExpanded!;

  let numOfQuestions = 0;
  let questionRows: IQuestionRow[] = [];
  let hasMoreQuestions = false;
  const category: ICategory = categories.find(c => c.id === categoryKey.id)!;
  if (category) { // CLEAN_SUB_TREE could have removed it
    numOfQuestions = category.numOfQuestions;
    questionRows = category.questionRows;
    hasMoreQuestions = category.hasMoreQuestions??false;
    const { partitionKey, id } = category;
    console.assert(partitionKey === category.partitionKey);
    console.log('^^^^^^^^^^^^^ QuestionList', questionRows)
  }

  async function loadMore() {
    try {
      const parentInfo: IParentInfo = {
        categoryKey,
        startCursor: questionRows.length,
        includeQuestionId: questionId ?? null
      }
      console.log('^^^^^^^^^^^^^ loadMore')
      console.log('^^^^^^^^^^^^^', { parentInfo })
      console.log('^^^^^^^^^^^^^ loadMore')
      await loadCategoryQuestions(parentInfo);
    }
    catch (error) {
    }
    finally {
    }
  }

  /* OZIVI
  useEffect(() => {
    if (numOfQuestions > 0 && questionRows.length === 0) { // TODO
      loadMore();
    }
  }, [numOfQuestions])
  */

  
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
      className="ms-2" //  border border-1 border-info
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    >
      <List>
        {questionRows.length === 0 &&
          <label>No questions</label>
        }
        {questionRows.map((questionRow: IQuestionRow) => {
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
