/**
 * @function userHasAgreed
 * @param {Object} context
 * @return {boolean}
 */
function userHasAgreed(context) {
	return context.globalState.get('agreedToTOS') === true;
}

/**
 * Updates the agreedToTOS global state in the provided context.
 * @param {vscode.ExtensionContext} context The extension context.
 * @param {boolean} value The new value for the global state.
 */
function updateAgreement(context, value) {
	context.globalState.update('agreedToTOS', value);
}

const termsOfServiceUrl =
	'https://raw.githubusercontent.com/nekumelon/CodeXR/main/TERMS.md';

module.exports = { updateAgreement, userHasAgreed, termsOfServiceUrl };
