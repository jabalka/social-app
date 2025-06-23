import { NextRequest, NextResponse } from "next/server";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { faqTool } from "@/lib/faq-tool";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const llm = new ChatTogetherAI({
    apiKey: process.env.TOGETHER_API_KEY,
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    temperature: 0.7,
    streaming: false,
  });

  const tools = [faqTool];


  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a bot that ALWAYS answers ONLY by calling the FAQ tool, no matter what the user asks.
    Never try to answer on your own. Always use the FAQ tool.`,
    ],
    ["user", "{input}\n{agent_scratchpad}"],
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
  });

  const result = await executor.invoke({ input: message });
  console.log("Agent result:", result);
  return NextResponse.json({
    response: result.output,
  });
}



// _____________________WITH OpenAI FUNCTION AGENTSS____________________________
// import { NextRequest, NextResponse } from "next/server";
// import { ChatOpenAI } from "@langchain/openai";
// import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { faqTool } from "@/lib/faq-tool";

// export async function POST(req: NextRequest) {
//   const { message } = await req.json();

//   const llm = new ChatOpenAI({
//     openAIApiKey: process.env.OPENAI_API_KEY,
//     temperature: 0.7,
//     streaming: false,
//   });

//   const tools = [faqTool];

//   const prompt = ChatPromptTemplate.fromMessages([
//     [
//       "system",
//       `You are a helpful AI assistant for a shop. Use the FAQ tool if the user asks about platform features.`,
//     ],
//     ["user", "{input}\n{agent_scratchpad}"],
//   ]);

//   const agent = await createOpenAIFunctionsAgent({
//     llm,
//     tools,
//     prompt,
//   });

//   const executor = new AgentExecutor({
//     agent,
//     tools,
//   });

//   const result = await executor.invoke({ input: message });

//   return NextResponse.json({
//     response: result.output
//   });
// }
