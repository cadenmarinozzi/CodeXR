/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { Configuration, OpenAIApi } = require('openai');
const Filter = require('./filter');
const web = require('../web');
const { encode, decode } = require('gpt-3-encoder');

const apiKey = process.env.OPENAI_API_KEY;
let configuration = new Configuration({ apiKey: apiKey });
let openai = new OpenAIApi(configuration);
const filter = new Filter(openai);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max); // From some stack overflow article from a while ago

const MAX_TOKENS = 2048;

/**
 * Trims a given prompt to a certain number of maxTokens.
 *
 * @param {string} prompt - The string to be trimmed.
 * @param {number} maxTokens - The maximum number of tokens for the string.
 * @returns {string} The trimmed string.
 */
function trimPrompt(prompt, maxTokens) {
	const encoded = encode(prompt);

	return decode(
		encoded.slice(Math.min(encoded.length - maxTokens, 0), encoded.length)
	);
}

/**
 * @function constructCompletionPrompt
 * @param {string} context - The context for the query
 * @param {string} query - The query to be completed
 * @param {string} language - The language for the response
 * @returns {string} - The completed prompt
 */
function constructCompletionPrompt(body) {
	const basePrompt = `// Request:\n// Language: javascript\n// Create a for loop from 12724 to 889005, and print the current number\n\n// Response:\nfor (let i = 12724; i < 889005; i++) {\n    console.log(i);\n}\n\n// Request:\n# Language: python\ndef fibo\n\n// Response:\nnacci(n):\n    if (n == 0):\n        return 0;\n\n    if (n <= 2):\n        return 1;\n \n    return fibonacci(n - 1) + fibonacci(n - 2);\n\n// Request:\n// Language: javascript\nfunction binarySearch(array,\n\n// Response:\n target) {\n    let low = 0;\n    let high = target.length;\n    \n    while (low <= high) {\n        const middle = Math.floor(low + (high - low) / 2);\n        const middleValue = array[middle]'\n        \n        if (middleValue === target)\n            return middle;\n            \n        if (middleValue > target)\n            low = middle + 1;\n        else\n            high = middle - 1;\n    }\n    \n    return -1;\n}\n\n// Request:\n# Language: python\ndef discreteFourierTransform(\n\n// Response:\nsignal):\n    N = len(signal)\n    if (N == 1):\n        return signal\n\n    even = discreteFourierTransform(signal[0::2])\n    odd = discreteFourierTransform(signal[1::2])\n\n    T = [exp(-2j * pi * k / N) * odd[k] for k in range(N // 2)]\n\n    return [even[k] + T[k] for k in range(N // 2)] + \\\n           [even[k] - T[k] for k in range(N // 2)]\n\n// Request:\n`;

	return (
		basePrompt +
		`${body.comment} Language: ${body.language}\n${
			body.context === '' ? '' : body.context + '\n' // eesh
		}${body.prompt}\n\n// Response:`
	);
}

/**
 * @function constructSingleLineCompletion
 * @param {string} context - The context of the code request.
 * @param {string} query - The query for the next line of code.
 * @param {string} language - The programming language for the request.
 * @returns {string} - A string containing the base prompt and the language-specific context and query.
 */
function constructSingleLineCompletion(body) {
	const basePrompt =
		'You are an AI Programmer. Generate the next line of code for the given request:\n\n// Request:\n// Language: javascript\nfunction fibonacci(n) {\n// Next Line:\n    if (n <= 1) return 1;\n\n// Request:\n// Language: python\n# Create a for loop from 1 to 100\n// Next Line:\nfor i in range(1, 100):\n\n// Request:\n';

	return (
		basePrompt +
		`// Language: ${body.language}\n${body.context}\n${body.prompt}\n// Next Line:\n`
	);
}

/**
 * Query openAI
 * @param {object} body
 * @param {string} body.prompt
 * @param {string} body.user
 * @param {number} body.maxTokens
 * @param {string} body.stop
 */
async function queryOpenAI(body) {
	const prompt = constructCompletionPrompt(body);
	const nTokens = encode(prompt).length;
	// Increment the user's token count and usage count

	await web.incrementUserData(body.user, {
		tokens: nTokens,
		// Query OpenAI
		usage: 1
	});

	const request = {
		organization: 'org-HWPmQsbFSGQ2l8uDPvP7YdJs',
		prompt: prompt,
		temperature: 0,
		top_p: 1,
		max_tokens: clamp(MAX_TOKENS - nTokens, 1, body.maxTokens),
		stop: body.stop,
		user: body.user,
		frequency_penalty: 0.34,
		presence_penalty: 0,
		best_of: 3
	};

	return await openai.createCompletion('code-cushman-001', request);
}

/**
 * @async
 * @function query
 * @param {object} body - Data about the user's query
 * @returns {object} - Response data from OpenAI
 */
async function query(body) {
	body.prompt = trimPrompt(body.prompt);

	const response = await queryOpenAI(body);
	const text = response.data.choices[0].text; // Get the text from the response
	await web.incrementUserData(body.user, { tokens: encode(text).length }); // Increment the tokens value the length of the text

	// if (await filter.check(text)) {
	return response;
	// }

	// return {};
}

module.exports = query;
