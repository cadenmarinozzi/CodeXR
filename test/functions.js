const assert = require('assert');

describe('The function', () => {
    it('removePrefix should remove the prefix from the given sring', () => {
        function removePrefix(input) {
            if (input.indexOf('//') < 0) return [ input ];

            return [ input.substring(2), true ];
        }

        assert.deepEqual(removePrefix('//test'), ['test', true]);
    });

    it('removePrefix should return the input string if it doesn\'t contain the prefix', () => {
        function removePrefix(input) {
            if (input.indexOf('//') < 0) return [ input ];

            return [ input.substring(2), true ];
        }

        assert.deepEqual(removePrefix('/test'), ['/test']);
    });

    it('removeQuery should remove the query from the given prompt', () => {
        function removeQuery(input, query) {
            const index = input.toLowerCase().indexOf(query.toLowerCase());
            if (index < 0) return input;

            return input.substring(index + query.length);
        }

        assert.equal(removeQuery('function discreteFourierTransform', 'function discretefourierTr'), 'ansform');
    });

    it('removeQuery should return the input if the input does not contain the query', () => {
        function removeQuery(input, query) {
            const index = input.toLowerCase().indexOf(query.toLowerCase());
            if (index < 0) return input;

            return input.substring(index + query.length);
        }

        assert.equal(removeQuery('function nRandom', 'function discretefourierTr'), 'function nRandom');
    });

    it('debounce should only call the given function every x milliseconds', () => {
        let timer;

        function debounce(inner, ms) {
            let resolves = [];
        
            return (...args) => {    
                clearTimeout(timer);

                timer = setTimeout(() => {
                    const result = inner(...args);
                    resolves.forEach(resolve => resolve(result));
                    resolves = [];
                }, ms);
            
                return new Promise(resolve => resolves.push(resolve));
            };
        }

        let vals = [];
        const f = debounce(() => { vals.push(1) }, 100);
        
        f();
        f();
        assert.equal(vals.length, 0);
    });
});