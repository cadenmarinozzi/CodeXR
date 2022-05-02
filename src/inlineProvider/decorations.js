/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { getEditor } = require('../editor');
const vscode = require('vscode');

let decorationTypes = [];

/**
 * Creates a text editor decoration type
 * @param {string} text - The text to display after the decoration
 * @returns {vscode.TextEditorDecorationType} - The new decoration type
 */
function createDecorationType(text) {
	// Create a decoration type for the given text
	const decorationType = vscode.window.createTextEditorDecorationType({
		after: {
			contentText: text,
			color: `rgb(90, 90, 90)`
		}
	});
	// Add the decoration type to the list of decoration types

	decorationTypes.push(decorationType);

	return decorationType;
}

/**
 * Clears the decoration types from the editor.
 */
function clearDecorationTypes() {
	const editor = getEditor();
	// If there is no editor, there is nothing to do
	if (!editor) return;

	// Clear all decorations

	// Clear the list of decoration types
	decorationTypes.forEach(decorationType => {
		editor.setDecorations(decorationType, []);
	});

	decorationTypes = [];
}

/**
 * Sets inline decorations for a given decoration type and range.
 * @param {string} decorationType - The decoration type.
 * @param {Range} range - The range to apply the decoration to.
 */
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
