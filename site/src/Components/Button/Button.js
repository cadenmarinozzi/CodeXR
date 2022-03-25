import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import './index.scss';

class Button extends React.Component {
    render() {
        let children = [];
        if (this.props.icon) children.push(<br key={uuidv4()}></br>, <FontAwesomeIcon key={uuidv4()} onClick={this.props.onClick} className='Icon' icon={this.props.icon} />);

        return <a href={this.props.href}><button onClick={this.props.onClick}>{this.props.children}{children}</button></a>;
    }
}

export default Button;