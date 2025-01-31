import React, { useContext } from "react";
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { AuthContext } from "./App";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';


const LandingPage = (props) => {
    // ###############################################
    // STATI DEL COMPONENTE
    // ###############################################

    // CONTEXT
    const { userInfo } = useContext(AuthContext);

    const images = [
        { src: '/1.jpg', alt: 'Image 1' },
        { src: '/2.jpg', alt: 'Image 2' },
        { src: '/3.jpg', alt: 'Image 3' },
    ];

    const responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];


    // ###############################################
    // TEMPLATE GRAFICI
    // ###############################################
    const itemTemplate = (item) => {
        return (
            <img
                src={item.src}
                alt={item.alt}
                className="hero-image"
            />
        );
    };


    // ###############################################
    // RENDERING
    // ###############################################
    const renderLandingPage = () => {
        return (
            <div className="grid grid-nogutter surface-0 text-800 full-page fadein animation-duration-700">
                <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center -mt-5 md:mt-0">
                    <section className="higher-text">
                        <div className='flex flex-row '>
                            <span className="block text-6xl font-bold mb-1 ">Reactive Hotel</span>
                            <img src="/logo512.png" className='mt-5 md:mt-0 ml-2' alt="hyper" height={60} />
                        </div>
                        <div className="text-4xl md:text-6xl text-primary font-bold mb-2 md:mb-3 line-height-1 md:line-heigh-0">la tua vacanza da sogno</div>
                        <p className="mt-0 mb-4 text-700 line-height-3">
                            Riscopri il piacere dei sensi nella nostra location esclusiva, un soggiorno indimenticabile tutto da scoprire.
                        </p>

                        <Button label="Prenota Adesso" onClick={() => { props.renderComponent('bookingPage') }} type="button" className="mr-3 p-button-raised" />
                        <Button label="Accedi" onClick={() => { userInfo.isLogged && userInfo.token ? props.renderComponent('bookingPage') : props.renderComponent('login') }} type="button" className="p-button-outlined" />
                    </section>
                </div>
                <div className="col-12 md:col-6 md:mt-0 -mt-5 overflow-hidden">
                    <Carousel value={images} numVisible={1} numScroll={1} className="h-16rem md:h-auto" responsiveOptions={responsiveOptions} circular itemTemplate={itemTemplate} />
                </div>
                <div className="col-12 p-4 text-center footer p-3 shadow-3">
                    <p>&copy; 2025 Hotel Reactive. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#about">About Us</a>
                        <a href="#services">Services</a>
                        <a href="#contact">Contact</a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {renderLandingPage()}
        </>
    );
};

export default LandingPage;