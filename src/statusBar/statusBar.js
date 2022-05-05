/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const vscode = require('vscode');

class StatusBar {
	constructor(options) {
		this.original = options;
		this.text = options?.text;
		this.position = options?.position ?? vscode.StatusBarAlignment.Right;
		this.priority = options?.priority ?? 0;
		this.statusBarItem = vscode.window.createStatusBarItem(
			this.position,
			this.priority
		);

		this.update();
	}

	update() {
		this.statusBarItem.text = this.text;
		this.statusBarItem.command = this.command;
		this.statusBarItem.color = this.color;
		this.statusBarItem.show();
	}

	reset() {
		this.text = this.original.text;
		this.command = this.original.command;
		this.color = this.original.color;
		this.update();
	}
}

module.exports = StatusBar;
