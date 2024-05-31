import OpenAI from "openai";

const openai = new OpenAI({ apiKey: "" });

export interface AssistantKeysProps {
    OPENAI_API_KEY: string,
    OPENAI_ASSISTANT_ID: string,
    OPENAI_VECTORSTORE_ID: string,
}

class AssistantKeys {
    private OPENAI_API_KEY: string = '';
    private OPENAI_ASSISTANT_ID: string = '';
    private OPENAI_VECTORSTORE_ID: string = '';

    public setKeys({ 
        OPENAI_API_KEY,
        OPENAI_ASSISTANT_ID,
        OPENAI_VECTORSTORE_ID 
    }: AssistantKeysProps) {
        this.OPENAI_API_KEY = OPENAI_API_KEY;
        this.OPENAI_ASSISTANT_ID = OPENAI_ASSISTANT_ID;
        this.OPENAI_VECTORSTORE_ID = OPENAI_VECTORSTORE_ID;
        openai.apiKey = OPENAI_API_KEY;
    }

    public getKeys(): AssistantKeysProps {
        return {
            OPENAI_API_KEY: this.OPENAI_API_KEY,
            OPENAI_ASSISTANT_ID: this.OPENAI_ASSISTANT_ID,
            OPENAI_VECTORSTORE_ID: this.OPENAI_VECTORSTORE_ID
        }
    }
}

const assistantKeys = new AssistantKeys();
export { assistantKeys, openai };