/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const BlockParser = require('./BlockParser');

/**
 * @function parser
 * @param {string} code - The code to parse.
 * @param {string} language - The language of the code.
 * @returns {BlockParser} - A new BlockParser.
 */
function parser(code, language) {
	return new BlockParser(code, language);
}

module.exports = parser;
