/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');
const query = require('./query');
const { v4: uuid4 } = require('uuid');
const tinygradient = require('tinygradient');
const formatter = require('./formatter');
const cache = require('./completionCache');
const languages = require('./languages');

/**
 * @param {Document} document
 * @param {Position} position
 */
function getLineText(document, position) {
	// Get the text of the line that the position is on
	return document.getText(
		new vscode.Range(position.with(undefined, 0), position)
	);
}

/**
 * @function getLanguageComment
 * @param {string} code - the code to check
 * @param {string} language - the language to check
 * @returns {boolean} - true if the code includes the comment for the given language, false otherwise
 */
function getLanguageComment(code, language) {
	let languageDetails = languages[language];
	if (!languageDetails) languageDetails = languages.default;

	return code.includes(languageDetails.comment);
}

/**
 * Gets a language function.
 * @param {string} code - The code to be evaluated.
 * @param {string} language - The language to be evaluated.
 * @return {boolean} Whether or not the code includes the function name.
 */
function getLanguageFunction(code, language) {
	let languageDetails = languages[language.toLowerCase()];
	if (!languageDetails) languageDetails = languages.default;

	return code.includes(languageDetails.function);
}

/**
 * @param {document} The document to get the context from
 * @param {position} The position in the document
 * @returns {string} A string containing the context
 */
function getContext(document, position) {
	const lastLine = document.lineCount - 1;
	if (lastLine < 2) return '';

	let prefix = '';
	let suffix = '';

	if (position.line > 1) {
		// Get the range of the previous lines
		const firtLinePosition = document.lineAt(0).range.start;
		const lineBeforeCursorPosition = document.lineAt(position.line - 1)
			.range.end;

		const previousRange = new vscode.Range(
			firtLinePosition,
			lineBeforeCursorPosition
		);

		if (document.validateRange(previousRange))
			prefix = document.getText(previousRange);
	}

	if (position.line !== lastLine) {
		// Get the range of the following lines
		const lineAfterCursorPosition = document.lineAt(position.line + 1).range
			.end;
		const lastLinePosition = new vscode.Position(
			lastLine,
			document.lineAt(lastLine).range.end.character
		);

		const postRange = new vscode.Range(
			lineAfterCursorPosition,
			lastLinePosition
		);

		if (document.validateRange(postRange))
			suffix = document.getText(postRange);
	}

	// Combine the previous and following lines

	return prefix + '\n' + suffix;
}

/**
 * @async
 * @function getCompletions
 * @returns {Promise<vscode.CompletionList>}
 * @description Asynchronously returns a list of code completions for the current active text editor
 */
async function getCompletions(context) {
	// Get the userId from the global state
	let user = context.globalState.get('user');

	if (!user) {
		user = uuid4();
		context.globalState.update('user', user);
	}

	const editor = vscode.window.activeTextEditor;
	if (!editor) return;
	// Get the text of the line the cursor is on

	const document = editor.document;
	const cursorPosition = editor.selection.active;
	const queryText = getLineText(document, cursorPosition);

	const cachedCompletion = cache.getCachedCompletion(context, queryText);
	if (cachedCompletion) return cachedCompletion;

	const contextCode = getContext(document, cursorPosition);
	const completions = await query({
		context: contextCode,
		user: user,
		language: document.languageId,
		query: queryText
	});

	let completion = completions[0];
	cache.cacheCompletion(context, queryText, completion);

	return completion;
}

/**
 * Creates a status bar item.
 * @param {string} command - The command to run when the status bar item is clicked.
 * @param {string} text - The text to display in the status bar item.
 * @returns {vscode.StatusBarItem} - The created status bar item.
 */
function createStatusBarItem(command, text) {
	let statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		0
	);
	statusBarItem.text = text;
	statusBarItem.command = command;
	statusBarItem.show();

	const gradient = tinygradient('#FF1F40', '#428CFF', '#4A45FF');
	let timeStep = 0.001;
	let time = 0.001;

	function update() {
		if (time + timeStep >= 1 || time + timeStep <= 0) timeStep = -timeStep;
		time += timeStep;
		statusBarItem.color = gradient.rgbAt(time).toString();

		setTimeout(update, 10);
	}

	update();

	return statusBarItem;
}

function activate(context) {
	const statusBarItem = createStatusBarItem(
		'codexr.query',
		'CodeXR',
		'CodeXR'
	);

	const queryDisposable = vscode.commands.registerCommand(
		'codexr.query',
		async () => {
			try {
				const editor = vscode.window.activeTextEditor;
				if (!editor) return;

				const document = editor.document;
				const position = editor.selection.active;

				statusBarItem.text = '$(sync~spin)';

				let completion = await getCompletions(context);
				if (!completion) return;

				if (completion.finish_reason === 'length') {
					vscode.window.showInformationMessage(
						'The query is too long!'
					);

					return;
				}

				if (
					formatter.languages.includes(
						document.languageId.toLowerCase()
					)
				) {
					try {
						completion = formatter.prettier(completion);
					} catch (err) {}
				}

				// Insert the code into the editor
				editor.edit(editBuilder => {
					statusBarItem.text = 'CodeXR';
					editBuilder.insert(position, completion); // Format the completion
				});
			} catch (err) {
				vscode.window.showErrorMessage(err.message);
				console.error(
					`An error occured while trying to query the CodeXR API: ${err}`
				);
			}
		}
	);

	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(queryDisposable);
}

module.exports = { activate, deactivate: () => {} };
