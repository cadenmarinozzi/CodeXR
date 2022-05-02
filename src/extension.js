/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const TermsService = require('./termsService');
const vscode = require('vscode');
const { registerInlineProvider } = require('./inlineProvider');
const completionProvider = require('./completionProvider');
const { createUser, isUser, setUserContext } = require('./user');

/**
 * preActivationEvents - Runs code before the CodeXR extension is activated
 *
 * @param {Object} context - an object containing the context of the CodeXR extension
 */
function preActivationEvents(context) {
	setUserContext(context);
	// If the user is not logged in, create a new user

	if (!isUser()) {
		// Show a message to the user
		createUser();
	}

	vscode.window.showInformationMessage('CodeXR is now active!');
}

/**
 * @param {!vscode.ExtensionContext} context
 */
async function activate(context) {
	// Create a new instance of the TermsService
	const termsService = new TermsService(context);
	// Make sure the user has agreed to the terms of service
	while (!termsService.getAgreementStatus()) {
		await termsService.promptUserToAgree();
		// Do some other stuff
	}

	preActivationEvents(context);
	registerInlineProvider(completionProvider);
}

module.exports = { activate };
