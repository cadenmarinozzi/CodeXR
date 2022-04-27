/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const Parameters = require('../parameters');

function temperatureFromSamples(samples) {
	return samples <= 1 ? 0 : Math.log(samples) / 2;
}

function samplesFromBlockComplexity(complexity) {
	return Math.floor(2 + Math.log2(complexity));
}

function complexityFromSize(size) {
	const deviationRange = Math.log10(size);

	return Math.exp(deviationRange * deviationRange);
}

function getEngine(block) {
	return block.isOpened
		? 'code-cushman-001'
		: block.isFinished
		? 'code-davinci-002'
		: 'code-cushman-001';
}

function getStops(block) {
	return block.isOpened ? [block.language.brackets.close] : ['\n\n\n'];
}

function blocksToParameters(block) {
	let blocksSize = block.code.length;

	const complexity = complexityFromSize(blocksSize);
	const samples = samplesFromBlockComplexity(complexity);
	const parameters = new Parameters({
		samples: samples,
		temperature: temperatureFromSamples(samples),
		engine: getEngine(block),
		stops: getStops(block),
		prompt: block.code
	});

	return parameters;
}

module.exports = blocksToParameters;
