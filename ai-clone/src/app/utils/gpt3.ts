// src/utils/gpt3.ts
import axios from 'axios';

const GPT3_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export const callGPT3 = async (chatHistory: { role: string, content: string }[]) => {
  try {
    const response = await axios.post(
      GPT3_API_URL,
      {
        model: 'gpt-3.5-turbo', 
        messages: chatHistory,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
