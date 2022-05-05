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
const StatusBar = require('../statusBar');

const config = getConfig();
const statusBar = new StatusBar({
	text: 'CodeXR'
});

/**
 * @function getPromptParts
 * @param {document} document
 * @returns {Array} [prefix, cursor, suffix]
 */
function getPromptParts(document) {
	// Get the editor
	const editor = getEditor();
	if (!editor) return;
	// Get the cursor position

	const cursorPosition = editor.selection.active;
	// Get the text from the cursor to the end of the line

	const cursor = document.getText(
		new Range(
			cursorPosition.with(undefined, 0),
			// Get the text from the start of the file to the cursor
			cursorPosition.with(undefined, 10000)
		)
	);
	// Get the text from the end of the line to the end of the file

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

/**
 * Gets the main block
 * @param {array} cursorBlocks - the blocks that the cursor is on
 * @param {array} prefixBlocks - the blocks that come before the cursor
 * @returns {object} - the main block
 */
function getMainBlock(cursorBlocks, prefixBlocks) {
	return cursorBlocks.length === 0
		? prefixBlocks[prefixBlocks.length - 1]
		: cursorBlocks[0];
}

/**
 * This is the completionProvider function. It provides autocomplete suggestions based on the current cursor position.
 *
 * @param {string} document The current document
 * @param {string} prefix The text before the cursor
 * @param {string} cursor The text at the cursor
 * @param {string} suffix The text after the cursor
 * @param {string} language The language of the document
 * @returns {array} The autocomplete suggestions
 */
async function completionProvider() {
	const document = getDocument();
	if (!document) return;

	statusBar.text = '$(loading~spin)';
	statusBar.update();

	const [prefix, cursor, suffix] = getPromptParts(document);
	const language = languages[document.languageId.toLowerCase()];
	const prefixBlocks = parser(prefix, language).getBlocks();
	const cursorBlocks = parser(cursor, language).getBlocks();
	const suffixBlocks = parser(suffix, language).getBlocks();

	const mainBlock = getMainBlock(cursorBlocks, prefixBlocks);

	if (!mainBlock || mainBlock.isClosed) {
		const completionParams = new Parameters({
			singleLine: true,
			engine: 'code-cushman-001',
			samples: 3,
			context: [prefix, suffix],
			prompt: prefix
		});

		const completion = await query(completionParams);

		statusBar.reset();

		return completion.completion;
	}

	let completionParams = blocksToParameters(mainBlock);

	completionParams.singleLine = true;
	completionParams.context = [prefixBlocks, suffixBlocks];
	completionParams.update();

	console.log(completionParams);

	const singlelineCompletion = await query(completionParams);
	console.log(singlelineCompletion);

	if (!mainBlock.isOpened && singlelineCompletion?.completion) {
		statusBar.reset();

		return singlelineCompletion.completion;
	}

	completionParams = blocksToParameters(mainBlock); // Reset the stops

	completionParams.context = [prefixBlocks, suffixBlocks];
	completionParams.singleLine = false;
	completionParams.timeout = 3.5;
	completionParams.update();

	const multiLineCompletion = await query(completionParams);
	console.log(multiLineCompletion);

	if (!multiLineCompletion?.completion || !singlelineCompletion?.completion) {
		statusBar.reset();

		return;
	}

	if (multiLineCompletion.timedout && !singlelineCompletion.timedout) {
		statusBar.reset();

		return singlelineCompletion.completion;
	}

	statusBar.reset();

	return multiLineCompletion.completion;
}

module.exports = completionProvider;
