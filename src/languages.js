/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const languages = {
	javascript: {
		comment: '//',
		function: 'function'
	},
	jsx: {
		comment: '//',
		function: 'function'
	},
	html: {
		comment: '<!--'
	},
	css: {
		comment: '/*'
	},
	scss: {
		comment: '/*'
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
		function: 'function'
	},
	angular: {
		comment: '<!--',
		function: 'function'
	},
	typescript: {
		comment: '//',
		function: 'function'
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
		function: 'func'
	},
	rust: {
		comment: '//',
		function: 'fn'
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
		function: 'def'
	},
	ruby: {
		comment: '#',
		function: 'def'
	},
	swift: {
		comment: '//',
		function: 'func'
	},
	objectivec: {
		comment: '//'
	},
	objectivecpp: {
		comment: '//'
	},
	lua: {
		comment: '--',
		function: 'function'
	},
	haskell: {
		comment: '--',
		function: 'function'
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
		function: 'function'
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

module.exports = { languages, getLanguageComment, getLanguageFunction };
