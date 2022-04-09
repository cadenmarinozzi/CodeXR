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
	let comment = languages[language].comment;
	if (!comment) comment = languages.default;

	return code.includes(comment);
}

/**
 * Returns the context of the text document with respect to the position 
 * @param {TextDocument} document 
 * @param {Position} position 
 * @returns {String} context
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

	return [ prefix, suffix ];
}

/**
 * @async
 * @function getCompletions
 * @returns {Promise<vscode.CompletionList>}
 * @description Asynchronously returns a list of code completions for the current active text editor
 */
async function getCompletions(context) {
	// Get the current user
	let user = context.globalState.get('user');

	if (!user) {
		user = uuid4();
		context.globalState.update('user', user);
	}

	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	const document = editor.document;
	const cursorPosition = editor.selection.active;

	// If a cached completion exists, don't query the API again, just return the cached completion
	const queryText = getLineText(document, cursorPosition);
	const cachedCompletion = cache.getCachedCompletion(context, queryText);

	if (cachedCompletion) return cachedCompletion;

	// Retrieve the context and query the API
	const [ prefix, suffix ] = getContext(document, cursorPosition);
	const completion = await query({
		prefix: prefix,
		suffix: suffix,
		user: user,
		language: document.languageId,
		query: queryText
	});

	const completionCode = completion.text();

	if (completion.finish_reason === 'length') {
		vscode.window.showInformationMessage('The query is too long!');

		return;
	}

	// Cache the generated completion
	cache.cacheCompletion(context, queryText, completionCode);

	return completionCode;
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
	let statusBarItem = createStatusBarItem('codexr.query', 'CodeXR', 'CodeXR');

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

				if (
					formatter.languages.includes(
						document.languageId.toLowerCase()
					)
				)
					completion = formatter.prettier(completion);

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

	context.subscriptions.push(queryDisposable);
	context.subscriptions.push(statusBarItem
	);
}

module.exports = { activate, deactivate: () => {} };
