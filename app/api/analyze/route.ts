import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper function to wrap pdf2json in a Promise
// Includes "Silence Mode" to hide harmless library warnings
const parsePDF = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. 🤫 Save original console methods and mute them temporarily
    const originalWarn = console.warn;
    const originalLog = console.log;
    console.warn = () => {}; 
    console.log = () => {};

    try {
      const parser = new PDFParser(null, true);

      parser.on("pdfParser_dataError", (errData: any) => {
        // 🗣️ Restore console before rejecting
        console.warn = originalWarn;
        console.log = originalLog;
        reject(errData.parserError);
      });

      parser.on("pdfParser_dataReady", (pdfData: any) => {
        // 🗣️ Restore console before processing
        console.warn = originalWarn;
        console.log = originalLog;

        try {
          let text = "";
          
          // Loop through every page
          pdfData.Pages.forEach((page: any) => {
            // Loop through every text block
            page.Texts.forEach((t: any) => {
              t.R.forEach((r: any) => {
                // Safe decoding to prevent "URI malformed" crashes
                try {
                  text += decodeURIComponent(r.T) + " ";
                } catch (e) {
                  text += r.T + " ";
                }
              });
            });
            text += "\n";
          });

          resolve(text);
        } catch (err) {
          reject(err);
        }
      });

      parser.parseBuffer(buffer);

    } catch (e) {
      // Restore console if initialization fails
      console.warn = originalWarn;
      console.log = originalLog;
      reject(e);
    }
  });
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let mode = "";
    let company = "";
    let subject = "";
    let snippet = "";
    let context = "";
    let resumeText = "";

    // 1. Handle File Upload (Resume)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      mode = "resume";

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Parse PDF (Now silent 🤫)
      resumeText = await parsePDF(buffer);
    } 
    // 2. Handle Normal JSON (Email Analysis)
    else {
      const body = await req.json();
      mode = body.mode;
      company = body.company;
      subject = body.subject;
      snippet = body.snippet;
      context = body.context;
      resumeText = body.resumeText; 
    }

    // --- AI PROMPTS ---
    let prompt = "";
    
    if (mode === 'draft') {
      prompt = `
        You are a professional career coach. Write a short, professional email reply.
        Context: ${context}
        Company: ${company}
        Original Email: "${snippet}"
        Return JSON: { "subject": "string", "body": "string" }
      `;
    } else if (mode === 'resume') {
       // Limit text length to avoid token limits
       const cleanResume = resumeText.substring(0, 15000);
       
       prompt = `
        Act as an expert ATS (Applicant Tracking System) and Resume Writer. 
        Analyze the following resume text.
        
        Resume Text: "${cleanResume}"

        Return a RAW JSON object (no markdown) with these keys:
        {
          "score": number (0-100 based on impact, clarity, and keywords),
          "headline": "A 1-sentence punchy summary of the candidate",
          "strengths": ["string", "string", "string"] (Top 3 strong points),
          "weaknesses": ["string", "string", "string"] (Top 3 areas to fix),
          "missing_keywords": ["string", "string", "string", "string"] (5 important tech/soft skills that seem missing or weak),
          "improvement_plan": "1 specific, actionable advice to increase the score immediately"
        }
      `;
    } else {
      // Default: Analyze Email
      prompt = `
        Analyze this job application email.
        Snippet: "${snippet}"
        Return JSON: { 
          "summary": "string", 
          "probability": number, 
          "tone": "Positive" | "Neutral" | "Negative", 
          "tips": "string", 
          "action": "string" 
        }
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful AI assistant. Output strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const jsonResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}