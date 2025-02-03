import React, { useState } from 'react';
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
    const [renderTopBar] = useState(true);

    // Callbacks
    const renderComponentCallback = (component) => {
        setRenderComponent(component);
    }

    // Mapping dei componenti
    const componentMap = {
        landingPage: LandingPage,
        login: Login,
        bookingPage: BookingPage,
        manageBookings: ManageBookings
    };
    const ComponentOnScreen = componentMap[renderComponent];


    const renderLandingPage = () => (
        <LandingPage renderComponent={renderComponentCallback} />
    );

    const renderMainContent = () => (
        <div className="flex flex-column align-items-center justify-content-center h-screen fadein animation-duration-500 h-screen" style={{ backgroundImage: 'url(/3.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {renderTopBar && <TopBar renderComponent={renderComponentCallback} componentOnScreen={renderComponent} />}
            {ComponentOnScreen && <ComponentOnScreen renderComponent={renderComponentCallback} />}
        </div>
    );

    return (
        <>
            {renderComponent === 'landingPage' ? renderLandingPage() : renderMainContent()}
        </>
    );
}

export default MainArea;