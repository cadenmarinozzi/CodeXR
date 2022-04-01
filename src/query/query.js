const { Configuration, OpenAIApi } = require('openai');
const { encode, decode } = require('gpt-3-encoder');
const Filter = require('./filter');
const vscode = require('vscode');
const web = require('../web');

const config = vscode.workspace.getConfiguration('codexr');
let apiKey = config.get('api_key')
let configuration = new Configuration({ apiKey: apiKey });

let openai = new OpenAIApi(configuration);
const filter = new Filter(openai);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max); // From some stack overflow article from a while ago

const MAX_TOKENS = 2048;

async function queryOpenAI(context, query, userId) {
    const maxTokens = config.get('max_tokens');

    if (!apiKey) {
        apiKey = config.get('api_key');
        configuration = new Configuration({ apiKey: apiKey });
        openai = new OpenAIApi(configuration);
    }

    await web.incrementUserData(userId, { usage: 1 }); // Increment the usage value by 1

    const prompt = `<|endoftext|>
    /* If the command asks you to generate code, generate the code requested. If it is a slice of code that needs completing, complete it. */
    /* If context code is given, use it as context for the command. */
    
    /* Context:
    import random
    /* Command: def generateRandom( */
    n, min, max):
        generated = [];
    
        for i in range(n):
            generated.append(random.randint(min, max));
    
        return generated;
    /* Command: Implement a fizzbuzz function */
    function fizzBuzz(number) {
        let out = '';
    
        if (number % 3 == 0) out += 'fizz';
        if (number % 5 == 0) out += 'buzz';
        if (out == '') out = number;
    
        console.log(out);
    }
    /* Context:
    function square(x) {
        return x * x;
    }
    const input = 10;
    /* Command: const squared = squa */
    re(input);
    /* Command: function binarySe */
    earch(array, target) {
        let low = 0;
        let high = array.length - 1;
    
        while (low <= high) {
            const middle = Math.floor(low + (high - low) / 2);
            const value = array[middle];
    
            if (value == target) return middle;
            if (value > target) high = middle - 1;
            else low = middle + 1;
        }
    }
    ${context ? '/*Context:\n' + context : ''}
    /* Command: ${query} */\n`;

    const nTokens = encode(prompt).length;
    await web.incrementUserData(userId, { tokens: nTokens }); // Increment the tokens value by nTokens
    
	return await openai.createCompletion('code-cushman-001', {
        prompt: prompt,
		temperature: 0,
		max_tokens: clamp(MAX_TOKENS - nTokens, 1, maxTokens),
        stop: [ '/* Command', '/* Context' ],
        user: userId
	});
}

/**
 * This function trims the context so that it is the specified maximum number of tokens long.
 * @param {string} context - The context to be trimmed.
 * @param {string} prompt - The prompt to be used as a reference point for trimming.
 * @returns {string} - The trimmed context.
 */
 function trimContext(context, prompt) {
    const maxTokens = config.get('max_tokens');
    const encoded = encode(context);

    return decode(encoded.slice(Math.min(encoded.length - (maxTokens - encode(prompt).length), 0), encoded.length));
}

/**
 * Removes the given query from the input string.
 * @param {string} input The string to remove the query from.
 * @param {string} query The query to remove.
 * @return {string} The input string with the query removed.
 */
function removeQuery(input, query) {
    if (input.includes(query)) return input.replace(query, '');
    
    // Find the index of the query in the input
    const index = input.toLowerCase().indexOf(query.toLowerCase());
    // If the query is not in the input, return the input
    if (index < 0) return input;
    // Return the input without the query
    return input.substring(0, index + query.length);
}

/**
 * @async
 * @function query
 * @param {string} language - the language of the context
 * @param {string} context - the context of the conversation
 * @param {string} query - the user's query
 * @param {boolean} hasPrefix - whether or not the user's query has a prefix
 * @returns {Promise<Array<string>>} - an array of responses to the user's query
 */
async function query(language, context, query, hasPrefix, userId) {
    if (context) context = trimContext(context, query);

    const response = await queryOpenAI(context, `${language} ${query}`, userId);
    // Query OpenAI

    // If there are no choices, return an empty array
    if (!response.data.choices) return [];

    // Otherwise, return the choices with the query removed
    return await Promise.all(response.data.choices.map(async value => {
        const text = value.text;
        await web.incrementUserData(userId, { tokens: encode(text).length }); // Increment the tokens value the length of the text
        // Remove the query from the code
        const code = removeQuery(text.trim(), query);

        // Check if the code passes the filter
        if (await filter.check(code)) return (hasPrefix ? '\n' : '') + code;

        // If it does, return the code with a newline if it has a prefix

        return ''; // Otherwise, return an empty string
    }));
}

module.exports = query;