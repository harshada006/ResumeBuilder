import OpenAI from "openai";

const configuredModel = process.env.OPENAI_MODEL?.trim();
const aiModel =
    configuredModel && /^gemini-([1-9]\d*(\.\d+)?)-/.test(configuredModel)
        ? configuredModel
        : "gemini-2.0-flash";

const ai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

export { aiModel };
export default ai