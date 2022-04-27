const { v4: uuid } = require('uuid');

let globalContext;

function setUserContext(context) {
	globalContext = context;
}

function createUser() {
	const user = uuid();
	globalContext.globalState.update('user', user);

	return user;
}

function isUser() {
	return globalContext.globalState.get('user') !== undefined;
}

function getUser() {
	return globalContext.globalState.get('user');
}

module.exports = { createUser, isUser, getUser, setUserContext };
