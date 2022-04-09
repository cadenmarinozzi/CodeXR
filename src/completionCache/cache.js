/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

// const fs = require('fs');

/**
 * @function cacheCompletion
 * @param {vscode.Contex} context
 * @param {string} prompt
 * @param {string} completion
 */
function cacheCompletion(context, prompt, completion) {
	context.globalState.update(prompt, completion);
}

/**
 * Gets cached completion results from the global state.
 * @param {vscode.Contex} context
 * @param {string} prompt - The current prompt.
 * @returns {string} - Cached completion results.
 */
function getCachedCompletion(context, prompt) {
	return context.globalState.get(prompt);
}

module.exports = { cacheCompletion, getCachedCompletion };
