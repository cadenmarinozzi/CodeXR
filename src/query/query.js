/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const vscode = require('vscode');

const config = vscode.workspace.getConfiguration('codexr');

/**
 * @async
 * @function queryOpenAI
 * @returns {Promise} - The response from the server
 */
async function queryOpenAI(request) {
	const maxTokens = config.get('max_tokens');

	return await axios.post('https://codexr.herokuapp.com/query', {
		prompt: request.query,
		language: request.language,
		context: request.context,
		//stop: ['\n\n\n', 'Prompt:', 'Result:'],
		user: request.user,
		singleLine: request.singleLine,
		maxTokens: maxTokens,
		comment: request.comment
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

	// Otherwise, return the choices with the query removed
	return await Promise.all(
		response.data.map(async value => {
			// Remove the query from the code
			let code = removeQuery(value.text.trim(), request.context);

			return code;
		})
	);
}

module.exports = query;
