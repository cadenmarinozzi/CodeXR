/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const prettier = require('prettier');

const languages = [
	'javascript',
	'jsx',
	'html',
	'css',
	'scss',
	'less',
	'graphql',
	'json',
	'yaml',
	'yml',
	'vue',
	'angular',
	'typescript',
	'flow',
	'md',
	'mdx',
	'gfm'
];

function format(code) {
	return prettier.format(code, {
		parser: 'babel',
		semi: true,
		tabWidth: 4,
		useTabs: true,
		singleQuote: true,
		trailingComma: 'none',
		bracketSpacing: true,
		arrowParens: 'avoid'
	});
}

module.exports = { prettier: format, languages };
