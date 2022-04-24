const { getLanguageFunction } = require('../languages');

function parse(code, language) {
	// This will be an AST soon, too lazy to do it rn
	const languageFunction = getLanguageFunction(language, code);
	const functions = code.split(languageFunction);
	const lastFunction = functions[functions.length - 1];
	const nOpeningParenthesis = (code.match(/{/g) || []).length;
	const nClosingParenthesis = (code.match(/}/g) || []).length;
	const isClosed = nOpeningParenthesis === nClosingParenthesis; // If the function is closed

	return [lastFunction, isClosed];
}

module.exports = { parse };
