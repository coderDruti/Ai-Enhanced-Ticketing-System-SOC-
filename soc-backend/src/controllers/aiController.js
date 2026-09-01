const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const prisma = require("../db");

const analyzeTicketSeverity = async (ticketId, description, io) => {
  try {
    // 1. Initialize the LM Studio connection
    const model = new ChatOpenAI({
      configuration: {
        baseURL: "http://localhost:1234/v1", // LM Studio's default local server
        apiKey: "lm-studio", // Required by the SDK, but ignored by LM Studio
      },
      modelName: "google/gemma-4-e4b", 
      temperature: 0, // Forces deterministic, repetitive output with no creativity
    });

    // 2. Define the exact classification prompt
    const prompt = PromptTemplate.fromTemplate(`
You are an expert IT support triage specialist. Analyze the following support ticket description and determine its severity level based strictly on these definitions:

- CRITICAL: System-wide outage, critical data loss, or severe security breach stopping all work.
- HIGH: Significant impairment to a core business function affecting multiple users, with no immediate workaround.
- MEDIUM: Partial system impairment or isolated issue where a temporary workaround is available.
- LOW: Minor issue, individual hardware request, cosmetic bug, or general inquiry.

You must return ONLY ONE of the following exact words: CRITICAL, HIGH, MEDIUM, or LOW.
Do not include any greetings, explanations, punctuation, or surrounding text.

Ticket Description: ${description}
    `);

    // 3. Build the LangChain pipeline (Prompt -> Model -> Text Parser)
    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    // 4. Execute the chain with the ticket description
    const rawResponse = await chain.invoke({ description });
    
    // 5. Clean and validate the output against our Prisma schema ENUMs
    const aiSeverity = rawResponse.trim().toUpperCase();
    const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    
    // Fallback to MEDIUM if the model hallucinates or includes extra punctuation
    const finalSeverity = validSeverities.includes(aiSeverity) ? aiSeverity : 'MEDIUM';

    // 6. Update the PostgreSQL database
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { severity: finalSeverity },
      include: { 
        author: { select: { email: true } } 
      }
    });

    // 7. Broadcast the AI's decision back to the React frontend instantly
    io.emit("ticket_updated", updatedTicket);
    
    console.log(`[AI Triage] Ticket #${ticketId} classified as ${finalSeverity}`);

  } catch (error) {
    console.error("[AI Triage] Pipeline Error:", error.message);
  }
};

module.exports = { analyzeTicketSeverity };