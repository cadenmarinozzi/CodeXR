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

function getContextCode(parameters) {
	let contextCode =
		(parameters.context?.[0]?.code ?? '') +
		(parameters.context?.[1]?.code ?? '');

	if (contextCode === '') {
		return '';
	}

	return contextCode + '\n';
}

function createSingleLinePrompt(parameters) {
	const contextCode = getContextCode(parameters);

	return `${contextCode}Create the next line of code:\n${parameters.prompt}`;
}

function createMultiLinePrompt(parameters) {
	const contextCode = getContextCode(parameters);

	return `${contextCode}Finish this code:\n${parameters.prompt}`;
}

function createPrompt(parameters) {
	return parameters.singleLine
		? createSingleLinePrompt(parameters)
		: createMultiLinePrompt(parameters);
}

async function query(parameters) {
	if (!validateParameters(parameters)) {
		return statusCodes.BAD_REQUEST;
	}

	const prompt = createPrompt(parameters);
	const numTokens = encode(prompt).length;

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

	web.updateLastRequestTime(parameters.user);
	web.incrementUserRequests(parameters.user);
	web.incrementUserTokens(parameters.user, numTokens);

	return {
		completion: response?.data?.choices?.[0]?.text,
		prompt: prompt
	};
}

module.exports = query;
