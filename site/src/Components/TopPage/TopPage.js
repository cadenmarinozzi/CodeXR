/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

import React from 'react';
import { Gradient } from 'react-gradient';
import gradients from '../../gradients';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import '../OpenAILogo';
import '../../fonts.js';
import OpenAILogo from '../OpenAILogo';
import highlightCode from '../../syntaxHighlighting';
import Button from '../Button';
import './index.scss';

class TopPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { opacity: 1, currentScrollHeight: 0 };
	}

	componentDidMount() {
		window.addEventListener('scroll', () => {
			const newScrollHeight = Math.floor(window.scrollY / 20) * 20;
			if (this.state.currentScrollHeight === newScrollHeight) return;

			this.setState({ currentScrollHeight: newScrollHeight });
		});
	}

	render() {
		const opacity = Math.max(
			1 - Math.min(this.state.currentScrollHeight / 200, 1),
			0.2
		);

		return (
			<div style={{ opacity: opacity }}>
				<div className="bold top-center">
					<Gradient
						gradients={gradients.main}
						property="text"
						element="h1"
						angle="30deg"
						className="title"
					>
						CodeXR
					</Gradient>

					<h2 className="subtitle">The future of programming.</h2>
				</div>

				<div className="page-center">
					<Button onClick={this.props.scroller} icon={faAngleDown}>
						Download
					</Button>
				</div>

				<div className="page-center" style={{ paddingTop: '35px' }}>
					{highlightCode(
						'let square = (',
						`x) => x * x;\nconst a = 2;\nconsole.log(square(x));`
					)}
				</div>

				<div className="page-center">
					<span className="Powered-by">Powered by</span>
					<br />
					<a
						rel="noopener noreferrer"
						href="https://openai.com/"
						target="_blank"
					>
						<OpenAILogo />
					</a>
				</div>
			</div>
		);
	}
}

export default TopPage;
