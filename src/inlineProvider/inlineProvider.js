const vscode = require('vscode');
const decorations = require('./decorations');
const { getEditor } = require('../editor');
const getConfig = require('../config');

const config = getConfig();

function prepareCompletion(completion) {
	const editor = getEditor();
	if (!editor) return;

	const tabSize = parseInt(editor.options.tabSize);

	return completion
		.replace(' ', '\u00a0')
		.replace('\t', '\u00a0'.repeat(tabSize));
}

function isTabEvent(text) {
	const editor = getEditor();
	if (!editor) return;

	const tabSize = parseInt(editor.options.tabSize);

	return (
		text === '\t' ||
		text === '  ' ||
		text === '   ' || // Ughhhh
		text === '    ' ||
		text === ' '.repeat(tabSize)
	);
}

let lastCompletion;

async function acceptLastCompletion() {
	decorations.clearDecorationTypes();

	const editor = getEditor();
	if (!editor) return;

	await editor.edit(editBuilder => {
		editBuilder.insert(editor.selection.active, lastCompletion);
	});
}

async function removeContentChange(contentChange) {
	const editor = getEditor();
	if (!editor) return;

	return await editor.edit(editBuilder => {
		editBuilder.replace(
			contentChange.range.with(
				contentChange.range.start.with(
					undefined,
					contentChange.range.start.character
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
