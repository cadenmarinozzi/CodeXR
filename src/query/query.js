/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const Completion = require('../completion');
const { getUser } = require('../user');
const vscode = require('vscode');

axios.defaults.timeoutErrorMessage = 'timedout';

/**
 * @async
 * @param {Object} parameters
 * @returns {Completion} - The response from the server.
 * @throws {Error} - If the request times out.
 */
async function query(parameters) {
	let response;
	// Get the user's username
	parameters.user = getUser();

	if (!parameters.validate()) {
		console.log('Invalid parameters!');

		return;
	}

	try {
		response = await axios.post(
			'https://codexr.herokuapp.com/query',
			parameters
		);
	} catch (err) {
		if (err.message !== 'timedout') {
			// vscode.window.showWarningMessage(`CodeXR: ${err.message}`);
			console.error(parameters);

			return;
		}

		return new Completion({
			timedout: true
		});
	}

	const completion = new Completion({
		completion: response.data.completion,
		prompt: response.data.prompt
	});

	return completion;
}

module.exports = query;
