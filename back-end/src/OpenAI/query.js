/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { Configuration, OpenAIApi } = require('openai');
const Filter = require('./filter');
const web = require('../web');
const { encode } = require('gpt-3-encoder');

const apiKey = process.env.OPENAI_API_KEY;
let configuration = new Configuration({ apiKey: apiKey });
let openai = new OpenAIApi(configuration);
const filter = new Filter(openai);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max); // From some stack overflow article from a while ago

const MAX_TOKENS = 2048;

/**
 * Query openAI
 * @param {object} body 
 * @param {string} body.prompt 
 * @param {string} body.user 
 * @param {number} body.maxTokens 
 * @param {string} body.stop 
 */
async function queryOpenAI(body) {
    const nTokens = encode(body.prompt).length;
    // Increment the user's token count and usage count

    await web.incrementUserData(body.user, { 
        tokens: nTokens,
    // Query OpenAI
        usage: 1
    }); 

    return await openai.createCompletion('code-cushman-001', {
        prompt: body.prompt,
        temperature: 0,
		max_tokens: clamp(MAX_TOKENS - nTokens, 1, body.maxTokens),
        stop: body.stop,
        user: body.user,
        frequency_penalty: 0.34
    });
}

/**
 * @async
 * @function query
 * @param {object} body - Data about the user's query
 * @returns {object} - Response data from OpenAI
 */
async function query(body) {
    const response = await queryOpenAI(body);
    const text = response.data.choices[0].text; // Get the text from the response
    await web.incrementUserData(body.user, { tokens: encode(text).length }); // Increment the tokens value the length of the text

    if (await filter.check(text)) return response;

    return {};
}

module.exports = query;