/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

// const fs = require('fs');

/**
 * @function cacheCompletion
 * @param {string} prompt
 * @param {string} completion
 */
function cacheCompletion(prompt, completion) {
	context.globalState.update(prompt, completion);
}

/**
 * Gets cached completion results from the global state.
 *
 * @param {string} prompt - The current prompt.
 * @returns {string} - Cached completion results.
 */
function getCachedCompletion(prompt) {
	return context.globalState.get(prompt);
}

module.exports = { cacheCompletion, getCachedCompletion };
