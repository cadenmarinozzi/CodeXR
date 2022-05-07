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
	if (!document || document.getText() === '') return;

	statusBar.text = '$(loading~spin)';
	statusBar.update();

	// Get the parts of the document
	const [prefix, cursor, suffix] = getPromptParts(document);

	// Get the document language
	const language = languages[document.languageId.toLowerCase()];

	// Parse the blocks in the prefix, cursor, and suffix
	const prefixBlocks = parser(prefix, language).getBlocks();
	const cursorBlocks = parser(cursor, language).getBlocks();
	const suffixBlocks = parser(suffix, language).getBlocks();

	const mainBlock = getMainBlock(cursorBlocks, prefixBlocks);

	if (!mainBlock || mainBlock.isClosed) {
		// If there arent any blocks in the code or the main block is closed
		const completionParams = new Parameters({
			singleLine: true,
			engine: 'code-cushman-001',
			samples: 3,
			context: [prefix, suffix],
			prompt: prefix,
			language: language.id
		});

		const completion = await query(completionParams);

		statusBar.reset();

		if (completion?.timedout) {
			return;
		}

		return completion?.completion;
	}

	let completionParams = blocksToParameters(mainBlock);

	completionParams.singleLine = true;
	completionParams.context = [prefixBlocks, suffixBlocks];
	completionParams.update();

	// Generate a single line completion
	const singlelineCompletion = await query(completionParams);

	// If the main block isn't opened, generate a single line to open the block
	// example: function fibona -> cci() {
	if (!mainBlock.isOpened && singlelineCompletion?.completion) {
		statusBar.reset();

		return singlelineCompletion?.completion;
	}

	// At this point we have a main block, it's open, and we have a single line completion
	// example: function fibonacci() { -> \n ... }

	completionParams = blocksToParameters(mainBlock); // Reset the stops

	// Allocate 3.5 seconds for a multi line completion
	completionParams.context = [prefixBlocks, suffixBlocks];
	completionParams.singleLine = false;
	completionParams.timeout = 3.5;
	completionParams.update();

	const multiLineCompletion = await query(completionParams);

	statusBar.reset();

	// If both of the requests timed out we return
	if (!multiLineCompletion?.completion || !singlelineCompletion?.completion) {
		return;
	}

	// If onlt the multi line completion timed out return the single line completion
	if (multiLineCompletion?.timedout && !singlelineCompletion?.timedout) {
		return singlelineCompletion?.completion;
	}

	// If none of the completions timed out return the multi line completion
	return multiLineCompletion?.completion;
}

module.exports = completionProvider;
