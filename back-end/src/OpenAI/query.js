/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { Configuration, OpenAIApi } = require('openai');
const Filter = require('./filter');
const web = require('../web');
const { encode, decode } = require('gpt-3-encoder');

const apiKey = process.env.OPENAI_API_KEY;
let configuration = new Configuration({
	apiKey: apiKey,
	organization: 'org-HWPmQsbFSGQ2l8uDPvP7YdJs'
});
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
	const basePrompt = `I am good at coding. I will complete the prompt.\n\nPrompt:\n// Language javascript\nfunction binarySearch(\nResult: array, target) {\n    let low = 0;\n    let high = array.length - 1;\n    \n    for (low <= high) {\n        const middle = Math.floor(low + (high - low) / 2);\n        const value = array[middle];\n        \n        if (value == target) return middle;\n        if (value > target) high = middle - 1;\n        elseif (value < target) low = middle + 1;\n    }\n    \n    return -1;\n}\n\nPrompt:\n# Language: python\n# Create a for loop from 1 to 100 and print the current number times 3\nResult:\nfor i in range(1, 100):\n    print(i * 3);\n\nPrompt:\n// Language: javascript\n// Create a console game that has the user gues\nResult: s a random number between 1 and 50 and if the user guesses it, the game ends.\n\nPrompt:\n`;

	return (
		basePrompt +
		`${body.comment} Language: ${body.language}\n${
			body.context === '' ? '' : body.context + '\n' // eesh
		}${body.prompt}\nResult:`
	);
}

/**
 * Constructs a prompt to assign a value to a given variable.
 * @param {object} body The body object containing the context and prompt.
 * @returns {string} The constructed prompt.
 */
function constructVariableAssignmentPrompt(body) {
	const basePrompt = '\nAssign a value to this variable:\n';

	return body.context + basePrompt + body.prompt;
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
	const prompt = body.variableAssignment
		? constructVariableAssignmentPrompt
		: constructCompletionPrompt(body);
	const nTokens = encode(prompt).length;
	// Increment the user's token count and usage count

	await web.incrementUserData(body.user, {
		tokens: nTokens,
		// Query OpenAI
		usage: 1
	});

	const request = {
		prompt: prompt,
		temperature: body.temperature ?? 0,
		top_p: 1,
		max_tokens: clamp(MAX_TOKENS - nTokens, 1, body.maxTokens),
		stop: body.variableAssignment ? ['\n'] : body.stop,
		user: body.user,
		frequency_penalty: 0.34,
		presence_penalty: 0,
		best_of: body.samples
		// echo: body.echo
	};

	return [
		await openai.createCompletion(body.engineId, request),
		request.prompt
	];
}

/**
 * @async
 * @function query
 * @param {object} body - Data about the user's query
 * @returns {object} - Response data from OpenAI
 */
async function query(body) {
	body.prompt = trimPrompt(body.prompt);

	const [response, prompt] = await queryOpenAI(body);
	const text = response.data.choices[0].text; // Get the text from the response
	await web.incrementUserData(body.user, { tokens: encode(text).length }); // Increment the tokens value the length of the text

	if (await filter.check(text)) {
		return [response, prompt];
	}

	await web.incrementUserData(body.user, { flaggedCompletions: 1 });

	return {};
}

module.exports = query;
