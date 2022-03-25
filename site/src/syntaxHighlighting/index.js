import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const digits = '1234567890';
const symbols = '`~!@#$%&_:\'",?.';
const arithmetics = '*+-/^';
const brackets = '()[]{}';
const comparisons = '=><';
const variables = { // It's like I don't even care at this point
    'const ': true,
    'let ': true,
    'var ': true,
};

const colors = {
    default: '#aaaaaa',
    digit: '#d19a66',
    symbol: '#61aeee',
    arithmetic: '#98c379',
    bracket: '#61aeee',
    comparison: '#F92672',
    variables: '#F92672',
    function: '#56b6c2',
    comment: '#aaaaaa'
};

// PLEASE FOR THE LOVE OF GOD DON'T LOOK AT THIS FILE
// YOU WILL WANT TO DIE
// I WARNED YOU

// NO LEXER, PARSER OR ANYTHING LOL

const replacements = { // literally the dumbest code I have ever written
    'const ': '⚘', // Like how tf am I so lazy that I don't even write a
    'var ': '♡', // dynamic token length for this
    'let ': '♥', // I don't get it
    'function ': '⚶', // Like I mean I know how to do it
    'def ': '☺', // And I've done it  before
    'func ': '☻', // But I just don't want  to
    'for ': '✌',
    'in ': '✼'
}

function colorize(char) {
    const color = colors[char];

    if (color) return color;
    if (digits.indexOf(char) > -1) return colors.digit;
    if (symbols.indexOf(char) > -1) return colors.symbol;
    if (arithmetics.indexOf(char) > -1) return colors.arithmetic;
    if (brackets.indexOf(char) > -1) return colors.bracket;
    if (comparisons.indexOf(char) > -1) return colors.comparison;
    
    for (const [original, replacement] of Object.entries(replacements)) {
        if (char == replacement) {
            if (variables[original]) return colors.variables;
            
            return colors.function;
        }
    }

    return colors.default;
}

// Bad code starts here

function generateForStr(str, alpha='', comment=false) {
    const color = comment ? colors.comment : (colorize(str) || colors.default);

    for (const [original, replacement] of Object.entries(replacements)) {
        str = str.replace(replacement, original);
    }
    
    return <span key={uuidv4()} style={{
        color: color + alpha.toString(),
        background: alpha == '' ? '' : 'rgba(3, 102, 214, 0.1',
    }}>{str}</span>;
}

export default function(prompt, code, comment) {
    let generated = [];
    let generatedLines = [];

    for (const [original, replacement] of Object.entries(replacements)) {
        prompt = prompt.replace(original, replacement);
    }

    for (let i = 0; i < prompt.length; i++) {
        const char = prompt[i];
        generatedLines.push(generateForStr(char, '', comment));
    }

    const lines = code.split('\n');

    for (let line of lines) {
        for (const [original, replacement] of Object.entries(replacements)) {
            line = line.replace(original, replacement);
        }

        let position = 0;

        while (position < line.length) {
            let char = line[position];
            position++;
            generatedLines.push(generateForStr(char, 70));
        }

        generated.push(<pre key={uuidv4()} className='tab'>{generatedLines}</pre>);
        generatedLines = [];
    }

    return <div className='code-block'>{generated}</div>;
}