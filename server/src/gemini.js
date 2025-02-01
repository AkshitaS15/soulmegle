import { GoogleGenerativeAI } from "@google/generative-ai";

// Create a new instance of the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getEmbedding(text) {
    // Access the generative model for embeddings
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    // Request the embedding for the input text
    const result = await model.embedContent({ content: text, taskType: "RETRIEVAL_DOCUMENT" });

    // Return the embedding values (array of floats)
    return result.embedding.values;
}
