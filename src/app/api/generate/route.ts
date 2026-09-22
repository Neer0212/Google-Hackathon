import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { originalText, targetLanguages, enhance, simple, tone } = await req.json();

    if (!originalText || !targetLanguages || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const prompt = `
You are an expert translator and communication assistant for a school teacher.
The teacher has provided the following announcement:
"${originalText}"

Tasks:
1. Detect the language of the original announcement.
2. ${enhance ? "Enhance the message to make it sound appropriate for students and parents." : "Keep the message as close to the original as possible."}
   ${tone ? `Specifically, make the tone of the message: **${tone}**.` : ""}
3. ${simple ? "Simplify the language so it is very easy to understand." : ""}
4. Translate the final message into the following target languages: ${targetLanguages.join(", ")}.
5. Provide romanized phonetic spelling for Indian languages (like Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu) if requested, to help the teacher read it if needed.

Provide the response strictly in JSON matching this schema.
    `;

    const translationSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        language: { type: Type.STRING },
        languageCode: { type: Type.STRING },
        text: { type: Type.STRING },
        romanized: { type: Type.STRING, nullable: true },
      },
      required: ["language", "languageCode", "text"],
    };

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        detectedLanguage: { type: Type.STRING },
        enhancedMessage: { type: Type.STRING },
        translations: {
          type: Type.ARRAY,
          items: translationSchema,
        },
      },
      required: ["detectedLanguage", "enhancedMessage", "translations"],
    };

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });
        break; // Success
      } catch (err: any) {
        if (err?.status === "UNAVAILABLE" || err?.message?.includes("high demand") || err?.message?.includes("503")) {
          retries--;
          if (retries === 0) throw err;
          console.warn(`Gemini 503, retrying... (${retries} left)`);
          await new Promise(r => setTimeout(r, 1000));
        } else {
          throw err;
        }
      }
    }

    if (!response || !response.text) {
      throw new Error("No response from Gemini");
    }

    let rawText = response.text;
    console.log("Gemini Raw Response:", rawText);

    // Clean up potential markdown formatting
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const data = JSON.parse(rawText);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    
    // Log to file for debugging
    const fs = require('fs');
    fs.appendFileSync('error_log.txt', new Date().toISOString() + ' ' + (error.stack || error.message || error) + '\n');
    
    return NextResponse.json(
      { error: "Failed to generate translations" },
      { status: 500 },
    );
  }
}
