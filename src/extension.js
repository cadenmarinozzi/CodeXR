/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');
const query = require('./query');
const { v4: uuid4 } = require('uuid');
const tinygradient = require('tinygradient');
  
/**
 * @param {Document} document 
 * @param {Position} position 
 */
function getLineText(document, position) {
    // Get the text of the line that the position is on
    return document.getText(new vscode.Range(position.with(undefined, 0), position));
}

/**
 * @param {document} The document to get the context from
 * @param {position} The position in the document
 * @returns {string} A string containing the context
 */
function getContext(document, position) {
    // Get the range of the previous lines
    const previousRange = new vscode.Range(document.lineAt(0).range.start, document.lineAt(position.line - 1).range.end);
    // Get the range of the following lines
    const postRange = new vscode.Range(document.lineAt(position.line - 1).range.end, new vscode.Position(document.lineCount, 100));
    // Combine the previous and following lines
    const context = document.getText(previousRange) + '\n' + document.getText(postRange);

    return context ?? '';
}

/**
 * @async 
 * @function getCompletions
 * @returns {Promise<vscode.CompletionList>}
 * @description Asynchronously returns a list of code completions for the current active text editor
 */
async function getCompletions(context) {
    // Get the userId from the global state
    const user = context.globalState.get('user');

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
    const contextCode = getContext(document, cursorPosition);

    return await query({ context: contextCode, user: user, language: document.languageId, query: queryText });
}

/**
 * Creates a status bar item.
 * @param {string} command - The command to run when the status bar item is clicked.
 * @param {string} text - The text to display in the status bar item.
 * @returns {vscode.StatusBarItem} - The created status bar item.
 */
function createStatusBarItem(command, text) {
    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
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
    const config = vscode.workspace.getConfiguration('codexr');
    
    const queryDisposable = vscode.commands.registerCommand('codexr.query', async() => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const position = editor.selection.active;

            const completions = await getCompletions(context);
            // Insert the code into the editor
            if (!completions || completions.length < 1) return;
            
            editor.edit(editBuilder => {
                editBuilder.insert(position, completions[0]);
            });
        } catch (err) {
            console.error(`An error occured while trying to query the CodeXR API: ${err}`);
        }
    });

    context.subscriptions.push(queryDisposable);
    context.subscriptions.push(createStatusBarItem('codexr.query', 'CodeXR', 'CodeXR'));

    if (!config.get('realtime')) return;
    
    // TODO
}

module.exports = { activate, deactivate: () => {} };