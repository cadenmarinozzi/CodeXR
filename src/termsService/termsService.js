/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');

let globalContext;

class TermsService {
	constructor(context) {
		this.termsOfServiceUrl =
			'https://raw.githubusercontent.com/nekumelon/CodeXR/main/TERMS.md';
		globalContext = context;
	}

	/**
	 * Returns the current status of the user agreement
	 * @return {bool} - true if the user has agreed, false if not
	 */
	getAgreementStatus() {
		return globalContext.globalState.get('codexr-tos-agreed');
	}

	/**
	 * @function updateAgreementStatus
	 * @param {string} status
	 * @returns {Promise}
	 * @description Updates the codexr-tos-agreed globalState key with the given status
	 */
	updateAgreementStatus(status) {
		return globalContext.globalState.update('codexr-tos-agreed', status);
	}

	/**
	 * Prompt the user to agree to the terms of use.
	 * @returns {Promise} - A promise that resolves with the user's response.
	 */
	async promptUserToAgree() {
		// Show a warning message to the user
		const userResponse = await vscode.window.showWarningMessage(
			`Do you agree to the [terms of use](${this.termsOfServiceUrl})?`,
			'Agree',
			'Disagree'
			// Update the agreement status based on the user's response
		);

		this.updateAgreementStatus(userResponse === 'Agree');
	}
}

module.exports = TermsService;
