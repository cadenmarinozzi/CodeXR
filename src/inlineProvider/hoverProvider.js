/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');

/**
 * Registers a hover provider for the 'javascript' language.
 *
 * @param {string} markdownText - The markdown text to display in the hover.
 * @param {vscode.Range} range - The range to which the hover applies.
 */
function createHoverProvider(markdownText, range) {
	// Register a hover provider for JavaScript files
	vscode.languages.registerHoverProvider('javascript', {
		// Provide a hover for the given range
		provideHover() {
			// Return a hover with the given markdown text and range
			return new vscode.Hover(
				new vscode.MarkdownString(markdownText, true),
				range
			);
		}
	});
}

module.exports = { createHoverProvider };
