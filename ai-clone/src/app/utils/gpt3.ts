// src/utils/gpt3.ts
import axios, { AxiosError } from 'axios';

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
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return { success: true, content: response.data.choices[0].message.content };
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred.';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data.message || error.message;
    } else {
      errorMessage = 'Unexpected error: ' + error;
    }
    return { success: false, content: errorMessage };
  }
};
