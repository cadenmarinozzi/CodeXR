/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

class Completion {
	constructor(completion) {
		this.timedout = completion.timedout;
		this.completion = completion.completion;
		this.prompt = completion.prompt;
	}
}

module.exports = Completion;
