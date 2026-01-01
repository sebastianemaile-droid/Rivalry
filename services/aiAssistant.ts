
import { GoogleGenAI } from "@google/genai";
import { RivalryState } from "../types";

export const getRivalryCommentary = async (state: RivalryState): Promise<string> => {
  // Always create a new instance right before making the call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `
    Context: Sebastian (Team Mamba 🐍) and Cole (Team Panda 🐼) are in a high-stakes habit battle.
    Stakes: First to 30 days wins. Loser gets a buzz cut. 
    
    Current Stats:
    Sebastian: Streak of ${state.Sebastian.streak}
    Cole: Streak of ${state.Cole.streak}
    
    Task status today:
    Sebastian: ${state.Sebastian.tasksToday.filter(t => t.completed).length}/5
    Cole: ${state.Cole.tasksToday.filter(t => t.completed).length}/5

    Your role: You are the "Hardcore Habit Referee". 
    Write a short (max 2 sentences), punchy, and aggressive comment about who is closer to the buzz cut. 
    Refer to them by name and mascot. Mention the buzz cut razor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "The razor is warming up. Don't slip.";
  } catch (error) {
    console.error("AI Commentary failed:", error);
    return "The razor is waiting. Who will blink first?";
  }
};
