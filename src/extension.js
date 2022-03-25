const vscode = require('vscode');
const query = require('./query/query');
const debounce = require('./debounce');
const completionProvider = require('./completionProvider/completionProvider');
const { encode, decode } = require('gpt-3-encoder');

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
 * Generate an array of InlineCompletionItems from an array of strings
 * @param {string[]} completions - an array of strings to use to generate InlineCompletionItems
 * @param {vscode.Position} position - the position at which to create the InlineCompletionItems
 * @returns {vscode.InlineCompletionItem[]} an array of InlineCompletionItems generated from the strings in the completions array
 */
function generateResults(completions, position) {
    // Map the completions to InlineCompletionItems
    return completions.map(text => { 
        // Create a range for the completion
        const range = new vscode.Range(position.translate(0, text.length), position);
        // Return the completion

        return new vscode.InlineCompletionItem(text, range);
    });
}

/**
 * This function trims the context so that it is the specified maximum number of tokens long.
 * @param {string} context - The context to be trimmed.
 * @param {string} prompt - The prompt to be used as a reference point for trimming.
 * @returns {string} - The trimmed context.
 */
function trimContext(context, prompt) {
    const config = vscode.workspace.getConfiguration('codexr');
    const maxTokens = config.get('max_tokens');
    const encoded = encode(context);

    return decode(encoded.slice(0, maxTokens - encode(prompt).length));
}

/**
 * @async 
 * @function getResults
 * @returns {Promise<vscode.CompletionList>}
 * @description Asynchronously returns a list of code completion results for the current active text editor
 */
async function getResults() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const document = editor.document;
    const position = editor.selection.active;
    const lineText = getLineText(document, position);
    if (lineText.length <= 2) return;

    let [ queryText, hasPrefix ] = removePrefix(lineText);
    queryText.trim();

    const previousRange = new vscode.Range(document.lineAt(0).range.start, document.lineAt(position.line).range.end);
    const context = trimContext(document.getText(previousRange), queryText);

    const completions = await debounce(async() => 
        await query(document.languageId, context, queryText, hasPrefix), 1000)(); // debounce to throttle the completions

    return generateResults(completions, position);
}

function activate(context) {
    const config = vscode.workspace.getConfiguration('codexr');
    const queryDisposable = vscode.commands.registerCommand('codexr.query', async() => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const position = editor.selection.active;

        const results = await getResults();
        if (!results || results.length < 1) return;

        editor.edit(editBuilder => {
            editBuilder.insert(position, results[0].insertText);
        });
    });

    context.subscriptions.push(queryDisposable);
    
    if (!config.get('realtime')) return;

    async function provider(document, position) {
        const results = { items: await getResults() };

        return results;
    }

    completionProvider.registerInlineCompletionItemProvider({ pattern: '**'}, {
        provideInlineCompletionItems: provider
    });
}

module.exports = { activate, deactivate: () => {} };