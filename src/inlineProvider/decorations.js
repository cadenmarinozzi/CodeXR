/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { getEditor } = require('../editor');
const vscode = require('vscode');

let decorationTypes = [];

function createDecorationType(text) {
	const decorationType = vscode.window.createTextEditorDecorationType({
		after: {
			contentText: text,
			color: `rgb(90, 90, 90)`
		}
	});

	decorationTypes.push(decorationType);

	return decorationType;
}

function clearDecorationTypes() {
	const editor = getEditor();
	if (!editor) return;

	decorationTypes.forEach(decorationType => {
		editor.setDecorations(decorationType, []);
	});

	decorationTypes = [];
}

function setInlineDecoration(decorationType, range) {
	const editor = getEditor();
	if (!editor) return;

	editor.setDecorations(decorationType, [range]);
}

module.exports = {
	clearDecorationTypes,
	createDecorationType,
	setInlineDecoration
};
