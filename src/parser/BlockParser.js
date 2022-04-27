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

	isBlock(lineNumber) {
		let result;

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

	getOpeningKeywords(code) {
		const searchCode = code ?? this.code;

		return (searchCode.match(this.language.brackets.open) || []).length;
	}

	getClosingKeywords(code) {
		const searchCode = code ?? this.code;

		return (searchCode.match(this.language.brackets.close) || []).length;
	}

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
