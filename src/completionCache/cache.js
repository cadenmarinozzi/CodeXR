/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

/**
 * Returns the cached completions for the current context.
 * @param {Object} context - The current context.
 * @returns {Array} The cached completions.
 */
function getCachedCompletions(context) {
	return context.globalState.get('completionCache');
}

/**
 * @function getCachedCompletion
 * @param {object} context
 * @param {string} prompt
 * @returns {object}
 */
function getCachedCompletion(context, prompt) {
	return getCachedCompletions(context)[prompt];
}

/**
 * Sets the cached completions for the given context.
 * @param {Object} context - The context to update.
 * @param {Object[]} cachedCompletions - The cached completions.
 */
function setCachedCompletions(context, cachedCompletions) {
	context.globalState.update('completionCache', cachedCompletions);
}

/**
 * @function cacheCompletion
 * @param {vscode.Contex} context
 * @param {string} prompt
 * @param {string} completion
 */
function cacheCompletion(context, prompt, completion) {
	const completionsCache = getCachedCompletions(context);
	completionsCache[prompt] = completion;

	setCachedCompletions(context, completionsCache);
}

/**
 * Reset the completion cache.
 * @param {object} context - The context in which to reset the completion cache.
 */
function resetCompletionCache(context) {
	setCachedCompletions(context, {});
}

/**
 * @function initCompletionsCache
 * @param {object} context
 */
function initCompletionsCache(context) {
	context.globalState.update('completionsCache', {});
}

/**
 * completionCacheExists
 * @param {Object} context
 * @returns {boolean}
 */
function completionCacheExists(context) {
	return context.globalState.get('completionsCache') !== undefined;
}

module.exports = {
	cacheCompletion,
	getCachedCompletion,
	resetCompletionCache,
	initCompletionsCache,
	completionCacheExists
};
