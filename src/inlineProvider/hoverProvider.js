/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');

function createHoverProvider(markdownText, range) {
	vscode.languages.registerHoverProvider('javascript', {
		provideHover() {
			return new vscode.Hover(
				new vscode.MarkdownString(markdownText, true),
				range
			);
		}
	});
}

module.exports = { createHoverProvider };
