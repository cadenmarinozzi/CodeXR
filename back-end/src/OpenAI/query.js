const { Configuration, OpenAIApi } = require('openai');
const Filter = require('./filter');
const web = require('../web');
const { encode } = require('gpt-3-encoder');

let configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
let openai = new OpenAIApi(configuration);
const filter = new Filter(openai);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max); // From some stack overflow article from a while ago

const MAX_TOKENS = 2048;

async function queryOpenAI(body) {
    const nTokens = encode(body.prompt).length;

    await web.incrementUserData(body.userId, { 
        tokens: nTokens,
        usage: 1
    }); 

    return await openai.createCompletion('code-cushman-001', {
        prompt: body.prompt,
        temperature: 0,
		max_tokens: clamp(MAX_TOKENS - nTokens, 1, body.maxTokens),
        stop: body.stop,
        user: body.userId
    });
}

async function query(body) {
    const response = await queryOpenAI(body);
    const text = response.data.choices[0].text;
    await web.incrementUserData(body.userId, { tokens: encode(text).length }); // Increment the tokens value the length of the text

    if (await filter.check(text)) return response;

    return {};
}

module.exports = query;