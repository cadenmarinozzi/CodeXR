/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const TermsService = require('./termsService');
const vscode = require('vscode');
const { registerInlineProvider } = require('./inlineProvider');
const completionProvider = require('./completionProvider');
const { createUser, isUser, setUserContext } = require('./user');

function preActivationEvents(context) {
	setUserContext(context);

	if (!isUser()) {
		createUser();
	}

	vscode.window.showInformationMessage('CodeXR is now active!');
}

async function activate(context) {
	const termsService = new TermsService(context);
	// Make sure the user has agreed to the terms of service
	while (!termsService.getAgreementStatus()) {
		await termsService.promptUserToAgree();
	}

	preActivationEvents(context);
	registerInlineProvider(completionProvider);
}

module.exports = { activate };
