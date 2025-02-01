import React, { useState, useContext } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Ripple } from 'primereact/ripple';
import { Badge } from 'primereact/badge';
import { AuthContext } from "./App";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const TopBar = (props) => {
    const { userInfo, setUserInfo } = useContext(AuthContext);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const loginOrAvatar = () => {
        if (userInfo.token && userInfo.isLogged && userInfo.userInitials)
            return <Avatar label={`${userInfo.userInitials}`} className='surface-500' size="large" onClick={() => setSidebarVisible(true)} />
        else {
            if (props.componentOnScreen !== 'login')
                return <Button label="Login" icon="pi pi-user" onClick={() => props.renderComponent('login')} className="p-button-secondary p-button-outlined -mr-2 md:mr-0 md:w-auto w-6rem" style={{ borderColor: 'white', color: 'white' }} />
        }
    }

    const logOut = () => {
        setUserInfo({ token: "", isLogged: false, userInitials: "", firstName: "", surname: "", bookings: [] })
        sessionStorage.removeItem("reactiveHoteluserInfo")
        props.renderComponent('landingPage')
    }


    return (
        <div className="w-full p-3 shadow-2 flex align-items-center justify-content-between absolute top-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '1rem 2rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: 1000 }} >
            <Button icon="pi pi-list" className="p-button-secondary p-button-outlined -ml-2 md:ml-0" onClick={() => setSidebarVisible(true)} style={{ borderColor: 'white', color: 'white' }} />
            <div className='flex align-items-center flex-row cursor-pointer h-2rem'>
                <img src="/logo512.png" alt="hyper" height={40} />
                <div className="font-bold ml-1 md:ml-1 text-2xl" onClick={() => props.componentOnScreen === 'login' ? props.renderComponent('landingPage') : ""}>Reactive Hotel</div>
            </div>
            {loginOrAvatar()}


            <Sidebar
                visible={sidebarVisible}
                onHide={() => setSidebarVisible(false)}
                content={({ closeIconRef, hide }) => (
                    <div className="min-h-screen flex relative lg:static surface-ground">
                        <div id="app-sidebar-2" className="surface-section h-screen block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-1 surface-border select-none" style={{ width: '280px' }}>
                            <div className="flex flex-column h-full">
                                <div className="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
                                    <span className="inline-flex align-items-center gap-2">
                                        {userInfo.token && userInfo.isLogged && userInfo.firstName && userInfo.surname ?
                                            <div>
                                                < Avatar label={`${userInfo.userInitials}`} size="large" onClick={() => setSidebarVisible(true)} />
                                                <div className="font-bold ml-1 md:ml-1 text-l">{userInfo.firstName + " " + userInfo.surname}</div>
                                            </div>
                                            :
                                            <Button label="Login" icon="pi pi-user" onClick={(e) => { props.renderComponent('login'); hide(e) }} className="p-button-secondary p-button-outlined -mr-2 md:mr-0 md:w-auto w-6rem" />
                                        }
                                    </span>
                                    <span>
                                        <Button type="button" ref={closeIconRef} onClick={(e) => hide(e)} icon="pi pi-times" rounded outlined className="h-2rem w-2rem"></Button>
                                    </span>
                                </div>
                                <hr className="mx-3 border-top-1 border-none surface-border" />
                                <div className="overflow-y-auto -ml-2">
                                    <ul className="list-none p-3 m-0">
                                        <li>
                                            <ul className="list-none p-0 m-0 overflow-hidden">
                                                <li onClick={(e) => { props.renderComponent('bookingPage'); hide(e) }}>
                                                    <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-200 transition-duration-150 transition-colors w-full">
                                                        <i className="font-semibold pi pi-search mr-2"></i>
                                                        <span className="font-medium">Prenota Ora</span>
                                                        <Ripple />
                                                    </a>
                                                </li>
                                                {userInfo.token && userInfo.isLogged ?
                                                    <div>
                                                        <li onClick={(e) => { props.renderComponent('manageBookings'); hide(e) }}>
                                                            <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-200 transition-duration-150 transition-colors w-full">
                                                                <i className="font-semibold pi pi-file-edit mr-2"></i>
                                                                <span className="font-medium mr-2">Gestisci Prenotazioni</span>
                                                                <Badge value={userInfo.bookings?.length > 0 ? userInfo.bookings.length : 0}></Badge>
                                                                <Ripple />
                                                            </a>
                                                        </li>

                                                        <li>
                                                            <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-200 transition-duration-150 transition-colors w-full">
                                                                <i className="font-semibold pi pi-user mr-2"></i>
                                                                <span className="font-medium">Modifica Profilo</span>
                                                                <Ripple />
                                                            </a>
                                                        </li>
                                                        <li onClick={() => { logOut() }}>
                                                            <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-200 transition-duration-150 transition-colors w-full">
                                                                <i className="font-semibold pi pi-sign-out mr-2"></i>
                                                                <span className="font-medium">Log Out</span>
                                                                <Ripple />
                                                            </a>
                                                        </li>
                                                    </div> : <></>}

                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            ></Sidebar>
        </div>
    );
}

export default TopBar;