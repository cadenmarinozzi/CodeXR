/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

import Button from '../Button';
import { Gradient } from 'react-gradient';
import gradients from '../../gradients';
import './index.scss';
import React from 'react';

class DownloadPage extends React.Component {
    render() {
        return (
            <div className='page-center page4' ref={this.props.reference}>
                <Gradient
                    gradients={gradients.main}          
                    property='text'        
                    element='h1'
                    angle='30deg'
                    className='bold'
                >
                Downloads
                </Gradient>	 

                <Button href='https://github.com/nekumelon/CodeXR'>GitHub</Button>
            </div>
        );
    }
}

export default DownloadPage;