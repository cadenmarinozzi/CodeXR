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
const { getLanguageComment } = require('./languages');
const debounce = require('./debounce');
const termsService = require('./termsService');
const inlineProvider = require('./inlineProvider');
const logger = require('./logger');

const config = vscode.workspace.getConfiguration('codexr');

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
 * Returns the character at the given position in the document
 * @param {document} document - The given document
 * @param {position} position - The given position in the document
 * @return {String} - The character at the given position
 */
function getCharacterText(document, position) {
	// Get the text of the document at the given position
	return document.getText(new vscode.Range(position, position));
}

/**
 * @function getRangeText
 * @param {document} document - The document from which to retrieve text
 * @param {range} range - The range of text to retrieve from the document
 */
function getRangeText(document, range) {
	return document.getText(range);
}

/**
 * @param {document} document The document to get the context from
 * @param {position} position The position in the document
 * @returns {string} A string containing the context
 */
function getContext(document, position) {
	// const lastLine = document.lineCount;
	// if (lastLine === 1) return '';

	// const cursorLine = position.line + 1;

	// let prefix = '';
	// let suffix = '';

	// if (cursorLine > 1) {
	// 	// Get the range of the previous lines
	// 	const firstLinePosition = document.lineAt(0).range.start;
	// 	const lineBeforeCursorPosition = document.lineAt(position.line - 1)
	// 		.range.end;

	// 	const previousRange = new vscode.Range(
	// 		firstLinePosition,
	// 		lineBeforeCursorPosition
	// 	);

	// 	if (document.validateRange(previousRange)) {
	// 		prefix = document.getText(previousRange);
	// 	}
	// }

	// if (cursorLine !== lastLine) {
	// 	// Get the range of the following lines
	// 	const lineAfterCursorPosition = document.lineAt(position.line + 1).range
	// 		.end;
	// 	const lastLinePosition = new vscode.Position(
	// 		lastLine,
	// 		document.lineAt(lastLine).range.end.character
	// 	);

	// 	const postRange = new vscode.Range(
	// 		lineAfterCursorPosition,
	// 		lastLinePosition
	// 	);

	// 	if (document.validateRange(postRange)) {
	// 		suffix = document.getText(postRange);
	// 	}
	// }

	// // Combine the previous and following lines

	// return prefix + '\n' + suffix;

	if (document.lineCount === 1) return '';

	const previousRange = new vscode.Range(
		new vscode.Position(0, 0),
		document.lineAt(position.line - 1).range.end
	);

	return document.getText(previousRange);
}

/**
 * Get the user in the globalState
 * @param {object} context The context of the VSCode extension
 * @returns {string} The user's id
 */
function getUser(context) {
	let user = context.globalState.get('user'); // Get the user in the globalState
	if (user) return user;

	user = uuid4(); // Generate a new user
	context.globalState.update('user', user);

	return user;
}

/**
 * @returns {TextEditor}
 */
function getEditor() {
	return vscode.window.activeTextEditor;
}

/**
 * @async
 * @function getCompletions
 * @returns {Promise<vscode.CompletionList>}
 * @description Asynchronously returns a list of code completions for the current active text editor
 */
async function getCompletions(context) {
	// Get the userId from the global state
	const user = getUser(context);

	const editor = getEditor();
	if (!editor) return;
	// Get the text of the line the cursor is on

	const document = editor.document;
	const cursorPosition = editor.selection.active;
	const prompt = getLineText(document, cursorPosition);

	const cachedCompletion = cache.getCachedCompletion(context, prompt);
	// if (cachedCompletion) return cachedCompletion;

	const contextCode = getContext(document, cursorPosition);
	const completions = await debounce(
		query,
		500
	)({
		context: contextCode,
		user: user,
		language: document.languageId,
		prompt: prompt,
		comment: getLanguageComment(document.languageId)
	});

	const completion = completions[0]; // Bad

	if (completion) {
		cache.cacheCompletion(context, prompt, completion);
	}

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
		if (time + timeStep >= 1 || time + timeStep <= 0) {
			timeStep = -timeStep;
		}

		time += timeStep;
		statusBarItem.color = gradient.rgbAt(time).toString();

		setTimeout(update, 10); // ew
	}

	update();

	return statusBarItem;
}

/**
 * Creates a list of completions to be displayed to the user
 * @param {string} completion
 * @param {vscode.Position} cursorPosition
 * @returns {vscode.CompletionList}
 */
function createCompletionsList(completion, cursorPosition, document) {
	let completionItems = [];

	const firstLine = completion.split('\n')[0];

	const range = new vscode.Range(
		new vscode.Position(cursorPosition.line, cursorPosition.character - 1),
		new vscode.Position(cursorPosition.line, cursorPosition.character + 1) // I should use vscode.Position.with
	);

	let completionItem = new vscode.CompletionItem(
		getRangeText(document, range) + firstLine,
		vscode.CompletionItemKind.Snippet
	);
	completionItem.sortText = '001';
	completionItem.insertText = completion;
	completionItem.preselect = true;
	completionItem.range = range;

	completionItems.push(completionItem);

	return new vscode.CompletionList(completionItems);
}

/**
 * @async
 * @function promptTermsAgreement
 * @param {Object} context - The context of the extension
 * @returns {Promise<void>}
 * @description Shows a warning message asking the user to agree to the terms of use,
 * and then updates the agreement in the termsService
 */
async function promptTermsAgreement(context) {
	const response = await vscode.window.showWarningMessage(
		`Do you agree to the [terms of use](${termsService.termsOfServiceUrl})?`,
		...['Agree', 'Disagree']
	);

	termsService.updateAgreement(context, response === 'Agree');
}

/**
 * @async
 * @param {Object} context
 * @param {Object} statusBarItem
 */
async function createCompletion(context, statusBarItem) {
	if (!termsService.userHasAgreed(context)) {
		await promptTermsAgreement(context);

		return;
	}

	if (!cache.completionCacheExists(context)) {
		cache.initCompletionsCache(context);
	}

	const editor = getEditor();
	if (!editor) return;

	const document = editor.document;

	statusBarItem.text = '$(loading~spin)';

	let completion = await getCompletions(context);
	if (!completion) return;

	if (completion.finish_reason === 'length') {
		vscode.window.showInformationMessage('The query is too long!');

		return;
	}

	if (formatter.languages.includes(document.languageId.toLowerCase())) {
		try {
			completion = formatter.prettier(completion);
		} catch (err) {}
	}

	statusBarItem.text = 'CodeXR';

	return completion;
}

async function activate(context) {
	logger.setEnv(
		context.extensionMode === vscode.ExtensionMode.Development ||
			context.extensionMode === vscode.ExtensionMode.Test
			? 'dev'
			: 'prod'
	);

	if (!termsService.userHasAgreed(context)) {
		await promptTermsAgreement(context);
	}

	const statusBarItem = createStatusBarItem(
		'codexr.info',
		'CodeXR',
		'CodeXR'
	);

	const infoDisposable = vscode.commands.registerCommand(
		'codexr.info',
		async () => {
			const action = await vscode.window.showInformationMessage(
				'What would you like to do?',
				...['Reset cache']
			);

			if (action === 'Reset cache') {
				cache.resetCompletionCache(context);
			}
		}
	);

	const queryDisposable = vscode.commands.registerCommand(
		'codexr.query',
		async () => {
			const completion = await createCompletion(context, statusBarItem);
			const editor = getEditor();
			const position = editor.selection.active;

			// Insert the code into the editor
			editor.edit(editBuilder => {
				statusBarItem.text = 'CodeXR';
				editBuilder.insert(position, completion); // Format the completion
			});
		}
	);

	async function provider(document) {
		const completion = await createCompletion(context, statusBarItem);
		const editor = getEditor();
		const cursorPosition = editor.selection.active;

		return createCompletionsList(completion, cursorPosition, document);
	}

	const completionItemProvider =
		vscode.languages.registerCompletionItemProvider(
			{ pattern: '**' },
			{
				provideCompletionItems: async document => {
					if (config.get('inline_completions')) return;

					return await provider(document);
				}
			}
		);

	inlineProvider.registerInlineDecorationProvider(async document => {
		if (!config.get('inline_completions')) return;

		const completion = await createCompletion(context, statusBarItem);

		return completion;
	});

	context.subscriptions.push(completionItemProvider);
	context.subscriptions.push(infoDisposable);
	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(queryDisposable);
}

module.exports = { activate, deactivate: () => {} };
