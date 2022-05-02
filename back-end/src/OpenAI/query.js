/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { statusCodes } = require('../status');
const { Configuration, OpenAIApi } = require('openai');
const { encode } = require('gpt-3-encoder');
const web = require('../web');

const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
	apiKey: apiKey,
	organization: 'org-HWPmQsbFSGQ2l8uDPvP7YdJs'
});

const openai = new OpenAIApi(configuration);

const validEngines = ['code-cushman-001', 'code-davinci-002'];
const MAX_TOKENS = 2048; // 4000, 4096

/**
 * Checks that the parameters entered by the user are valid
 * @param  {object} parameters The parameters the user entered
 * @return {boolean}            Whether or not the parameters are valid
 */
function validateParameters(parameters) {
	return (
		parameters.temperature >= 0 &&
		parameters.temperature <= 1 &&
		parameters.samples > 0 &&
		validEngines.includes(parameters.engine) &&
		parameters.stops !== [] &&
		parameters.user
	);
}

/**
 * Returns context code as a string
 * @param {object} parameters - An object with context
 * @returns {string} - A string representing the context code
 */
function getContextCode(parameters) {
	// This is a complicated line of code
	let contextCode =
		(parameters.context?.[0]?.code ?? '') +
		(parameters.context?.[1]?.code ?? '');

	if (contextCode === '') {
		return '';
	}

	return contextCode + '\n';
}

/**
 * @function createSingleLinePrompt
 * @param {object} parameters - An object containing the parameters for the createSingleLinePrompt function.
 * @returns {string} A string containing the next line of code.
 */
function createSingleLinePrompt(parameters) {
	const contextCode = getContextCode(parameters);

	return `${contextCode}Create the next line of code:\n${parameters.prompt}`;
}

/**
 * @function createMultiLinePrompt
 * @description Takes in a parameter object containing context code and a prompt, and returns a string with the context code and prompt
 * @param {object} parameters - An object containing context code and a prompt
 * @returns {string} A string containing the context code and prompt
 */
function createMultiLinePrompt(parameters) {
	// Get the context code
	const contextCode = getContextCode(parameters);

	return `${contextCode}Finish this code:\n${parameters.prompt}`;
}

/**
 * @param {Object} parameters
 * @param {boolean} parameters.singleLine
 * @returns {Prompt}
 */
function createPrompt(parameters) {
	return parameters.singleLine
		? createSingleLinePrompt(parameters)
		: createMultiLinePrompt(parameters);
}

/**
 * @async
 * @param {Object} parameters
 * @param {string} parameters.engine - The OpenAi engine to use
 * @param {number} parameters.temperature - The temperature to use
 * @param {number} parameters.stops - The number of stops to use
 * @param {number} parameters.samples - The number of samples to use
 * @param {string} parameters.user - The user to generate the completion for
 * @returns {Object} - The status code and the completion
 */
async function query(parameters) {
	if (!validateParameters(parameters)) {
		return statusCodes.BAD_REQUEST;
	}
	// Create the prompt from the parameters

	// Get the number of tokens in the prompt
	const prompt = createPrompt(parameters);
	console.log(prompt);
	const numTokens = encode(prompt).length;
	// Create the completion

	const response = await openai.createCompletion(parameters.engine, {
		prompt: prompt,
		temperature: parameters.temperature,
		stop: parameters.stops,
		best_of: parameters.samples,
		max_tokens: MAX_TOKENS - numTokens,
		top_p: 1,
		presence_penalty: 0,
		frequency_penalty: 0.34,
		user: parameters.user
	});

	// Update the user's last request time
	// web.updateLastRequestTime(parameters.user);

	// Increment the user's request count
	// web.incrementUserRequests(parameters.user);

	// Increment the user's token count
	// web.incrementUserTokens(parameters.user, numTokens);

	return {
		completion: response?.data?.choices?.[0]?.text,
		prompt: prompt
	};
}

module.exports = query;
