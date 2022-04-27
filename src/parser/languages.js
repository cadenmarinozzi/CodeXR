const languages = {
	javascript: {
		blocks: {
			function: ['=>', 'function'],
			loop: ['while', 'for'],
			class: ['class'],
			other: ['do', 'if', 'try', 'catch', 'with', 'finally', 'else']
		},
		comments: {
			single: ['//'],
			multi: {
				open: '/*',
				close: '*/'
			}
		},
		brackets: {
			open: '{',
			close: '}'
		}
	}
};

module.exports = languages;
