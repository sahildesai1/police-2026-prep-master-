import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResearchData, MCQ } from "../types";

const API_KEY = process.env.API_KEY || "";

const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Schema Definitions
const mcqSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctAnswer: { type: Type.STRING },
    explanation: { type: Type.STRING },
  },
  required: ["question", "options", "correctAnswer", "explanation"],
};

const researchDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    studyNotes: { type: Type.STRING },
    mcqs: {
      type: Type.ARRAY,
      items: mcqSchema,
    },
  },
  required: ["summary", "studyNotes", "mcqs"],
};

const extensionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studyNotes: { type: Type.STRING },
    mcqs: {
      type: Type.ARRAY,
      items: mcqSchema,
    },
  },
  required: ["studyNotes", "mcqs"],
};

export const fetchGKResearch = async (topic: string, mode: 'test' | 'study-flash' | 'study-pro'): Promise<ResearchData> => {
  let prompt = "";
  let modelName = "";
  let config: any = {
    responseMimeType: "application/json",
    responseSchema: researchDataSchema,
  };

  if (mode === 'test') {
    // TEST MODE: Use Flash + Google Search for accuracy. 
    modelName = "gemini-3-flash-preview";
    config.tools = [{ googleSearch: {} }];

    prompt = `
      Role: Gujarat Police Constable / PSI 2026 Paper Setter.
      Topic: "${topic}"

      Task: Generate a strict JSON response containing a short summary and 30 MCQs.
      
      ACTION: You MUST use the Google Search tool to find the most recent and accurate information.

      Language: Gujarati (Pure & Grammatically Correct).

      JSON Requirements:
      - "summary": A brief 2-3 line overview.
      - "studyNotes": Keep empty string for test mode.
      - "mcqs": Array of 30 questions.
    `;
  } else if (mode === 'study-flash') {
    // STUDY FLASH: Optimized for SPEED
    modelName = "gemini-3-flash-preview"; 
    config.thinkingConfig = { thinkingBudget: 1024 };

    prompt = `
      Role: Subject Expert for Gujarat Competitive Exams.
      Topic: "${topic}"

      Task: Create a VISUALLY RICH, CONCISE study guide in Gujarati.
      
      Instructions:
      1. Content: Cover Essentials, Dates, Key Figures.
      2. FORMATTING: "studyNotes" must be a valid HTML string using Tailwind classes.
      3. ICONS: Use FontAwesome icons in the HTML.

      HTML Templates (for studyNotes):
      - Headings: <h2 class="text-2xl font-black text-slate-800 mb-4">...</h2>
      - Subheadings: <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">...</h3>
      - Feature Box: <div class="bg-emerald-50 border-emerald-100 rounded-xl p-4 my-4">...</div>
      - List: <ul class="space-y-2 list-disc list-inside text-slate-700">...</ul>

      JSON Requirements:
      - "summary": A 1-sentence hook.
      - "studyNotes": The full HTML content.
      - "mcqs": Empty array.
    `;
  } else {
    // STUDY PRO: Optimized for DEPTH with Search Grounding
    modelName = "gemini-3-pro-preview"; 
    config.thinkingConfig = { thinkingBudget: 32768 };
    // Enable search for pro mode to get citations and latest facts
    config.tools = [{ googleSearch: {} }];

    prompt = `
      Role: Senior Professor & Researcher for Gujarat Competitive Exams (GPSC Level).
      Topic: "${topic}"

      Task: Create a MASSIVE, DEEPLY RESEARCHED, HIGH-QUALITY study guide in Gujarati.
      
      Goal: Comprehensiveness, Niche Details, Conceptual Clarity. Provide data that is not easily available.
      Action: Use Google Search to verify facts and find latest data.

      Instructions:
      1. Content: Deep dive into History, nuances of Law, exceptions, complex Geography.
      2. Analysis: Provide analysis of why things happened.
      3. FORMATTING: "studyNotes" must be rich HTML with Tailwind classes.

      HTML Templates (for studyNotes):
      - Headings: <h2 class="text-2xl font-black text-slate-800 border-b border-indigo-100 mt-8 mb-4 pb-2">...</h2>
      - Feature Boxes: Use 'Did You Know' (bg-amber-50), 'Key Facts' (bg-emerald-50), 'Deep Dive' (bg-purple-50).
      - Tables: <table class="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden my-6">...</table>

      JSON Requirements:
      - "summary": A detailed abstract.
      - "studyNotes": The full HTML content.
      - "mcqs": Empty array.
    `;
  }

  try {
    const response = await genAI.models.generateContent({
      model: modelName, 
      contents: prompt,
      config: config,
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    // Extract search sources
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = rawSources
      .map((chunk: any) => ({
        title: chunk.web?.title || "Web Source",
        uri: chunk.web?.uri || "#"
      }))
      .filter((v: any, i: any, a: any) => v.uri !== "#" && a.findIndex((t: any) => t.uri === v.uri) === i)
      .slice(0, 5);

    return {
      summary: parsedData.summary || "Summary not available.",
      studyNotes: parsedData.studyNotes || "",
      mcqs: parsedData.mcqs || [],
      sources: sources,
      type: mode,
      imageUrl: undefined
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("સર્વર વ્યસ્ત છે. કૃપા કરીને થોડી વાર પછી પ્રયાસ કરો.");
  }
};

export const fetchMoreData = async (topic: string, mode: 'test' | 'study-flash' | 'study-pro', existingContext: string[] = []): Promise<{ studyNotes?: string, mcqs?: MCQ[] }> => {
  let prompt = "";
  let modelName = "";
  let config: any = {
    responseMimeType: "application/json",
    responseSchema: extensionSchema,
  };

  // Use the last part of existing text as context to maintain continuity
  const contextStr = existingContext.join("\n").slice(-1000);

  if (mode === 'test') {
    modelName = "gemini-3-flash-preview";
    config.tools = [{ googleSearch: {} }];

    const mcqContext = existingContext.slice(-50).join("\n- ");
    prompt = `
      Topic: "${topic}"
      Task: Generate 20 NEW MCQs.
      Exclude Questions similar to: ${mcqContext}
      Language: Gujarati.
      
      JSON Requirements:
      - "mcqs": Array of 20 new questions.
      - "studyNotes": Empty string.
    `;
  } else if (mode === 'study-pro') {
    modelName = "gemini-3-pro-preview";
    config.thinkingConfig = { thinkingBudget: 32768 };
    
    prompt = `
      Role: Senior Professor.
      Topic: "${topic}"
      Previous Context: "...${contextStr}"

      Task: Provide a DETAILED EXTENSION to the study material in Gujarati. Continue naturally from the previous context.
      
      Instructions:
      1. Content: Go deeper into specific sub-topics.
      2. FORMATTING: Use HTML structure with Tailwind classes (headings, paragraphs, lists, tables).
      
      JSON Requirements:
      - "studyNotes": The HTML string extension.
      - "mcqs": Empty array.
    `;
  } else {
    modelName = "gemini-3-flash-preview";
    config.thinkingConfig = { thinkingBudget: 2048 };
    
    prompt = `
      Role: Subject Expert.
      Topic: "${topic}"
      Previous Context: "...${contextStr}"

      Task: Extend study material in Gujarati. Continue naturally.
      
      Instructions:
      1. Content: Additional key points.
      2. FORMATTING: Use HTML structure with Tailwind classes.

      JSON Requirements:
      - "studyNotes": The HTML string extension.
      - "mcqs": Empty array.
    `;
  }

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: config
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Fetch More Error:", error);
    throw error;
  }
};