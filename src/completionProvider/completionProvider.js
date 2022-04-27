/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { Range, Position } = require('vscode');
const { getDocument, getEditor } = require('../editor');
const { parser, blocksToParameters } = require('../parser');
const languages = require('../parser/languages');
const Parameters = require('../parameters');
const query = require('../query');
const getConfig = require('../config');

const config = getConfig();

function getPromptParts(document) {
	const editor = getEditor();
	if (!editor) return;

	const cursorPosition = editor.selection.active;

	const cursor = document.getText(
		new Range(
			cursorPosition.with(undefined, 0),
			cursorPosition.with(undefined, 10000)
		)
	);

	const prefix = document.getText(
		new Range(new Position(0, 0), cursorPosition.with(undefined, 10000))
	);

	const suffix = document.getText(
		new Range(
			new Position(cursorPosition.line + 1, 0),
			new Position(document.lineCount - 1, 10000)
		)
	);

	return [prefix, cursor, suffix];
}

function getMainBlock(cursorBlocks, prefixBlocks) {
	return cursorBlocks.length === 0
		? prefixBlocks[prefixBlocks.length - 1]
		: cursorBlocks[0];
}

async function completionProvider() {
	const document = getDocument();
	if (!document) return;

	const [prefix, cursor, suffix] = getPromptParts(document);
	const language = languages[document.languageId.toLowerCase()];
	const prefixBlocks = parser(prefix, language).getBlocks();
	const cursorBlocks = parser(cursor, language).getBlocks();
	const suffixBlocks = parser(suffix, language).getBlocks();

	let completionParams = blocksToParameters(
		getMainBlock(cursorBlocks, prefixBlocks)
	);
	completionParams.singleLine = true;
	completionParams.context = [prefixBlocks, suffixBlocks];

	const singlelineCompletion = await query(completionParams);

	completionParams.singleLine = false;
	completionParams.timeout = 1.5;
	const multiLineCompletion = await query(completionParams);
	console.log(singlelineCompletion, multiLineCompletion);

	if (multiLineCompletion?.timedout && !singlelineCompletion?.timedout) {
		return singlelineCompletion.completion;
	}

	return multiLineCompletion.completion;
}

module.exports = completionProvider;
