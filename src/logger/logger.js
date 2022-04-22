/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

class Logger {
	// hehe over engineered weird unneeded code go brrr
	constructor() {
		this.env = 'dev';
	}

	setEnv(env) {
		this.env = env ?? 'dev';
	}

	log(text, level, important) {
		if (level === 'debug') {
			if (this.env === 'dev') {
				console.log(
					(important ? '❗❗❗\n' : '') +
						text +
						(important ? '\n❗❗❗' : '')
				); // Bad code
			}

			return;
		}

		console.log(text);
	}
}

const logger = new Logger();

module.exports = logger;
