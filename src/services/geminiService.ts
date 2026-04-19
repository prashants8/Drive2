import { GoogleGenAI } from "@google/genai";
import { UserFile } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export const geminiService = {
  async summarizeFile(file: UserFile, content: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a helpful file assistant for DriveTo. 
        Summarize the following file content and provide key insights.
        File Name: ${file.file_name}
        File Type: ${file.file_type}
        
        Content:
        ${content.slice(0, 30000)}`, // Limit to avoid token issues
        config: {
          systemInstruction: "Format your response in clean markdown. Be concise but informative."
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Gemini failed to process this file.");
    }
  },

  async explainExcelData(file: UserFile, data: any[][]) {
    try {
      const formattedData = data.slice(0, 50).map(row => row.join(" | ")).join("\n");
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze these Excel data previews and explain the trends or structure you see.
        File Name: ${file.file_name}
        
        Data (top rows):
        ${formattedData}`,
        config: {
          systemInstruction: "You are a data analyst. Explain what the data represents and highlight any notable findings."
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Gemini failed to analyze the spreadsheet.");
    }
  }
};
