import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function generateSubtasks(taskTitle: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a helpful project manager assistant. When given a task title, generate a list of 3-5 concrete, actionable subtasks to complete that main task. Return ONLY a raw JSON array of strings, no markdown formatting. Task: ${taskTitle}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return [];
  }
}

export async function generateBoardTasks(boardTitle: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a project manager. Given the project title "${boardTitle}", generate a list of 5-8 essential tasks to complete this project.
    Return ONLY a raw JSON array of objects with this structure:
    [
      { "title": "Task Title", "description": "Brief description", "priority": "high" | "medium" | "low" }
    ]
    Do not include any markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating board tasks:", error);
    return [];
  }
}
