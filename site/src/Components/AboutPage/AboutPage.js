/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

import React from 'react';
import './index.scss';

class AboutPage extends React.Component {
	render() {
		return (
			<div className="whitePage page3 quad">
				<div className="column">
					<div className="row">
						<h1>How It Works</h1>
						<h3>
							CodeXR works by taking the current line of code in
							your text editor and querying it with the OpenAI
							Codex model to generate a completed code segment
							called a completion. It also provides context code
							from the other code in the document. <br /> <br />
							<span className="TLDR">
								TL;DR: CodeXR uses AI to make worky.
							</span>
						</h3>
					</div>

					<div className="row">
						<h1>Accuracy</h1>
						<h3>
							CodeXR uses OpenAIs Codex, an extremely powerful AI
							System, trained specifically to be able to read and
							interpret code. BUT, the Codex is also trained on
							Natural Language, things such as Wikipedia articles,
							papers and texts, so results should be verbose.
							However, Codex isn't perfect, so once in a while you
							may get some unexpected code. If this happens,
							rewrite your prompt, making sure it provides just
							enough information that the model can interpret it.
							If that still doesn't work, just fall back to the
							good ol' days when programmers had to code
							themselves.
							<br />
							<br />
							<span className="TLDR">
								TL;DR: CodeXR is great, but not perfect, so make
								sure your prompt is well written.
							</span>
						</h3>
					</div>
				</div>

				<div className="column">
					<div className="row">
						<h1>Language Support</h1>
						<h3>
							OpenAIs Codex is trained on billions of lines of
							code from places like GitHub, Stack Overflow and
							Wikipedia, meaning it supports a wide range of
							languages. Some of the main ones are: Python,
							JavaScript, Go, Java, C++, C, Swift, TypeScript,
							Ruby, PHP, Perl and Shell. However, CodeXR supports
							most languages that have made it into mainstream
							code. So writing code in languages like Kotlin
							shouldn't be a problem.{' '}
						</h3>
					</div>

					<div className="row">
						<h1>Usage</h1>
						<h3>
							CodeXR can be installed as an extension for the
							popular code editor, vscode, and to request a
							completion, a keybind is used.
						</h3>
					</div>
				</div>
			</div>
		);
	}
}

export default AboutPage;
