/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

import React from 'react';
import './Components/OpenAILogo';
import './App.scss';
import './scrollbar.css';
import './fonts.js';
import TopPage from './Components/TopPage';
import ExamplesPage from './Components/ExamplesPage';
import AboutPage from './Components/AboutPage';
import Footer from './Components/Footer';
import DownloadPage from './Components/DownloadPage';

function scrollToComponent(ref) {
    window.scrollTo({ top: ref.current.offsetTop, behavior: 'smooth' });
}

function App() {
    const ref = React.useRef();
    
    return (
        <>
            <TopPage scroller={() => scrollToComponent(ref)} />
            <ExamplesPage />
            <AboutPage />
            <DownloadPage reference={ref} />
            <Footer />
        </>
    );
}

export default App; 