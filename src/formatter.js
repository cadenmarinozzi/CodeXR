const prettier = require('prettier');

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

module.exports = format;
