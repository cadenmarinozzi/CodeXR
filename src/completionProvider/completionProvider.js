const vscode = require('vscode');
// const debounce = require('../debounce');

/**
 * Registers an inline completion provider.
 *
 * @return A Disposable that unregisters this provider when being disposed.
 */
function registerInlineCompletionItemProvider(selector, provider) { // I have absolutely no clue what selector even does lol
    if (this.isInsider) {
        return vscode.languages.registerInlineCompletionItemProvider(selector, provider);
    }

    // Super buggy right now

    // let lastText;
    // let needsRemoving;
    // let removingRange;
    // let insertPosition;

    // /**
    //  * @async 
    //  * @description provideInlineCompletion provides inline autocompletion for the user as they type
    //  * @param {Object} event 
    //  * @param {provider} provider 
    //  */
    // async function provideInlineCompletion(event) { // I hate this function with my entire being
    //     const editor = vscode.window.activeTextEditor;
    //     if (!editor) return;

    //     const contentChange = event.contentChanges[0];
    //     const contentChangeRange = contentChange.range;

    //     if (contentChangeRange == removingRange) return; // If the change is the removal of the completion

    //     if (insertPosition && contentChangeRange.start.line >= insertPosition.line) { // If the change is after the completion
    //         insertPosition = null;
    //         needsRemoving = false;
            
    //         return;
    //     }

    //     if (needsRemoving) { // If the user types a character (Meaning they don't want the completion)
    //         editor.edit(editBuilder => editBuilder.delete(removingRange));
    //         needsRemoving = false;

    //         return;
    //     }   

    //     const active = editor.selection.active;
    //     const position = new vscode.Position(active.line, active.character);
    //     const completionItems = await provider.provideInlineCompletionItems(editor.document, position);
    //     if (!completionItems || completionItems.items.length < 1) return;

    //     const firstItem = completionItems.items[0]; // I'll handle cycling through completions later
    //     const insertText = firstItem.insertText;

    //     removingRange = new vscode.Range(position, new vscode.Position(
    //         position.line + insertText.split('\n').length + 1, 
    //         insertText.split('\n')[0].length
    //     ));

    //     if (insertText == lastText) return;
    //     lastText = insertText;

    //     editor.edit(editBuilder => {
    //         editBuilder.insert(position, firstItem.insertText);
    //         insertPosition = position;
    //         needsRemoving = true;
    //     });

    //     editor.selection = new vscode.Selection(removingRange.start, removingRange.end); // Select the inserted text
    // }

    // vscode.workspace.onDidChangeTextDocument(debounce(provideInlineCompletion, 50));

    // function dispose() {
    //     const editor = vscode.window.activeTextEditor;
    //     if (!editor) return;
        
    //     editor.edit(editBuilder => editBuilder.delete(removingRange));
    // }

    // return new vscode.Disposable(dispose);
}

let completionProvider = { 
    isInsider: vscode.version.indexOf('insider') > -1,
    registerInlineCompletionItemProvider: registerInlineCompletionItemProvider
};

module.exports = completionProvider;