import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config(); 
import { speak } from './speakExecutor.js';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY; 
const MISTRAL_MODEL = 'mistral-medium-latest'; 


export async function serpApiSearch(query: string): Promise<string> {
    if (!SERPAPI_API_KEY) {
        throw new Error("SERPAPI_API_KEY is not set in environment variables.");
    }

    if (!MISTRAL_API_KEY) {
        throw new Error("MISTRAL_API_KEY is not set in environment variables.");
    }

    console.log(`Searching SerpAPI for: "${query}"`);

    const serpApiUrl = `https://serpapi.com/search?api_key=${SERPAPI_API_KEY}&q=${encodeURIComponent(query)}`;

    let searchData: any;
    try {
        const response = await axios.get(serpApiUrl);
        searchData = response.data;
        console.log("SerpAPI search completed.");
    } catch (error: any) {
        console.error(` Error searching SerpAPI: ${error.message}`);
        throw new Error(`Failed to perform web search: ${error.message}`);
    }
//once again, gemini handles serp's annoying json
    // --- Extract relevant snippets from SerpAPI response ---
    let relevantSnippets: string[] = [];

    // Prioritize 'answer_box', 'knowledge_graph', 'organic_results'
    if (searchData.answer_box && searchData.answer_box.snippet) {
        relevantSnippets.push(searchData.answer_box.snippet);
    }
    if (searchData.knowledge_graph && searchData.knowledge_graph.snippet) {
        relevantSnippets.push(searchData.knowledge_graph.snippet);
    }
    if (searchData.organic_results && Array.isArray(searchData.organic_results)) {
        // Take snippets from the first few organic results
        searchData.organic_results.slice(0, 5).forEach((result: any) => {
            if (result.snippet) {
                relevantSnippets.push(result.snippet);
            }
        });
    }

    if (relevantSnippets.length === 0) {
        console.warn("No relevant snippets found in SerpAPI response.");
        const noInfoMessage = "I found search results, but couldn't extract enough information to provide a concise answer.";
        await speak(noInfoMessage);
        return noInfoMessage;
    }

    const combinedSnippets = relevantSnippets.join('\n\n');

//summarization by mistral
    console.log("Sending snippets to Mistral for summarization...");


    const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

//prompt to do what I want
    const prompt = `Based on the following search results, provide a concise, direct, and factual answer to the query "${query}". Format your response as a JSON object with a single key "data", where the value is the summarized text. Example: {"data": "Your summarized text here."}. If the information is insufficient, return {"data": "I cannot provide a full answer based on the given information."}.\n\nSearch Results:\n${combinedSnippets}`;

    const payload = {
        model: MISTRAL_MODEL,
        messages: [ 
            { role: "user", content: prompt }
        ],
        temperature: 0.1, 
        response_format: { type: "json_object" } 
    };

    let mistralResponseData: any;
    let summarizedText: string;

    try {
        const response = await axios.post(MISTRAL_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}` 
            }
        });
        mistralResponseData = response.data;
        console.log("Mistral summarization completed.");

       
        const rawLlmResponseText = mistralResponseData?.choices?.[0]?.message?.content;

        if (!rawLlmResponseText) {
            console.warn("Mistral response did not contain expected text content for summarization.");
            summarizedText = "I performed the search, but the AI could not generate a clear summary from the results.";
        } else {
            try {
                
                const jsonResponse = JSON.parse(rawLlmResponseText);
                if (jsonResponse.data) {
                    summarizedText = jsonResponse.data;
                } else {
                    console.warn("Mistral response JSON did not contain the 'data' key.");
                    summarizedText = "I performed the search, but the AI's summary was not in the expected format.";
                }
            } catch (parseError: any) {
                console.error(` Error parsing Mistral's JSON response: ${parseError.message}`, rawLlmResponseText);
                summarizedText = "I performed the search, but encountered an error parsing the AI's response.";
            }
        }

        //final speak
        await speak(summarizedText);
        console.log(` Spoke summarized text: "${summarizedText}"`);
        return `Search completed and summarized text spoken: "${summarizedText}"`;

    } catch (error: any) {
        console.error(` Error in SerpAPI search or Mistral summarization/speaking: ${error.message}`);
        if (axios.isAxiosError(error) && error.response) {
            console.error(`API Response Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        const errorMessage = `Failed to perform search, summarize, or speak: ${error.message}`;
        await speak("I encountered an error while trying to get information for you.");
        throw new Error(errorMessage);
    }
}
