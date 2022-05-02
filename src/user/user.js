/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { v4: uuid } = require('uuid');

let globalContext;

/**
 * @function setUserContext
 * @param {object} context - The context to set as the global context
 * @description Sets the global context
 */
function setUserContext(context) {
	globalContext = context;
}

/**
 * @function createUser
 * @returns {string} - a new user ID
 */
function createUser() {
	// Generate a random user ID
	const user = uuid();

	// Store the user ID in the global state
	globalContext.globalState.update('user', user);

	return user;
}

/**
 * Checks if the user is logged in.
 * @returns {boolean}
 */
function isUser() {
	return globalContext.globalState.get('user') !== undefined;
}

/**
 * getUser
 * @returns {object} The current user object stored in globalContext.globalState
 */
function getUser() {
	return globalContext.globalState.get('user');
}

module.exports = { createUser, isUser, getUser, setUserContext };
