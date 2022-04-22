/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const vscode = require('vscode');
const { getLanguageFunction } = require('../languages');
const logger = require('../logger');

const config = vscode.workspace.getConfiguration('codexr');

/**
 * Returns the number of samples to take from the text.
 * @param {string} text - The text to sample from.
 * @param {string} language - The language of the text.
 * @returns {number} - The number of samples to take from the text.
 */
function getNSamples(text, language) {
	const languageFunction = getLanguageFunction(language);

	if (text.includes(languageFunction)) return 3;

	return 1;
}

/**
 * Returns an engine id based on the language and text passed in.
 * @param {string} text - The text to be evaluated.
 * @param {string} language - The language the text is written in.
 * @returns {string} The engine id.
 */
function getEngineId(text, language) {
	const languageFunction = getLanguageFunction(language);

	if (text.includes(languageFunction)) return 'code-davinci-002';

	return 'code-cushman-001';
}

/**
 * Gets the prompt temperature.
 * @param {number} samples - The number of samples of.
 * @returns {number} The prompt temperature.
 */
function getPromptTemperature(samples) {
	return samples <= 1 ? 0 : Math.log(samples) / 3;
}

/**
 * @async
 * @function queryOpenAI
 * @returns {Promise} - The response from the server
 */
async function queryOpenAI(request) {
	const maxTokens = config.get('max_tokens');
	const samples = getNSamples(request.query, request.language);

	return await axios.post('https://codexr.herokuapp.com/query', {
		prompt: request.query,
		language: request.language,
		context: request.context,
		stop: ['\n\n\n', 'Prompt:', 'Result:'],
		user: request.user,
		singleLine: request.singleLine,
		maxTokens: maxTokens,
		comment: request.comment,
		samples: samples,
		temperature: getPromptTemperature(samples),
		engineId: getEngineId(request.query, request.language)
	});
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
 * @param {object} request
 * @returns {Promise<Array>}
 */
async function query(request) {
	const response = await queryOpenAI(request);
	// Query OpenAI

	// If there are no choices, return an empty array
	if (!response.data) return [];

	logger.log(response.data.prompt, 'debug', 'important');

	// Otherwise, return the choices with the query removed
	return await Promise.all(
		response.data.choices.map(async value => {
			// Remove the query from the code
			return removeQuery(value.text.trim(), request.context);
		})
	);
}

module.exports = query;
