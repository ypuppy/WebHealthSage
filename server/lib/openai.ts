import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSentiment(text: string): Promise<{
  score: number;
  tone: string;
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment and tone of the website content. Provide a score (1-100), overall tone, and suggestions for improvement. Return in JSON format.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    if (error?.response?.status === 429 || error.message?.includes('quota')) {
      throw new Error("OpenAI API quota exceeded. Please try again later or check your API key limits.");
    }
    throw new Error(`Failed to analyze sentiment: ${error.message}`);
  }
}

export async function getSEOSuggestions(content: string): Promise<{
  issues: string[];
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the website content for SEO issues and provide actionable suggestions. Return in JSON format.",
        },
        {
          role: "user",
          content,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    if (error?.response?.status === 429 || error.message?.includes('quota')) {
      throw new Error("OpenAI API quota exceeded. Please try again later or check your API key limits.");
    }
    throw new Error(`Failed to get SEO suggestions: ${error.message}`);
  }
}