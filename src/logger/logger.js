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
					text,
					important ? 'background: rgb(22, 22, 22); color: #fff' : ''
				);
			}

			return;
		}

		console.log(text);
	}
}

const logger = new Logger();

module.exports = logger;
