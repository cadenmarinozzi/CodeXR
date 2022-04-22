/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');
const debounce = require('../debounce');

let decorationTypes = [];

/**
 * @param {string} text
 * @return {vscode.TextEditorDecorationType}
 */
function createInlineDecorationType(text) {
	const decorationType = vscode.window.createTextEditorDecorationType({
		after: {
			contentText: text,
			color: 'rgb(90, 90, 90)'
		}
	});

	decorationTypes.push(decorationType);

	return decorationType;
}

/**
 * Creates a new vscode.Range decoration.
 * @param {vscode.Position} initialPosition - The initial position for the decoration.
 * @param {string} text - The text to display in the decoration.
 * @returns {vscode.Range} - The new vscode.Range decoration.
 */
function createInlineDecorationRange(initialPosition, text) {
	return new vscode.Range(
		initialPosition,
		initialPosition.with(undefined, text.length)
	);
}

/**
 * Sets an inline decoration on the active text editor.
 * @param {vscode.TextEditorDecorationType} decorationType The decoration type.
 * @param {vscode.Range} range The range to decorate.
 */
function setInlineDecoration(decorationType, range) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	editor.setDecorations(decorationType, [range]);
}

/**
 * @function setInlineDecorationText
 * @param {string} text - A string of text to decorate
 * @description Decorates a string of text line by line with an inline decoration.
 */
function setInlineDecorationText(text) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	const cursorPosition = editor.selection.active;

	for (const [lineNumber, line] of text.split('\n').entries()) {
		const range = createInlineDecorationRange(cursorPosition, line);

		setInlineDecoration(createInlineDecorationType(line), range);
	}
}

/**
 * Clears all inline decorations from the active text editor.
 */
function clearInlineDecorations() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	for (const decorationType of decorationTypes) {
		editor.setDecorations(decorationType, []);
	}

	decorationTypes = [];
}

const changesIgnore = [' ', ''];

let currentInlineText = '';

/**
 * Registers an inline decoration provider.
 * @param {function} textProvider A function that provides the text for the inline decoration.
 */
function registerInlineDecorationProvider(textProvider) {
	async function decorationProvider(event) {
		const contentChanges = event.contentChanges[0];
		const contentChanged = contentChanges.text;

		if (changesIgnore.includes(contentChanged)) return;
		if (event.document.lineCount < 1) return;

		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const tabSize = parseInt(editor.options.tabSize);

		// Accept the completion when tab is pressed
		if (
			contentChanged === ' '.repeat(tabSize) ||
			contentChanged === ' '.repeat(tabSize - 1) ||
			contentChanged === '  ' ||
			contentChanged === '   '
		) {
			// Weird edge cases
			const contentChangeRange = contentChanges.range;

			editor.edit(editBuilder => {
				editBuilder.insert(contentChangeRange.end, currentInlineText);
			});

			editor.edit(editBuilder => {
				editBuilder.replace(
					new vscode.Range(
						new vscode.Position(
							contentChangeRange.end.line,
							contentChangeRange.end.character -
								contentChanged.length
						),
						contentChangeRange.end
					),
					''
				);
			});

			clearInlineDecorations();

			return;
		}

		clearInlineDecorations();

		const generated = await textProvider(event.document);
		if (!generated) return;

		currentInlineText = generated;

		setInlineDecorationText(generated);
	}

	vscode.workspace.onDidChangeTextDocument(event => {
		debounce(decorationProvider, 100)(event);
	});
}

module.exports = { registerInlineDecorationProvider };
