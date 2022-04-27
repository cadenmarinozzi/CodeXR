const vscode = require('vscode');

let globalContext;

class TermsService {
	constructor(context) {
		this.termsOfServiceUrl =
			'https://raw.githubusercontent.com/nekumelon/CodeXR/main/TERMS.md';
		globalContext = context;
	}

	getAgreementStatus() {
		return globalContext.globalState.get('codexr-tos-agreed');
	}

	updateAgreementStatus(status) {
		return globalContext.globalState.update('codexr-tos-agreed', status);
	}

	async promptUserToAgree() {
		const userResponse = await vscode.window.showWarningMessage(
			`Do you agree to the [terms of use](${this.termsOfServiceUrl})?`,
			'Agree',
			'Disagree'
		);

		this.updateAgreementStatus(userResponse === 'Agree');
	}
}

module.exports = TermsService;
