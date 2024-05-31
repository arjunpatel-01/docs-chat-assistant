import OpenAI from "openai";
import * as cheerio from 'cheerio';
import path from "path";
import fs from 'fs'
import { promisify } from "util";
import { assistantKeys, openai } from "../types";

export const runtime = 'edge';

/**
 * Employs Breadth First Search to crawl provided link and all nested links iteratively.
 * Sends content as files to Open AI vector store.
 * @param {string} base_url 
 * @returns {Promise<Response>} status and message
 * @tutorial https://github.com/arjunpatel-01/docs-chat-assistant/?tab=readme-ov-file#web-crawler-api
 */
export async function WEB_CRAWLER(base_url: string): Promise<Response> {
    if (!base_url || base_url.trim() === '') {
        return new Response(
            JSON.stringify({error_message: "Bad Request: invalid request body"}),
            { status: 400 }
        );
    }

    if (assistantKeys.getKeys().OPENAI_API_KEY === '') {
        return new Response(
            JSON.stringify({error_message: "Please set keys"}),
            {status: 400}
        )
    }

    let vectorStore: OpenAI.Beta.VectorStores.VectorStore;
    
    try {
        vectorStore = await openai.beta.vectorStores.retrieve(assistantKeys.getKeys().OPENAI_VECTORSTORE_ID !== '' ? assistantKeys.getKeys().OPENAI_VECTORSTORE_ID :  (() => { throw new Error('OPENAI_VECTORSTORE_ID is not set');})());
    } catch (e: any) {
        return new Response(
            JSON.stringify({error_message: "Bad Request: invalid vector_store_id"}),
            { status: e.status }
        );
    }

    //Breadth-first search approach

    const host = new URL(base_url).host;
    var BFSQueue: string[] = [];
    var visited: Set<string> = new Set<string>();
    var batch: string[] = [];
    const batchLimit: number = 500;
    const dir = './crawl_dump';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const write = promisify(fs.writeFile);
    const unlink = promisify(fs.unlink);

    BFSQueue.push(base_url);

    while (BFSQueue.length > 0) {
        const currentURL: string = BFSQueue.shift() ?? (() => { throw new Error('BFS Queue is empty but shouldn\'t be');})();
        if (visited.has(currentURL)) continue;
        visited.add(currentURL);

        try {
            const response = await fetch(currentURL);
            if (!response.ok) throw Error(`${response.status}: ${currentURL} could not be crawled`);
            const page = await response.text();
            const $ = cheerio.load(page);
            const body = $('body').text();
            const tempFile = currentURL.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_') + ".txt";
            const filepath = path.join(dir, tempFile);
            await write(filepath, body);
            batch.push(filepath);

            if (batch.length === batchLimit) {
                const fileStream = batch.map((file) => fs.createReadStream(file));
                await openai.beta.vectorStores.fileBatches.uploadAndPoll(
                    vectorStore.id,
                    { files: fileStream }
                );
                await Promise.all(batch.map((file) => unlink(file)));
                batch = [];
            }

            $('a').each((_, element) => {
                const href = $(element).attr('href');
                if (href) {
                    const url = new URL(href, currentURL);
                    const urlString = url.toString();
                    if (!urlString.includes('#') && url.host === host && !visited.has(urlString)) {
                        BFSQueue.push(urlString);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    if (batch.length > 0) {
        const fileStream = batch.map((file) => fs.createReadStream(file));
        await openai.beta.vectorStores.fileBatches.uploadAndPoll(
            vectorStore.id,
            { files: fileStream }
        );
        await Promise.all(batch.map((file) => unlink(file)));
        batch = [];
    }

    fs.rmdirSync(dir);

    return new Response(
        JSON.stringify({message: "Crawl complete"}), 
        { status: 200 }
    );
}