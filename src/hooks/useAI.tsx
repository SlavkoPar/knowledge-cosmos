import React, { useCallback, useEffect, useState } from "react";

import { ICategory, IQuestion, IQuestionKey } from 'categories/types';
import { useGlobalContext } from "global/GlobalProvider";
import { IAnswer, IAnswerKey, IAssignedAnswer } from "groups/types";
import { IWhoWhen } from "global/types";

export interface IChatBotAnswer {
  questionKey: IQuestionKey;
  answerKey: IAnswerKey;
  answerTitle: string;
  answerLink: string | null;
  created: IWhoWhen,
  modified: IWhoWhen | null
}

class ChatBotAnswer {
  constructor(assignedAnswer: IAssignedAnswer) {
    const { questionKey, answerKey, answerTitle, answerLink, created, modified } = assignedAnswer;
    this.chatBotAnswer = {
      questionKey,
      answerKey,
      answerTitle, // : .answerTitle ?? '',
      answerLink,
      created: assignedAnswer.created,
      modified: assignedAnswer.modified
    }
  }
  chatBotAnswer: IChatBotAnswer
}


export interface INewQuestion {
  firstChatBotAnswer: IChatBotAnswer | null;
  hasMoreAnswers: boolean;
}

export interface INextAnswer {
  nextChatBotAnswer: IChatBotAnswer | null; //undefined;
  hasMoreAnswers: boolean;
}

export const useAI = (categories: ICategory[]): [
    (question: IQuestion) => Promise<INewQuestion>,
    () => Promise<IQuestion|null>,
    () => Promise<INextAnswer>] => {

  const { getCatsByKind, getAnswer } = useGlobalContext();

  const [question, setQuestion] = useState<IQuestion | null>(null);
  //const [answer, setAnswer] = useState<IAnswer | undefined>(undefined);
  const [index, setIndex] = useState<number>(0);

  // useEffect(() => {
  //   (async () => {
  //     // if (question) {
  //     //   const q = await getQuestion(question.id!);
  //     //   return { q, answer };
  //     // }
  //   })()
  // }, [])

  const setNewQuestion = async (q: IQuestion): Promise<INewQuestion> => {
    setQuestion(q);
    let hasMoreAnswers = false;
    let firstChatBotAnswer: IChatBotAnswer | null = null;
    if (q) {
      const { assignedAnswers } = q;
      // const assignedAnswer = (assignedAnswers.length > 0)
      //   ? assignedAnswers[0]
      //   : undefined;
      if (assignedAnswers && assignedAnswers.length > 0) {
        //const answerKey: IAnswerKey = { partitionKey: assignedAnswer.answerKey.partitionKey, id: assignedAnswer.answerKey.id }
        //firstAnswer = await getAnswer(assignedAnswer.answerKey);
        const assignedAnswer = assignedAnswers[0];
        firstChatBotAnswer = new ChatBotAnswer(assignedAnswer).chatBotAnswer;
        hasMoreAnswers = assignedAnswers.length > 1;
        setIndex(0);
      }
    }
    return { firstChatBotAnswer, hasMoreAnswers };
  }

  const getCurrQuestion = async (): Promise<IQuestion|null> => {
    return question
  }


  const getNextChatBotAnswer = async (): Promise<INextAnswer> => {
    const { assignedAnswers } = question!;
    const len = assignedAnswers.length;
    const i = index + 1;
    if (index + 1 < len) {
      //const answerKey: IAnswerKey = { partitionKey: '', id: assignedAnswers[i].answerKey.id }
      //const answerKey: IAnswerKey = assignedAnswers[i].answerKey;
      //const nextAnswer = await getAnswer(answerKey);
      setIndex(i);
      return {
        nextChatBotAnswer: new ChatBotAnswer(assignedAnswers[i]).chatBotAnswer,
        hasMoreAnswers: i + 1 < len
      }
    }
    return { nextChatBotAnswer: null, hasMoreAnswers: false }
  }

  return [
    useCallback(setNewQuestion, []), 
    useCallback(getCurrQuestion, [question]), 
    useCallback(getNextChatBotAnswer, [question])
  ];
}