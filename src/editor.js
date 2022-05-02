/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');

/**
 * Returns the active text editor.
 * @returns {vscode.window.activeTextEditor}
 */
function getEditor() {
	return vscode.window.activeTextEditor;
}

/**
 * @function getDocument
 * @description This function will get the document from the editor.
 * @returns {Object} Returns the document from the editor.
 */
function getDocument() {
	// Get the editor
	const editor = getEditor();
	// If there is no editor, return
	if (!editor) return;
	// Otherwise, return the editor's document

	return editor.document;
}

module.exports = { getEditor, getDocument };
