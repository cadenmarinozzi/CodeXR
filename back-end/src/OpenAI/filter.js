/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const toxicThreshold = -0.355;
const labels = ['0', '1', '2' ];

class Filter {
    constructor(openai) {
        this.openai = openai;
    }

    handleLabel(response) {
        let label = response.data.choices[0].text;

        if (label === 2) {
            const logprobs = response.data.choices[0].logprobs.op_logprobs[0];

            if (logprobs['2'] < toxicThreshold) {
                const logprob_0 = logprobs['0'];
                const logprob_1 = logprobs['1'];

                if (logprob_0 && logprob_1) {
                    if (logprob_0 >= logprob_1) label = '0';
                    else label = '1';
                } else if (logprob_0) label = '0';
                else label = '1';
            }
        }

        return label;
    }

    async check(input) {
        /*
        0 - safe
        1 - sensitive
        2 - unsafe
        */
        const response = await this.openai.createCompletion('content-filter-alpha', {
            prompt: `<|endoftext|>${input}\n--\nLabel:`,
            temperature: 0,
            max_tokens: 1,
            top_p: 0,
            frequency_penalty: 0,
            presence_penalty: 0,
            logprobs:10
        });
        
        if (!response.data.choices) return true;

        const label = this.handleLabel(response);
        if (labels.includes(label)) return label === '0';

        return false;
    }
}

module.exports = Filter;