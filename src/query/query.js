const axios = require('axios');
const Completion = require('../completion');

axios.defaults.timeoutErrorMessage = 'timedout';

async function query(parameters) {
	let response;
	parameters.stops = parameters.singleLine ? ['\n'] : parameters.stops;

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
		if (err.message !== 'timedout') return;

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
