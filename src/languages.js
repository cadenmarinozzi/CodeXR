/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const languages = {
	javascript: {
		comment: '//',
		function: 'function',
		variables: ['var ', 'let ', 'const ']
	},
	jsx: {
		comment: '//',
		function: 'function',
		variables: ['var ', 'let ', 'const ']
	},
	html: {
		comment: '<!--'
	},
	css: {
		comment: '/*'
	},
	scss: {
		comment: '/*',
		variables: ['$']
	},
	less: {
		comment: '/*'
	},
	graphql: {
		comment: '#'
	},
	json: {
		comment: '//'
	},
	yaml: {
		comment: '#'
	},
	yml: {
		comment: '#'
	},
	vue: {
		comment: '<!--',
		function: 'function '
	},
	angular: {
		comment: '<!--',
		function: 'function '
	},
	typescript: {
		comment: '//',
		function: 'function ',
		variables: ['var ', 'let ', 'const ']
	},
	flow: {
		comment: '//'
	},
	md: {
		comment: '<!--'
	},
	mdx: {
		comment: '<!--'
	},
	gfm: {
		comment: '<!--'
	},
	go: {
		comment: '//',
		function: 'func ',
		variables: ['var ', ':=']
	},
	rust: {
		comment: '//',
		function: 'fn ',
		variables: ['let ', 'const ']
	},
	c: {
		comment: '//'
	},
	cpp: {
		comment: '//'
	},
	csharp: {
		comment: '//'
	},
	java: {
		comment: '//'
	},
	kotlin: {
		comment: '//'
	},
	php: {
		comment: '//'
	},
	python: {
		comment: '#',
		function: 'def ',
		variables: [' = '] // Rip
	},
	ruby: {
		comment: '#',
		function: 'def '
	},
	swift: {
		comment: '//',
		function: 'func '
	},
	objectivec: {
		comment: '//'
	},
	objectivecpp: {
		comment: '//'
	},
	lua: {
		comment: '--',
		function: 'function',
		variables: ['local ', 'var ']
	},
	haskell: {
		comment: '--',
		function: 'function',
		variables: ['let ', 'var ']
	},
	clojure: {
		comment: ';'
	},
	elixir: {
		comment: ';'
	},
	erlang: {
		comment: '%'
	},
	elm: {
		comment: '--'
	},
	fsharp: {
		comment: '//'
	},
	default: {
		comment: '//',
		function: 'function',
		variables: ['var ', 'let ', 'const ']
	}
};

/**
 * @function getLanguageComment
 * @param {string} code - the code to check
 * @param {string} language - the language to check
 * @returns {boolean} - The comment
 */
function getLanguageComment(language) {
	let languageDetails = languages[language];
	if (!languageDetails) languageDetails = languages.default;

	return languageDetails.comment ?? language.default.comment;
}

/**
 * Gets the language function for the given language, or the default language function if no language is provided.
 * @param {string} language The language to get the function for.
 * @returns {function} The language function for the given language, or the default language function if no language is provided.
 */
function getLanguageFunction(language) {
	let languageDetails = languages[language];
	if (!languageDetails) languageDetails = languages.default;

	return languageDetails.function ?? language.default.function;
}

/**
 * Gets the language variables for the specified language, or the default language variables if the language is not specified.
 * @param {string} language The language to get the variables for.
 * @returns {object} The language variables.
 */
function getLanguageVariables(language) {
	let languageDetails = languages[language];
	if (!languageDetails) languageDetails = languages.default;

	return languageDetails.variables ?? language.default.variables;
}

/**
 * Checks whether a language variable is in the text
 * @param {string} language - the language being checked
 * @param {string} text - the text being checked
 * @returns {boolean} whether the language variable is in the text
 */
function hasLanguageVariable(language, text) {
	const languageVariables = getLanguageVariables(language);

	for (const languageVariable of languageVariables) {
		if (text.includes(languageVariable)) return true;
	}
}

module.exports = {
	languages,
	getLanguageComment,
	getLanguageFunction,
	hasLanguageVariable
};
