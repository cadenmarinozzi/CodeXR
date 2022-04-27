/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');

function getEditor() {
	return vscode.window.activeTextEditor;
}

function getDocument() {
	const editor = getEditor();
	if (!editor) return;

	return editor.document;
}

module.exports = { getEditor, getDocument };
