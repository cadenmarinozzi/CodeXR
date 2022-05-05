/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const languages = {
	javascript: {
		id: 'JavaScript',
		blocks: {
			function: ['=>', 'function'],
			loop: ['while', 'for'],
			class: ['class'],
			other: [
				'do',
				'if',
				'try',
				'catch',
				'with',
				'finally',
				'else',
				'switch'
			]
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
	},
	python: {
		id: 'Python',
		blocks: {
			function: ['def'],
			loop: ['for', 'while'],
			class: ['class'],
			other: ['try', 'if', 'except', 'else', 'finally', 'elif']
		},
		comments: {
			single: ['#'],
			multi: {
				open: '"""',
				close: '"""'
			}
		},
		brackets: {
			open: ':',
			close: ''
		}
	},
	go: {
		id: 'Go',
		blocks: {
			function: ['func'],
			loop: ['for', 'while'],
			class: ['type'],
			other: ['if', 'else', 'switch', 'case', 'default', 'try', 'catch']
		},
		comments: {
			single: ['//'],
			multi: {
				open: '/*',
				close: '*/'
			}
		}
	},
	rust: {
		id: 'Rust',
		blocks: {
			function: ['fn'],
			loop: ['for', 'while'],
			class: ['struct'],
			other: ['if', 'else', 'match', 'try', 'catch']
		},
		comments: {
			single: ['//'],
			multi: {
				open: '/*',
				close: '*/'
			}
		}
	},
	java: {
		id: 'Java',
		blocks: {
			function: ['public', 'private', 'protected', 'static', 'final'],
			loop: ['for', 'while'],
			class: ['class'],
			other: ['if', 'else', 'try', 'catch']
		},
		comments: {
			single: ['//'],
			multi: {
				open: '/*',
				close: '*/'
			}
		}
	},
	c: {
		id: 'C',
		blocks: {
			function: ['int', 'void', 'char', 'float', 'double', 'long'],
			loop: ['for', 'while'],
			class: ['struct'],
			other: ['if', 'else', 'try', 'catch']
		},
		comments: {
			single: ['//'],
			multi: {
				open: '/*',
				close: '*/'
			}
		}
	},
	cpp: {
		id: 'C++',
		blocks: {
			function: ['int', 'void', 'char', 'float', 'double', 'long'],
			loop: ['for', 'while'],
			class: ['struct'],
			other: ['if', 'else', 'try', 'catch']
		},
		comments: {
			single: ['//'],
			multi: {
				open: '/*',
				close: '*/'
			}
		}
	},
	ruby: {
		id: 'Ruby',
		blocks: {
			function: ['def'],
			loop: ['while', 'for'],
			class: ['class'],
			other: ['if', 'else', 'begin', 'rescue', 'ensure', 'end']
		},
		comments: {
			single: ['#'],
			multi: {
				open: '=begin',
				close: '=end'
			}
		}
	},
	php: {
		id: 'PHP',
		blocks: {
			function: ['function'],
			loop: ['while', 'for'],
			class: ['class'],
			other: ['if', 'else', 'try', 'catch']
		},
		comments: {
			single: ['//'],
			multi: {
				open: '/*',
				close: '*/'
			}
		}
	}
};

module.exports = languages;
