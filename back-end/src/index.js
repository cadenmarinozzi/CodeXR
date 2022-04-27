const express = require('express');
const app = express();
const { Configuration, OpenAIApi } = require('openai');
const { encode } = require('gpt-3-encoder');

const apiKey = process.env.OPENAI_API_KEY;
let configuration = new Configuration({
	apiKey: apiKey,
	organization: 'org-HWPmQsbFSGQ2l8uDPvP7YdJs'
});

let openai = new OpenAIApi(configuration);

async function query(parameters) {
	const contextCode = parameters.context?.[0]?.code ?? '';
	const prompt = contextCode + '\n' + parameters.prompt;

	const response = await openai.createCompletion(parameters.engine, {
		prompt: prompt,
		temperature: parameters.temperature,
		stop: parameters.stops,
		best_of: parameters.samples,
		max_tokens: 2048 - encode(prompt).length,
		top_p: 1,
		presence_penalty: 0,
		frequency_penalty: 0.34
	});

	return {
		completion: response?.data?.choices?.[0]?.text,
		prompt: prompt
	};
}

app.use(express.json());

app.post('/query', async (req, res) => {
	const parameters = req.body;

	const response = await query(parameters);
	res.status(200).json(response);
});

let port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Back-end running on port ${port}`);
});
