import React, { useState, useContext, useEffect } from 'react';
import { addLocale } from 'primereact/api';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { BlockUI } from 'primereact/blockui';
import { AuthContext, ToastContext } from "./App";
import { formatDate, formatDateToDisplay, formatPrice } from './commons/AppUtils';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { InputNumber } from 'primereact/inputnumber';


const ManageBookings = (props) => {
    // ###############################################
    // STATI DEL COMPONENTE
    // ###############################################
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [roomsSuggestion, setRoomsSuggestions] = useState({})
    const [groupedByType, setGroupedByType] = useState([])
    const [manualChoiche, setManualChoiche] = useState(false)
    const [standardInput, setStandardInput] = useState(0)
    const [superiorInput, setSuperiorInput] = useState(0)
    const [suiteInput, setSuiteInput] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0);
    const [roomTypeArray, setRoomTypeArray] = useState([])
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [bookingDetails, setBookingDetails] = useState({})

    // CONTEXT E USEREF
    const { userInfo, setUserInfo } = useContext(AuthContext);
    const toast = useContext(ToastContext);

    const guestOptions = Array.from({ length: 30 }, (_, i) => ({ label: `${i + 1} Ospit${i > 0 ? 'i' : 'e'}`, value: i + 1 }));
    const roomOptions = Array.from({ length: 30 }, (_, i) => ({ label: `${i + 1} Stanz${i > 0 ? 'e' : 'a'}`, value: i + 1 }));

    //LOCALE
    addLocale('it', {
        firstDayOfWeek: 1,
        dayNames: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
        dayNamesMin: ['D', 'L', 'MA', 'ME', 'G', 'V', 'S'],
        monthNames: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        monthNamesShort: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
        today: 'Oggi',
        clear: 'Pulire',
        dateFormat: 'dd/mm/yy'
    });


    useEffect(() => {
        getUserBooking()
    }, []);


    const getUserBooking = async () => {

        try {
            props.blockUI(true)
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/user_bookings`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userInfo.token}`
                },

            });
            const data = await response.json();
            if (response.ok) {
                props.blockUI(false)
                setUserInfo({ ...userInfo, bookings: data })
                sessionStorage.setItem("reactiveHoteluserInfo", JSON.stringify({ ...userInfo, bookings: data }));
            } else {
                props.blockUI(false)
                toast.current.show({ severity: 'error', summary: 'Errore', detail: data.message });
            }
        } catch (error) {
            props.blockUI(false)
            toast.current.show({ severity: 'error', summary: 'Errore', detail: 'Errore durante la ricerca delle prenotazioni utente' });
        }
    }


    const header = () => {
        return (
            <div className='surface-200 -m-3 p-3'>
                <div className="flex flex-row align-items-center flex-wrap text-xl md:text-xl">
                    < Button className='justify-content-center w-3rem h-3rem ' severity='secondary' outlined icon="pi pi-undo" onClick={() => props.renderComponent('bookingPage')}></Button>
                </div >
                <div className="flex flex-row justify-content-center align-items-center flex-wrap text-l md:mb-0 -mb-6 md:ml-0 ml-6 md:text-xl" style={{ height: '3.5rem' }}>
                    <div className='align-items-center justify-content-center md:text-3xl text-2xl -mt-8 md:-mt-1 m-3 md:m-0'>Gestione Prenotazioni</div>
                </div >

            </div >
        )
    };

    const footer = () => {
        return (
            <div className="flex flex-row text-l align-items-center justify-content-end flex-wrap -m-3 surface-200" style={{ height: '2.5rem' }}>
                <div className="flex flex-row justify-content-end m-2">
                    <div className='flex align-items-center justify-content-center'>Numero Prenotazioni:</div>
                    <div className='flex align-items-center justify-content-center ml-1'>{userInfo.bookings.length}</div>
                </div>
            </div>
        )
    };

    const bodyTemplateDates = (rowData) => {
        return <div className='flex flex-column '>
            <div className='flex'>Check In: {rowData.check_in}</div>
            <div className='flex'>Check Out: {rowData.check_out}</div>
        </div>
    }


    const bodyTemplateGuestRooms = (rowData) => {
        return <div className='flex flex-column '>
            <div className='flex'>Ospiti: {rowData.guests}</div>
            <div className='flex'>Stanze: {rowData.rooms?.length > 0 ? rowData.rooms.length : 0}</div>
        </div>
    }

    const bodyTemplatePrice = (rowData) => {
        return <div>{formatPrice(rowData.total_price)}</div>
    }

    const renderManualChoiche = () => {
        if (userInfo.bookings && userInfo.bookings.length > 0 && userInfo.isLogged && userInfo.token) {
            return (
                <div >
                    <div className="flex mt-6 md:mt-0 flex-column align-items-center justify-content-center relative border-1 surface-border border-round shadow-2 fadein animation-duration-500 m-2 md:m-0">
                        <DataTable stripedRows scrollable scrollHeight='60vh' value={userInfo.bookings} header={header} footer={footer} style={{ width: "95vw" }}>
                            <Column body={bodyTemplateDates} header="Date Soggiorno" ></Column>
                            <Column header="Numero Stanze" body={bodyTemplateGuestRooms}></Column>
                            <Column header="Prezzo" body={bodyTemplatePrice} ></Column>
                        </DataTable>
                    </div>

                    <div className="flex flex-row justify-content-center justify-content-evenly gap-3 mt-2">
                        <Button label="Soluzione Suggerita" icon={"pi pi-lightbulb"} onClick={() => ""} className="p-button-raised p-button-secondary w-10rem" />
                        <Button label="Prenota" onClick={""} icon={"pi pi-check"} className="p-button-raised p-button-primary w-8rem" />
                    </div>
                </div>
            )
        }
        else {
            props.renderComponent('login')
        }
    }

    // ###############################################
    // FUNZIONI AUSILIARIE
    // ###############################################
    // FUNZIONE CHE PRENDE IN INGRESSO UNA DATA E RESTITUISCE LA STESSA DATA + 1 GIORNO



    return (
        <>
            {renderManualChoiche()}
        </>
    );
}

export default ManageBookings;