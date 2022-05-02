/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

class Block {
	constructor(code, lineNumber, lineDefined, blockType, language) {
		this.code = code;
		if (!this.code) return;

		this.lineNumber = lineNumber;
		this.lineDefined = lineDefined;
		this.blockType = blockType;
		this.language = language;
		this.lines = this.code.split('\n');
		this.isClosed = this.checkIfClosed();
		this.isOpened = this.checkIfOpened();
		this.isFinished = this.isClosed && this.isOpened;
	}

	checkIfClosed() {
		return (
			this.lines[this.lines.length - 1].match(
				this.language.brackets.close
			) !== null
		);
	}

	checkIfOpened() {
		return this.lines[0].match(this.language.brackets.open) !== null;
	}
}

class BlockParser {
	constructor(code, language) {
		this.code = code;
		this.language = language;
		this.lines = this.code.split('\n');
	}

	/**
	 *
	 * @param {Number} lineNumber
	 * @returns {String} result
	 */
	isBlock(lineNumber) {
		// The result of this function
		let result;

		// Loop through all the block types in the language

		for (const [blockType, blockKeywords] of Object.entries(
			this.language.blocks
		)) {
			blockKeywords.forEach(blockKeyword => {
				if (this.lines[lineNumber].startsWith(blockKeyword)) {
					result = blockType;
				}
			});
		}

		return result;
	}

	/**
	 * Returns the number of opening keywords in the code.
	 * @param {string} [code] - The code to search. If no code is provided, the instance's code will be searched.
	 * @returns {number} - The number of opening keywords in the code.
	 */
	getOpeningKeywords(code) {
		const searchCode = code ?? this.code;

		return (searchCode.match(this.language.brackets.open) || []).length;
	}

	/**
	 * @description Takes a code string and returns the number of closing keywords
	 * @param {string} code
	 * @returns {number}
	 */
	getClosingKeywords(code) {
		const searchCode = code ?? this.code;

		return (searchCode.match(this.language.brackets.close) || []).length;
	}

	/**
	 * Gets the code block for a given line number
	 * @param {Number} lineNumber - The line number to get the block for
	 * @returns {Block} - A Block object representing the code block
	 */
	getBlock(lineNumber) {
		const blockType = this.isBlock(lineNumber);

		if (!blockType) {
			return new Block(null, lineNumber + 1);
		}

		let closingKeywords = 0;
		let openingKeywords = 0;
		const startingLineNumber = lineNumber;

		while (lineNumber < this.lines.length) {
			const line = this.lines[lineNumber];
			closingKeywords += this.getClosingKeywords(line);
			openingKeywords += this.getOpeningKeywords(line);

			lineNumber++;

			if (closingKeywords === openingKeywords) break;
		}

		const lines = this.lines.slice(startingLineNumber, lineNumber);
		const code = lines.join('\n'); // Join each line in the block

		return new Block(
			code,
			lineNumber,
			startingLineNumber,
			blockType,
			this.language
		);
	}

	/**
	 * Gets the blocks of code from the lines of code.
	 * @returns {Array} - The array of blocks.
	 */
	getBlocks() {
		let lineNumber = 0;
		let blocks = [];

		while (lineNumber < this.lines.length) {
			const block = this.getBlock(lineNumber);
			lineNumber = block.lineNumber;

			if (block.code) {
				blocks.push(block);
			}
		}

		return blocks;
	}
}

module.exports = BlockParser;
