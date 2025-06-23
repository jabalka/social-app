import { z } from "zod";
import { FAQ_LIST } from "./faq-data";
import { DynamicStructuredTool } from "@langchain/core/tools";


function findFAQAnswer(query: string) {
  const lower = query.toLowerCase();
  const match = FAQ_LIST.find(faq =>
    lower.includes(faq.question.toLowerCase().split(' ')[0])
  );
  return match?.answer ?? null;
}

export const faqTool = new DynamicStructuredTool({
  name: "faq_lookup",
  description: "Use this to answer frequently asked questions about the usage of the platform.",
  schema: z.object({
    question: z.string().describe("User's question about the platform"),
  }),
  func: async ({ question }: { question: string }) => {
    console.log("FAQ Tool was called with:", question);
    const answer = findFAQAnswer(question);
    console.log("FAQ Tool answer:", answer);
    return answer ?? "Sorry, I couldn't find an answer for that question in the FAQs.";
  }
});
