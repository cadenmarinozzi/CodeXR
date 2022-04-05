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

    /**
     * Handles label from response.
     *
     * @param {Object} response Response data
     * @returns {string} Label
     */
    handleLabel(response) {
        let label = response.data.choices[0].text;
        // If the label is 2, then it is toxic

        // Get the log probabilities for each label
        if (label === 2) {

            // If the log probability for label 2 is less than the threshold, then it is not toxic
            const logprobs = response.data.choices[0].logprobs.op_logprobs[0];
            // Get the log probabilities for labels 0 and 1


            // If both log probabilities are defined, then choose the label with the higher log probability
            if (logprobs['2'] < toxicThreshold) {
                const logprob_0 = logprobs['0'];
                // If only one log probability is defined, then choose that label
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

    /**
     * check
     * @param {string} input the input string
     * @returns {boolean} true if the string is safe, false otherwise
     */
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