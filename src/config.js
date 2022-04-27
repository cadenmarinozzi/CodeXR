const vscode = require('vscode');

// Hehe funni file
function getConfig() {
	return vscode.workspace.getConfiguration('codexr');
}

module.exports = getConfig;
