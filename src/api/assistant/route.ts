import { assistantKeys, openai } from "../types";

export const runtime = 'edge';


/**
 * NextJS API route for connecting with OPEN AI Assistant and streams. 
 * 
 * Receives data based on message history and vector store, if applied.
 * @param {Request} req
 * @returns {Promise<Response>} Readable Stream of Open AI Assistant response or error
 * @tutorial https://github.com/arjunpatel-01/docs-chat-assistant/?tab=readme-ov-file#assistant-api
 */
export async function NEXT_ASSISTANT_API(req: Request): Promise<Response> {
    const input: {
        instructions: string | null | undefined;
        message: string;
        thread_id: string | null | undefined;
    } = await req.json();

    if (assistantKeys.getKeys().OPENAI_API_KEY === '' || assistantKeys.getKeys().OPENAI_ASSISTANT_ID === '') {
        return new Response(
            JSON.stringify({error_message: "Please set keys."}),
            {status: 400}
        )
    }

    const response =  await ASSISTANT_API(input);
    return response;
}

export async function ASSISTANT_API(input: {
    instructions: string | null | undefined;
    message: string;
    thread_id: string | null | undefined;
}): Promise<Response> {
    if (!input.message || input.message.trim() === '') {
        console.log("error");
        return new Response(
            JSON.stringify({error_message: 'Bad request: invalid message'}), 
            { status: 400 }
        );
    }

    const threadId = input.thread_id ?? (await openai.beta.threads.create()).id;
    //const messages = 
    await openai.beta.threads.messages.create(
        threadId,
        {
            role: "user",
            content: input.message
        }
    );

    return new Response(
        new ReadableStream({
            async pull(controller) {
                console.log('--open streaming--');
                controller.enqueue(JSON.stringify({ thread_id: threadId, wait: true }));
                let isCompleted = false;
                
                while(!isCompleted) {
                    let errFlag: boolean = false;
                    const stream: any = openai.beta.threads.runs.stream(
                        threadId,
                        {
                            assistant_id: assistantKeys.getKeys().OPENAI_ASSISTANT_ID,
                            instructions: input.instructions
                        }
                    );
                    let str = '';

                    for await (const event of stream) {
                        // console.log('event', event);
                        if (event.event === 'thread.message.created') {
                            // controller.enqueue(JSON.stringify({ role: event.data.role }));
                        } else if (event.event === 'thread.message.delta') {
                            // console.log('thread.message', event.data);
                            // console.log('thread.message.delta', event.data.delta.content);

                            if (event.data.delta.content[0].text.annotations) {
                                if (event.data.delta.content[0].text.annotations.length > 0) {
                                    // console.log(event.data.delta.content[0].text.annotations);
                                } else {
                                    str += event.data.delta.content[0].text.value;
                                    controller.enqueue(event.data.delta.content[0].text.value);
                                }
                            } else {
                                str += event.data.delta.content[0].text.value;
                                controller.enqueue(event.data.delta.content[0].text.value);
                            }
                        } else if (event.event === 'thread.run.completed') {
                            console.log(event.data.status);
                            isCompleted = true;
                        } else if (event.event === 'thread.run.requires_action') {
                            if (event.data.status === 'requires_action') {
                                if (event.data.required_action && event.data.required_action.type === 'submit_tool_outputs') {
                                    console.error('Submit tool outputs');
                                    controller.enqueue(JSON.stringify({status: 500, error: 'Submit tool outputs'}));
                                    errFlag = true;
                                    break;
                                }
                            }
                        } else if (event.event === 'thread.run.failed') {
                            console.error(event.data.last_error.message);
                            controller.enqueue(JSON.stringify({status: 500, error: event.data.last_error.message.substring(0,30)}));
                            errFlag = true;
                            break;
                        }
                    }

                    if (errFlag) break;

                    if (str.length > 0 && !isCompleted) {
                        controller.enqueue(JSON.stringify({ longwait: true }));
                    }
                }
                console.log('--close streaming--');
                controller.close();
            },
            async cancel(){}
        }),
        {
            headers: { 'Content-Type': 'text/event-stream' }
        }
    );
}
