const validEngines = ['code-davinci-002', 'code-cushman-001'];

function getStopSequence(singleLine) {
	return singleLine ? '\n' : '\n\n\n';
}

class Parameters {
	constructor(parameters) {
		this.engine = parameters.engine;
		this.temperature = parameters.temperature ?? 0;
		this.samples = parameters.samples ?? 1;
		this.singleLine = parameters.singleLine;
		this.stops = parameters.stops ?? [getStopSequence(this.singleLine)];
		this.timeout = parameters.timeout ?? 20;
		this.context = parameters.context ?? [];
		this.prompt = parameters.prompt ?? '';
	}

	validate() {
		return (
			validEngines.includes(this.engine) &&
			this.temperature >= 0 &&
			this.temperature <= 1 &&
			this.samples > 0 &&
			this.stops !== [] &&
			this.timeout > 0
		);
	}
}

module.exports = Parameters;
