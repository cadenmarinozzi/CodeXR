/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const vscode = require('vscode');

const config = vscode.workspace.getConfiguration('codexr');

// function constructInsertPrompt(prefix, line, suffix, language) {
//     return `// Language: ${language}\n${prefix}\n${line}[insert]\n${suffix}`;
// }

function constructCompletionPrompt(context, query, language) {
	const basePrompt = `// Language: javascript\n\n// Request:\n// Create a for loop from 12724 to 889005, and print the current number\n\n// Response:\nfor (let i = 12724; i < 889005; i++) {\n    console.log(i);\n}\n\n// Language: python\n\n// Request:\ndef fibo\n\n// Response:\nnacci(n):\n    if (n == 0):\n        return 0;\n\n    if (n <= 2):\n        return 1;\n \n    return fibonacci(n - 1) + fibonacci(n - 2);\n// Language: javascript\n\n// Request:\nfunction binarySea\n\n// Response:\nrch(array, target) {\n    let low = 0;\n    let high = target.length;\n    \n    while (low <= high) {\n        const middle = Math.floor(low + (high - low) / 2);\n        const middleValue = array[middle]'\n        \n        if (middleValue === target)\n            return middle;\n            \n        if (middleValue > target)\n            low = middle + 1;\n        else\n            high = middle - 1;\n    }\n    \n    return -1;\n}\n\n`;

	return (
		basePrompt +
		`// Language: ${language}\n\n// Request:\n${context}\n${query}\n\n// Response:\n`
	);
}

async function queryOpenAI(context, query, user, language) {
	const maxTokens = config.get('max_tokens');

	return await axios.post('https://codexr.herokuapp.com/query', {
		prompt: constructCompletionPrompt(context, query, language),
		stop: ['\n\n\n', '// Language:', '// Request:', '// Response:'],
		user: user,
		maxTokens: maxTokens
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
 * @param {string} request.context
 * @param {string} request.query
 * @param {string} request.user
 * @param {string} request.language
 * @returns {Promise<Array>}
 */
async function query(request) {
	const response = await queryOpenAI(
		request.context,
		request.query,
		request.user,
		request.language
	);
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
