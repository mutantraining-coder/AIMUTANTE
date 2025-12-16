
import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from '../utils';
import { GeneratedImage } from '../types';

export const generateEditedImage = async (
  imageFile: File,
  prompt: string
): Promise<GeneratedImage> => {
  try {
    // Initialize the API client inside the function call.
    // This prevents the entire app from crashing on load if process.env is not yet populated.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
       console.error("API Key is missing in process.env.API_KEY");
       // We allow it to proceed to let the library throw the specific error, or handle it gracefully here
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const base64Data = await fileToBase64(imageFile);
    const mimeType = imageFile.type;

    // Use gemini-2.5-flash-image (Nano Banana) for efficient image editing
    const modelId = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Configuration tailored for image output quality
      config: {
        // Nano banana (2.5 flash image) doesn't support responseSchema or mimeType configs for images strictly
        // We rely on the model to return an image part.
      },
    });

    // Check response for image parts
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini.");
    }

    const parts = candidates[0].content.parts;
    let imagePart = null;

    // Iterate to find the inlineData which contains the image
    for (const part of parts) {
      if (part.inlineData) {
        imagePart = part.inlineData;
        break;
      }
    }

    if (imagePart && imagePart.data) {
      return {
        mimeType: imagePart.mimeType || 'image/png',
        data: imagePart.data,
      };
    } else {
      // If no image is found, check if there is text explaining why
      const textPart = parts.find(p => p.text);
      if (textPart) {
        throw new Error(`Model returned text instead of image: ${textPart.text}`);
      }
      throw new Error("The model generated a response, but it did not contain an image.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};
