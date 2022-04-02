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
 * @function removePrefix
 * @description Removes the prefix from the input
 * @param {string} input - The input string
 */
function removePrefix(input) {
    if (input.indexOf('//') < 0) return [ input ];
    // If there is no prefix, return the input as-is

    return [ input.substring(2), true ];
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
    let user = context.globalState.get('user');
    // If there is no userId, create one

    if (!user) user = uuid4();
    // If the userId is not in the database, add it
    
    if (!await web.isUser(user)) {
        context.globalState.update('user', user);
        web.beginUser(user);
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const document = editor.document;
    const position = editor.selection.active;
    const lineText = getLineText(document, position);
    if (lineText.length <= 2) return;

    let [ queryText, hasPrefix ] = removePrefix(lineText);
    queryText.trim();

    let contextCode;

    if (position.line > 0) {
        const previousRange = new vscode.Range(document.lineAt(0).range.start, document.lineAt(position.line - 1).range.end);
        contextCode = document.getText(previousRange);
    }

    vscode.window.setStatusBarMessage('Generating a completion...', 4000);
    const completions = await query(document.languageId, contextCode, queryText, hasPrefix, user);

    return completions;
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

    if (!config.get('realtime')) return;
    
    // TODO
}

module.exports = { activate, deactivate: () => {} };