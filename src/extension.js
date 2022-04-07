/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');
const query = require('./query');
const { v4: uuid4 } = require('uuid');
const web = require('./web');
  
/**
 * @param {Document} document 
 * @param {Position} position 
 */
function getLineText(document, position) {
    // Get the text of the line that the position is on
    return document.getText(new vscode.Range(position.with(undefined, 0), position));
}

/**
 * Returns the prefix type of the input string
 * @param {string} input - the input string
 * @return {boolean} 
 */
function getPrefixType(input) {
    return input.includes('//') || input.includes('#');
}

/**
 * @function removePrefix
 * @description Removes the prefix from the input
 * @param {string} input - The input string
 */
function removePrefix(input) {
    const prefixType = getPrefixType(input);
    if (!input.includes(prefixType)) return [ input ];
    if (input.indexOf(prefixType) < 0) return [ input ];
    // If there is no prefix, return the input as-is

    return [ input.substring(prefixType.length), true ];
    // Otherwise, return the input without the prefix and a flag
    // indicating that the prefix was removed
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

    if (!user) user = uuid4();
    // If the userId is not in the database, add it
    if (!await web.isUser(user)) {
        context.globalState.update('user', user);

        web.beginUser(user);
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    // Get the text of the line the cursor is on
    
    const document = editor.document;
    const position = editor.selection.active;
    const lineText = getLineText(document, position);

    // Remove the prefix from the line text
    let [ queryText ] = removePrefix(lineText);
    queryText.trim();
        // Get the text of the lines above the cursor

    let contextCode = '';
    // Show a status bar message

    // Get the completions
    if (position.line > 0) {
        const previousRange = new vscode.Range(document.lineAt(0).range.start, document.lineAt(position.line - 1).range.end);
        const postRange = new vscode.Range(document.lineAt(position.line - 1).range.end, new vscode.Position(document.lineCount, 100));
        contextCode = document.getText(previousRange) + '\n' + document.getText(postRange);
    }

    vscode.window.setStatusBarMessage('Generating a completion...', 4000);
    const completions = await query({ context: contextCode, user: user, language: document.languageId, query: queryText });

    return completions;
}

/**
 * Creates a status bar item.
 * @param {string} command - The command to run when the status bar item is clicked.
 * @param {string} text - The text to display in the status bar item.
 * @returns {vscode.StatusBarItem} - The created status bar item.
 */
function createStatusBarItem(command, text) {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusBarItem.color = '#f00';
    statusBarItem.text = text;
    statusBarItem.command = command;
    statusBarItem.show();

    return statusBarItem;
}

function activate(context) {
    const config = vscode.workspace.getConfiguration('codexr');
    const queryDisposable = vscode.commands.registerCommand('codexr.query', async() => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        // Get the first result from the query
        const position = editor.selection.active;
        // If there is no code, return

        const completions = await getCompletions(context);
        // Insert the code into the editor
        if (!completions || completions.length < 1) return;

        const code = completions[0];
        
        editor.edit(editBuilder => {
            editBuilder.insert(position, code);
        });
    });

    context.subscriptions.push(queryDisposable);
    context.subscriptions.push(createStatusBarItem('codexr.query', '$(variable)', 'CodeXR'));

    if (!config.get('realtime')) return;
    
    // TODO
}

module.exports = { activate, deactivate: () => {} };