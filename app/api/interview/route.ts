import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    // ✅ Added 'type' to the destructuring
    const { messages, company, role, type = "interview" } = await req.json();

    console.log(`🎤 Request: ${type} for ${company}`);

    let systemPrompt = "";

    if (type === "salary") {
      // 💰 SALARY NEGOTIATION PERSONA
      systemPrompt = `
        You are an expert Salary Negotiation Coach.
        The user has received a job offer from ${company} for the role of ${role}.
        
        YOUR GOAL:
        Help the user negotiate a higher salary and better benefits.
        
        GUIDELINES:
        1. Start by asking for the offer details (Base salary, Equity, Sign-on bonus).
        2. Once you have the numbers, analyze if it's competitive.
        3. Roleplay the conversation. You act as the Coach, telling the user exactly what to say to the recruiter.
        4. Provide specific scripts (e.g., "Say this: 'I'm really excited about the team, but looking at market data...'").
        5. Keep advice concise and actionable.
      `;
    } else {
      // 🎤 STANDARD MOCK INTERVIEW PERSONA
      systemPrompt = `
        You are a professional technical recruiter at ${company}. 
        You are conducting a screening interview with a candidate for the ${role} position.
        
        YOUR GOAL:
        Conduct a realistic, 10-15 minute screening interview.
        
        GUIDELINES:
        1. Start by introducing yourself and asking for a brief introduction.
        2. Ask ONE question at a time.
        3. Keep your responses concise.
        4. Cover technical and soft skills fit for ${company}.
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ 
      role: "assistant", 
      content: completion.choices[0]?.message?.content 
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}