import React, { useState, useEffect } from 'react';
import { BlockUI } from 'primereact/blockui';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import BookingPage from "./BookingPage";
import Login from "./Login";
import TopBar from './TopBar';
import LandingPage from './LandingPage';
import ManageBookings from './ManageBookings';

const MainArea = () => {
    // Stati del componente
    const [renderComponent, setRenderComponent] = useState('landingPage');
    const [blocked, setBlocked] = useState(false);
    const [renderTopBar] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [renderComponent])

    // Callbacks
    const renderComponentCallback = (component) => {
        setRenderComponent(component);
    }

    const blockUiCallaback = (bool) => {
        setBlocked(bool);
    }

    // Mapping dei componenti
    const componentMap = {
        landingPage: LandingPage,
        login: Login,
        bookingPage: BookingPage,
        manageBookings: ManageBookings
    };
    const ComponentOnScreen = componentMap[renderComponent];

    // ###############################################
    // RENDERING
    // ###############################################
    const renderLandingPage = () => (
        <LandingPage renderComponent={renderComponentCallback} />
    );

    const renderMainContent = () => (
        <div className="flex flex-column align-items-center justify-content-center h-screen fadein animation-duration-500 h-screen" style={{ backgroundImage: 'url(/3.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {renderTopBar && <TopBar renderComponent={renderComponentCallback} componentOnScreen={renderComponent} />}
            <BlockUI blocked={blocked} fullScreen template={<i className="pi pi-spin pi-spinner" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}></i>}>
                {ComponentOnScreen && <ComponentOnScreen renderComponent={renderComponentCallback} blockUiCallaback={blockUiCallaback} />}
            </BlockUI >
        </div >
    );

    return (
        <>

            {renderComponent === 'landingPage' ? renderLandingPage() : renderMainContent()}

        </>
    );
}

export default MainArea;