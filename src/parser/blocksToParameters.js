/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const Parameters = require('../parameters');

/**
 * Calculates the temperature from a number of samples.
 * @param {number} samples - the number of samples
 * @returns {number} the temperature
 */
function temperatureFromSamples(samples) {
	return Math.min(samples <= 1 ? 0 : Math.log10(samples) / 2, 1);
}

/**
 * @function samplesFromBlockComplexity
 * @param {number} complexity - the number of samples from a given block
 * @return {number} the number of samples from a given block complexity
 */
function samplesFromBlockComplexity(complexity) {
	return Math.min(Math.floor(2 + Math.log10(complexity)), 40);
}

/**
 * Returns a value representing the complexity of an object, based on its size.
 *
 * @param {number} size - The size of the object, as a number.
 * @returns {number} - The complexity of the object, as a number.
 */
function complexityFromSize(size) {
	const deviationRange = Math.log10(size);

	return Math.exp(deviationRange * deviationRange);
}

/**
 * Get the engine code for a given block
 * @param {Object} block - The block to get the engine code for
 * @returns {string} The engine code
 */
function getEngine(block) {
	return block.isOpened
		? 'code-cushman-001'
		: block.isFinished
		? 'code-davinci-002'
		: 'code-cushman-001';
}

/**
 * Returns the stops based on whether the block is opened
 * @param {block} block - the block to get the stops for
 * @returns {array} - an array of stops
 */
function getStops(block) {
	return block.isOpened ? [block.language.brackets.close] : ['\n\n\n'];
}

/**
 * @param {block} block - The block being passed in.
 * @return {Parameters} parameters - The parameters being returned.
 */
function blocksToParameters(block) {
	let blocksSize = block.code.length;

	const complexity = complexityFromSize(blocksSize);
	const samples = samplesFromBlockComplexity(complexity);
	const parameters = new Parameters({
		samples: samples,
		temperature: temperatureFromSamples(samples),
		engine: getEngine(block),
		// stops: getStops(block),
		prompt: block.code,
		language: block.language.id
	});

	return parameters;
}

module.exports = blocksToParameters;
