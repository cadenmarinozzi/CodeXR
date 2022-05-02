/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');

// Hehe funni file
/**
 * @function getConfig
 * @description Returns the configuration object for the codexr extension.
 * @returns {Object} - Configuration object for the codexr extension.
 */
function getConfig() {
	return vscode.workspace.getConfiguration('codexr');
}

module.exports = getConfig;
