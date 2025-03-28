import React, { useEffect, useState } from "react";

import { ICategory, IQuestion, IQuestionKey } from 'categories/types';
import { useGlobalContext } from "global/GlobalProvider";
import { IAnswer } from "groups/types";
import useFetchWithMsal from "./useFetchWithMsal";
import { protectedResources } from "authConfig";

export interface INewQuestion {
  question: IQuestion | null;
  firstAnswer: IAnswer | undefined;
  hasMoreAnswers: boolean;
}

export interface INextAnswer {
  nextAnswer: IAnswer | undefined;
  hasMoreAnswers: boolean;
}

export const useAI = async (categories: ICategory[]) => {

  const { execute } = useFetchWithMsal("", {
		scopes: protectedResources.KnowledgeAPI.scopes.read,
	});

  const { getCatsByKind, getQuestion, getAnswer } = useGlobalContext();

  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [answer, setAnswer] = useState<IAnswer | undefined>(undefined);
  const [index, setIndex] = useState<number>(0);

  // useEffect(() => {
  //   (async () => {
  //     // if (question) {
  //     //   const q = await getQuestion(question.id!);
  //     //   return { q, answer };
  //     // }
  //   })()
  // }, [])

  const setNewQuestion = async (questionKey: IQuestionKey) : Promise<INewQuestion> => {
    const question = await getQuestion(execute, questionKey);
    setQuestion(question);
    let hasMoreAnswers = false;
    let firstAnswer: IAnswer | undefined = undefined;
    if (question) {
      const { assignedAnswers } = question;
      const assignedAnswer = (assignedAnswers.length > 0)
        ? question.assignedAnswers[0]
        : undefined;
      if (assignedAnswer) {
        firstAnswer = await getAnswer(assignedAnswer.answer.id);
        hasMoreAnswers = assignedAnswers.length > 1;
      }
    }
    return { question, firstAnswer, hasMoreAnswers };
  }

  const getNextAnswer = async (): Promise<INextAnswer> => {
    const { assignedAnswers } = question!;
    const len = assignedAnswers.length;
    const i = index + 1;
    if (index + 1 < len) {
      const nextAnswer = await getAnswer(assignedAnswers[i].answer.id);
      setIndex(i);
      return { nextAnswer: nextAnswer, hasMoreAnswers: i + 1 < len }
    }
    return { nextAnswer: undefined, hasMoreAnswers: false }
  }

  return { setNewQuestion, getNextAnswer };
}