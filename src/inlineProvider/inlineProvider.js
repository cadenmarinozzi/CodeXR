/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');
const decorations = require('./decorations');
const { getEditor } = require('../editor');
const getConfig = require('../config');

const config = getConfig();

/**
 * prepareCompletion
 * @param {string} completion
 * @returns {string}
 */
function prepareCompletion(completion) {
	const editor = getEditor();
	if (!editor) return;
	// Get the editor

	// If there is no editor, return
	const tabSize = parseInt(editor.options.tabSize);

	return (
		completion
			// Get the tab size from the editor
			.replace(' ', '\u00a0')
			.replace('\t', '\u00a0'.repeat(tabSize))
	);
	// Replace spaces with non-breaking spaces
}
// Replace tabs with non-breaking spaces

/**
 * Determines if a given text is a tab event
 * @param {string} text - the text to be checked
 * @returns {boolean} - true if the given text is a tab event, false otherwise
 */
function isTabEvent(text) {
	const editor = getEditor();
	if (!editor) return;
	// If the editor is not open, we can't do anything

	const tabSize = parseInt(editor.options.tabSize);
	// Get the tab size from the editor

	return (
		// Check if the text is a tab
		text === '\t' ||
		text === '  ' ||
		text === '   ' || // Ughhhh
		text === '    ' ||
		text === ' '.repeat(tabSize)
	);
}

let lastCompletion;

/**
 * Accepts the last completion from the editor.
 */
async function acceptLastCompletion() {
	decorations.clearDecorationTypes();

	// If there is no editor, there is nothing to do
	const editor = getEditor();
	if (!editor) return;

	// Insert the last completion at the cursor
	await editor.edit(editBuilder => {
		editBuilder.insert(editor.selection.active, lastCompletion);
	});
}

/**
 * Remove the content change from the editor
 * @param {Object} contentChange the range and text to remove
 * @returns {Promise}
 */
async function removeContentChange(contentChange) {
	const editor = getEditor();
	if (!editor) return;

	return await editor.edit(editBuilder => {
		editBuilder.replace(
			// The line number is not changed
			contentChange.range.with(
				contentChange.range.start.with(
					undefined,
					contentChange.range.start.character
					// The line number is not changed
				),
				contentChange.range.start.with(
					undefined,
					contentChange.range.start.character +
						contentChange.text.length
				)
			),
			''
		);
	});
}

/**
 * Registers an inline provider
 * @param {function} inlineProvider - The inline provider to register
 */
function registerInlineProvider(inlineProvider) {
	vscode.workspace.onDidChangeTextDocument(async event => {
		const editor = getEditor();
		if (!editor) return;

		const supportedLanguages = config.get('supported_languages');

		if (
			!supportedLanguages.includes(
				event.document.languageId.toLowerCase()
			)
		) {
			return;
		}

		const contentChange = event.contentChanges?.[0];
		if (!contentChange?.text) return;

		const changedText = contentChange.text;
		if (!changedText) return;

		if (isTabEvent(changedText)) {
			if (!lastCompletion) return;

			await removeContentChange(contentChange);
			await acceptLastCompletion();

			lastCompletion = null;

			return;
		}

		const completion = await inlineProvider();
		if (!completion) return;

		lastCompletion = completion;

		const lines = completion.split('\n');
		const cursorPosition = editor.selection.active;

		decorations.clearDecorationTypes();

		lines.forEach((line, lineNumber) => {
			const insertText = prepareCompletion(line);

			const decorationType = decorations.createDecorationType(insertText);
			const lineRange = new vscode.Range(
				new vscode.Position(
					cursorPosition.line + lineNumber,
					cursorPosition.character
				),
				new vscode.Position(
					cursorPosition.line + lineNumber,
					cursorPosition.character + line.length
				)
			);

			decorations.setInlineDecoration(decorationType, lineRange);
		});
	});
}

module.exports = { registerInlineProvider };
