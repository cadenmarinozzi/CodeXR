const BlockParser = require('./BlockParser');

function parser(code, language) {
	return new BlockParser(code, language);
}

module.exports = parser;
