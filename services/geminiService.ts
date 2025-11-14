
import { GoogleGenAI, Type } from '@google/genai';
import { Credential, Field } from '../types';

// This function simulates interaction with the Gemini API.
// In a real application, ensure process.env.API_KEY is configured.
export const analyzeDocument = async (base64Image: string, mimeType: string): Promise<{ documentType: string; fields: Field[] }> => {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 1500));

  // In a real environment, you would not need this check.
  // This is to prevent errors in environments where the API key is not set.
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using mock data.");
    const mockFields: Field[] = [
      { key: "Full Name", value: "Jane Doe" },
      { key: "Document ID", value: `DOC-${Math.floor(Math.random() * 1000000)}` },
      { key: "Date of Issue", value: "2023-10-27" },
      { key: "Expiry Date", value: "2028-10-26" },
      { key: "Issuing Authority", value: "Govt. of Simulation" },
    ];
    return { documentType: "Mock Identity Card", fields: mockFields };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: 'Analyze this document image. Identify the document type and list typical key-value pairs of information found on it. Provide a realistic but fake value for each key.',
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: {
              type: Type.STRING,
              description: 'The type of the document (e.g., Driver\'s License, University Degree).',
            },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: 'The name of the field (e.g., "Full Name").' },
                  value: { type: Type.STRING, description: 'A realistic but fake value for the field (e.g., "John Doe").' },
                },
                required: ['key', 'value'],
              },
            },
          },
          required: ['documentType', 'fields'],
        },
      },
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse;

  } catch (error) {
    console.error("Error analyzing document with Gemini:", error);
    // Fallback to mock data on API error
    const mockFields: Field[] = [
      { key: "Full Name", value: "Jane Doe (Fallback)" },
      { key: "Document ID", value: `ERR-${Math.floor(Math.random() * 1000000)}` },
      { key: "Date of Issue", value: "2023-10-27" },
    ];
    return { documentType: "Fallback Document", fields: mockFields };
  }
};


export const chatWithDocument = async (
  prompt: string,
  credential: Credential,
  isThinkingMode: boolean,
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not set. Using mock response for chat.");
    await new Promise(res => setTimeout(res, 800));
    return isThinkingMode
      ? `This is a deep, thoughtful mock response about your ${credential.documentType} regarding "${prompt}".`
      : `This is a fast mock response about your ${credential.documentType}.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const modelName = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite';
    const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

    const systemInstruction = `You are an expert assistant for the MySafePocket Digital Identity Vault. Your task is to help a user understand and work with their stored personal documents.
The user is asking a question about their "${credential.documentType}".
Here is the data extracted from their document:
${JSON.stringify(credential.fields, null, 2)}
Based ONLY on this information, answer the user's question concisely. Do not invent or assume any information not present in the provided data. If the question cannot be answered with the given data, state that clearly.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        ...config,
        systemInstruction,
      },
    });

    return response.text;

  } catch (error) {
    console.error("Error chatting with document via Gemini:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
};