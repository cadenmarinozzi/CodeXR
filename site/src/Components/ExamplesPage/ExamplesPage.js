import React from 'react';
import { Gradient } from 'react-gradient';
import gradients from '../../gradients';
import '../../fonts.js';
import highlightCode from '../../syntaxHighlighting';

class ExamplesPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { opacity: 0, currentScrollHeight: 0 }
    }

    componentDidMount() {
        window.addEventListener('scroll', () => {
            const newScrollHeight = Math.floor(window.scrollY / 5) * 5;
            this.setState({ currentScrollHeight: newScrollHeight });
        });
    }

    render() {
        const opacity = Math.min(this.state.currentScrollHeight / 100, 1);

        return (
            <div style={{ opacity: opacity, marginBottom: '100px'}} className='page2 page-center'>
                <Gradient
                    gradients={gradients.main}
                    property='text'
                    element='h1'
                    angle='30deg'
                    className=''
                >
                Code Completions
                </Gradient>	
                
                {highlightCode('def nRandom', `(n, min, max):\n\trand = [];\n\tfor i in range(n):\n\t\tnum = random.randint(min, max);\n\t\trand.append(num);`)}
                
                <Gradient
                    gradients={gradients.main}
                    property='text'
                    element='h1'
                    angle='-70deg'
                    className=''
                >
                Code Generation
                </Gradient>	
                
                {highlightCode('// For loop from 1 to 100 (Inclusive)', '\nfor i := 1; i <= 100; i++ {\n\tfmt.Println(i);\n}', true)}
                
                <Gradient
                    gradients={gradients.main}
                    property='text'
                    element='h1'
                    angle='-70deg'
                    className=''
                >
                Natural Language Processing
                </Gradient>	

                {highlightCode('// Print the meaning of life', '\nconsole.log(\'The meaning of life is 42\');', true)}
            </div>
        );
    }
}

export default ExamplesPage;