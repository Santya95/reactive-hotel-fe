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
import { formatDate, formatDateToDisplay, capitalize } from './commons/AppUtils';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { InputNumber } from 'primereact/inputnumber';


const ManageBookings = (props) => {
    // ###############################################
    // STATI DEL COMPONENTE
    // ###############################################
    const [blocked, setBlocked] = useState(false);
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
            setBlocked(true)
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/user_bookings`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userInfo.token}`
                },

            });
            const data = await response.json();
            if (response.ok) {
                setBlocked(false)
                setUserInfo({ data })
                console.log(data)
            } else {
                setBlocked(false)
                toast.current.show({ severity: 'error', summary: 'Errore', detail: data.message });
            }
        } catch (error) {
            setBlocked(false)
            toast.current.show({ severity: 'error', summary: 'Errore', detail: 'Errore durante la ricerca delle prenotazioni utente' });
        }
    }



    // ###############################################
    // FUNZIONI AUSILIARIE
    // ###############################################
    // FUNZIONE CHE PRENDE IN INGRESSO UNA DATA E RESTITUISCE LA STESSA DATA + 1 GIORNO



    return (
        <>
            <BlockUI blocked={blocked} className='mt-8' template={<i className="pi pi-spin pi-spinner" style={{ fontSize: '4rem' }}></i>}>

            </BlockUI >
        </>
    );
}

export default ManageBookings;