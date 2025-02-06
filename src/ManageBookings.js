import React, { useState, useContext, useEffect } from 'react';
import { addLocale } from 'primereact/api';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { AuthContext, ToastContext } from "./App";
import { formatDate, formatPrice, revertDataToCalendarFormat, datePlusOne, formatDateToDisplay } from './commons/AppUtils';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';


const ManageBookings = (props) => {
    // ###############################################
    // STATI DEL COMPONENTE
    // ###############################################
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setGuests] = useState(0);
    const [rooms, setRooms] = useState(0);
    const [roomsSuggestion, setRoomsSuggestions] = useState({})
    const [gropuedByTypeCombination, setGropuedByTypeCombination] = useState([])
    const [groupedByType, setGroupedByType] = useState([])
    const [manualChoiche, setManualChoiche] = useState(false)
    const [standardInput, setStandardInput] = useState(0)
    const [superiorInput, setSuperiorInput] = useState(0)
    const [suiteInput, setSuiteInput] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0);
    const [roomTypeArray, setRoomTypeArray] = useState([])
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [bookingDetails, setBookingDetails] = useState({})
    const [isModifiyng, setIsModifying] = useState(false)
    const [visibleDialogDelete, setVisibleDialogDelete] = useState(false)
    const [visibleDialogInfo, setVisibleDialogInfo] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [userBookings, setUserBookings] = useState([])

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

    // ###############################################
    // FUNZIONI AUSILIARIE
    // ###############################################
    // Funzione che restituisce il valore dell'inputNumber in base al tipo di stanza
    const valueForType = (type) => {
        switch (type) {
            case 'standard':
                return standardInput;

            case 'superior':
                return superiorInput;

            case 'suite':
                return suiteInput;
            default:
                return 0;
        }
    }

    // Funzione che gestisce il cambio di valore delle dropdown, aggiornando il prezzo totale
    const onDropdownChange = (room, roomType, e) => {
        const newValue = e.value;
        if (roomType === 'standard') {
            setStandardInput(newValue)
        }
        if (roomType === 'superior') {
            setSuperiorInput(newValue)
        }

        if (roomType === 'suite') {
            setSuiteInput(newValue)
        }

        const newTotalPrice = calculateNewTotalPrice(roomType, room.price, newValue);
        setTotalPrice(newTotalPrice);
    }

    // Funzione che calcola il prezzo totale in base al tipo di stanza, al prezzo della stanza e al nuovo valore selezionato
    const calculateNewTotalPrice = (roomType, roomPrice, newValue) => {
        const startDateMidnight = new Date(startDate);
        startDateMidnight.setHours(0, 0, 0, 0);
        const endDateMidnight = new Date(endDate);
        endDateMidnight.setHours(0, 0, 0, 0);

        const stayingDays = (endDateMidnight - startDateMidnight) / (1000 * 60 * 60 * 24);
        let newTotalPrice = totalPrice - (valueForType(roomType) * roomPrice * stayingDays) + (newValue * roomPrice * stayingDays);

        return newTotalPrice <= 0 ? 0 : newTotalPrice;
    }

    // Funzione che restituisce un array di tipi di stanza in base al numero di Stanze selezionate
    const bookingManualRoomsArray = () => {
        let array = []
        for (let i = 0; i < standardInput; i++) {
            array.push('standard')
        }
        for (let i = 0; i < superiorInput; i++) {
            array.push('superior')
        }
        for (let i = 0; i < suiteInput; i++) {
            array.push('suite')
        }
        return array
    }

    // Restituisce il numero massimo di Stanze per un determinato tipo.
    const maxRooms = (type) => {
        const element = groupedByType.find(element => element.room_type === type);
        return element ? element.count : 0;
    }

    // Crea un array di opzioni per il numero di Stanze selezionabili in base al tipo di stanza. ritorna il minimo tra le Stanze disponibili per tipologia e il numero di Stanze richieste.
    const createRoomOptions = (type) => {
        let maxRoomAvailable = maxRooms(type);

        let result = Math.min(maxRoomAvailable, rooms);
        return Array.from({ length: result + 1 }, (_, i) => ({ label: i, value: i }));
    }

    const getUserBooking = async () => {
        try {
            props.blockUiCallaback(true)
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/user_bookings`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userInfo.token}`
                },

            });
            const data = await response.json();
            if (response.ok) {
                props.blockUiCallaback(false)
                setUserInfo({ ...userInfo, bookings: data })
                setUserBookings(data)
                sessionStorage.setItem("reactiveHoteluserInfo", JSON.stringify({ ...userInfo, bookings: data }));
            } else {
                props.blockUiCallaback(false)
                toast.current.show({ severity: 'error', summary: 'Errore', detail: data.message });
            }
        } catch (error) {
            props.blockUiCallaback(false)
            toast.current.show({ severity: 'error', summary: 'Errore', detail: 'Errore durante la ricerca delle prenotazioni utente' });
        }
    }

    const handleSearchModifyBooking = async () => {
        if ((!startDate || !endDate)) {
            toast.current.show({ severity: "error", summary: "Ricerca", detail: "Seleziona un intervallo di di date", life: 3000 });
            return
        }

        const check_in = formatDate(startDate);
        const check_out = formatDate(endDate);

        // Funzione che raggruppa le Stanze per tipo
        const groupByRoomType = (rooms) => {
            const groupedRooms = {};
            rooms.forEach(room => {
                const roomType = room.room_type;
                if (!groupedRooms[roomType]) {
                    groupedRooms[roomType] = {
                        room_type: roomType,
                        quantity: 0,
                        capacity: 0,
                        price: 0,
                        rooms: []
                    };
                }
                groupedRooms[roomType].quantity += 1;
                groupedRooms[roomType].capacity = room.capacity;
                groupedRooms[roomType].price = room.price;
                groupedRooms[roomType].rooms.push(room);
            });
            return Object.values(groupedRooms);
        };


        try {
            props.blockUiCallaback(true)
            const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/rooms_per_type_and_suggestion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    check_in: check_in,
                    check_out: check_out,
                    guests: guests,
                    rooms: rooms,
                    old_booking_id: selectedBooking?.id
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setRoomsSuggestions(data)
                setGroupedByType(data.room_type_counts)
                setGropuedByTypeCombination(groupByRoomType(data.selected_combination))
                // Se se la lunghezza di selected rooms è maggiore delle stanze selezionate, l'utente ha richiesto più stanze di quanto il numero di ospiti possano occupare
                if (data.selected_combination.length > rooms) {
                    setRooms(data.selected_combination.length)
                    toast.current.show({ severity: "warn", summary: "Ricerca", detail: "Il numero di stanze selezionate non è sufficente per gli ospiti richiesti, verrà automaticamente assegnato il numero adeguato di stanze", life: 6000 });
                }
                props.blockUiCallaback(false)
            } else {
                toast.current.show({ severity: "error", summary: "Ricerca", detail: data.error, life: 3000 });
                props.blockUiCallaback(false)
            }
        } catch (error) {
            toast.current.show({ severity: "error", summary: "Ricerca", detail: "Errore durante la ricerca", life: 3000 });
            props.blockUiCallaback(false)
        }
    }

    const handleBookingManual = async () => {

        if (standardInput + superiorInput + suiteInput > rooms) {
            toast.current.show({ severity: "error", summary: "Prenotazione", detail: "Il numero di Stanze selezionate supera il numero di Stanze richieste", life: 3000 });
        } else if (standardInput + superiorInput + suiteInput < rooms) {
            toast.current.show({ severity: "error", summary: "Prenotazione", detail: "Il numero di Stanze selezionate è inferiore al numero di Stanze richieste", life: 3000 });
        }
        else
            try {
                if (!userInfo.token && !userInfo.isLogged) {
                    toast.current.show({ severity: "error", summary: "Ricerca", detail: "Devi effettuare il login per poter prenotare una stanza", life: 3000 });
                    props.renderComponent('login')
                } else {
                    props.blockUiCallaback(true)
                    const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/book`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + userInfo.token,
                        },

                        body: JSON.stringify({
                            check_in: formatDate(startDate),
                            check_out: formatDate(endDate),
                            guests: guests,
                            room_types: bookingManualRoomsArray(),
                            old_booking_id: selectedBooking?.id
                        })
                    })

                    const data = await response.json();
                    if (response.ok) {
                        toast.current.show({ severity: "success", summary: "Prenotazione", detail: "Prenotazione effettuata con successo", life: 3000 });
                        setBookingSuccess(true)
                        setBookingDetails(data.booking_details)
                        setUserInfo({ ...userInfo, bookings: data.user_bookings })
                        sessionStorage.setItem("reactiveHoteluserInfo", JSON.stringify({ ...userInfo, bookings: data.user_bookings }));
                        props.blockUiCallaback(false)
                    } else {
                        toast.current.show({ severity: "error", summary: "Prenotazione", detail: data.error, life: 3000 });
                        props.blockUiCallaback(false)
                    }
                }
            } catch (error) {
                toast.current.show({ severity: "error", summary: "Prenotazione", detail: "Errore durante la prenotazione", life: 3000 });
                props.blockUiCallaback(false)
            }

    };
    // ###############################################
    // RENDERING
    // ###############################################
    //Renderizza la pagina di gestione delle prenotazioni
    const renderBookingManager = () => {

        const today = new Date();
        today.setHours(0, 0, 0, 0)

        const header = () => {
            return (
                <div className='surface-200 -m-3 p-3'>
                    <div className="flex flex-row align-items-center flex-wrap text-xl md:text-xl">
                        < Button className='justify-content-center w-3rem h-3rem ' severity='secondary' tooltip={'Indietro'} outlined icon="pi pi-undo" onClick={() => props.renderComponent('bookingPage')}></Button>
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
                        <div className='flex align-items-center justify-content-center'>Totale Prenotazioni:</div>
                        <div className='flex align-items-center justify-content-center ml-1'>{userBookings.length}</div>
                    </div>
                </div>
            )
        };

        const bodyTemplateDates = (rowData) => {
            return <div className='flex-column -mr-4'>
                < div className='flex flex-row' >
                    <div>Dal: </div>
                    <div className='font-bold ml-1'>{rowData.check_in}</div>
                </div >
                <div className='flex flex-row'>
                    <div>Al: </div>
                    <div className='font-bold ml-2'>{rowData.check_out}</div>
                </div>
            </div >
        }


        const bodyTemplateGuestRooms = (rowData) => {
            return <div className='flex-column -mr-4'>
                < div className='flex flex-row' >
                    <div>Stanze: </div>
                    <div className='font-bold ml-1'>{rowData.rooms?.length > 0 ? rowData.rooms.length : 0}</div>
                </div >
                <div className='flex flex-row'>
                    <div>Ospiti: </div>
                    <div className='font-bold ml-2'>{rowData.guests}</div>
                </div>
            </div >
        }

        const bodyTemplateInfo = (rowData) => {

            const handleOnClickInfo = () => {
                setVisibleDialogInfo(true);
                setIsModifying(false);
                setSelectedBooking(rowData)
                setStartDate(revertDataToCalendarFormat(rowData.check_in))
                setEndDate(revertDataToCalendarFormat(rowData.check_out))
                setGuests(rowData.guests)
                setRooms(rowData.rooms.length)
            }

            if (revertDataToCalendarFormat(rowData.check_in) > today)
                return <div className='flex md:ml-0 -ml-2 md:mr-0 -mr-3'>
                    < Button className='justify-content-center md:p-button-secondary p-button-help border-2' style={{ height: "2.5rem", width: "2.5rem" }} outlined icon="pi pi-info" onClick={() => { handleOnClickInfo() }}></Button>
                </div >
            else return <div className='flex md:ml-0 -ml-2 md:mr-0 -mr-3'>
                < Button className='justify-content-center md:p-button-success p-button-success border-2' tooltip={'Prenotazione Completata'} style={{ height: "2.5rem", width: "2.5rem" }} outlined icon="pi pi-check"></Button>
            </div>
        }

        const bodyTemplateDeleteModify = (rowData) => {

            const handleOnClickDeleteModify = (caller) => {
                if (caller === 'delete') {
                    setVisibleDialogDelete(true);
                    setSelectedBooking(rowData)
                    setStartDate(revertDataToCalendarFormat(rowData.check_in))
                    setEndDate(revertDataToCalendarFormat(rowData.check_out))
                    setGuests(rowData.guests)
                    setRooms(rowData.rooms.length)
                }
                if (caller === 'modify') {
                    setVisibleDialogInfo(true);
                    setIsModifying(true);
                    setSelectedBooking(rowData)
                    setStartDate(revertDataToCalendarFormat(rowData.check_in))
                    setEndDate(revertDataToCalendarFormat(rowData.check_out))
                    setGuests(rowData.guests)
                    setRooms(rowData.rooms.length)
                }
            }
            if (revertDataToCalendarFormat(rowData.check_in) > today)
                return <div className="flex flex-row flex-wrap justify-content-end hidden md:flex">
                    < Button className='mr-2' style={{ height: "2.5rem", width: "2.5rem" }} severity='warning' outlined icon="pi pi-trash" onClick={() => { handleOnClickDeleteModify('delete') }}></Button>
                    < Button className='' style={{ height: "2.5rem", width: "2.5rem" }} outlined icon="pi pi-file-edit" onClick={() => { handleOnClickDeleteModify('modify') }}></Button>
                </div >
        }

        const bodyTemplatePrice = (rowData) => {
            return <div className='font-bold md:ml-0 -ml-4'>{formatPrice(rowData.total_price)}</div>
        }

        return (
            <div >
                <div className="flex mt-6 md:mt-0 flex-column align-items-center justify-content-center border-1 surface-border border-round shadow-2 fadein animation-duration-500">
                    <DataTable stripedRows scrollable scrollHeight='50vh' selectionMode="single" selection={selectedBooking}
                        onSelectionChange={(e) => setSelectedBooking(e.value)} dataKey="id" value={userBookings} header={header} footer={footer} style={{ width: "95vw" }} emptyMessage="Nessuna prenotazione trovata">
                        <Column body={bodyTemplateInfo} ></Column>
                        <Column align={'left'} body={bodyTemplateDates} header="Date Soggiorno" ></Column>
                        <Column header="Dettagli" body={bodyTemplateGuestRooms}></Column>
                        <Column align={'right'} header="Prezzo" body={bodyTemplatePrice} ></Column>
                        <Column className='hidden md:flex' headerClassName='hidden md:flex h-4rem' align={"right"} body={bodyTemplateDeleteModify} ></Column>
                    </DataTable>
                </div>
            </div>
        )
    }

    const headerInfo = (
        <div className={!isModifiyng ? '-mx-3 p-1 fadein animation-duration-200' : 'surface-200 p-1 -mx-2'}>
            <div className="flex flex-column align-items-center justify-content-center -mb-2 md:mb-0">
                {isModifiyng ? <div className='flex'>Prenotazione in modifica</div> : <div></div>}
                <div className="flex flex-wrap justify-content-evenly align-items-center mb-1 md:mb-3">
                    <div className='flex border-1 surface-border align-items-center flex-column border-round shadow-2 p-1 m-1 w-13rem md:w-13rem md:h-4rem md:mt-1 '>
                        <div className="flex mb-1 mr-1 md:mr-0">Check-in: {selectedBooking?.check_in}</div>
                        <div className="flex mb-1 mr-3 md:mr-2">Check-out: {selectedBooking?.check_out}</div>
                    </div>
                    <div className='flex border-1 surface-border align-items-center flex-column border-round md:h-4rem shadow-2 p-1 m-1 md:mt-1'>
                        <div className="flex mb-1 mr-1 md:mr-0">Ospiti: {selectedBooking?.guests}</div>
                        <div className="flex mb-1 mr-1">Stanze: {selectedBooking?.rooms?.length}</div>
                    </div>
                </div>
            </div>
        </div >
    );

    // Renderizza dialog con le informazioni della prenotazione
    const renderInfoDialog = () => {

        const renderManualChoiche = () => {

            const imageBodyTemplate = (room) => {
                return <img src={`/${room.room_type}.jpg`} alt={room.room_type} className="w-8rem shadow-2 border-round -mr-3 md:mr-0" />;
            };

            const roomDetails = (room) => {
                return <div className='flex flex-column align-items-center justify-content-center -mr-3 md:ml-0 -ml-2'>
                    <div className='text-xl font-bold capitalize'>{room.room_type}</div>
                    <div className="text-sm -mt-1">Max {room.capacity} Ospiti</div>
                    <div className='flex flex-column align-items-center justify-content-center m-1'>
                        <div className="font-semibold mb-1">{formatPrice(room.price)}</div>
                        <span className="text-sm -mt-2 line-height-1">per notte a camera</span>
                    </div>
                </div>
            };

            const numberRooms = (room) => {
                return <div className='flex flex-row align-items-center justify-content-end' style={{ overflow: 'hidden' }}>
                    <Dropdown value={valueForType(room.room_type)} options={createRoomOptions(room.room_type)} disabled={roomOptions.length < rooms} onChange={(e) => { onDropdownChange(room, room.room_type, e) }} className='p-1' />
                </div>
            }

            const header = () => {
                const check_in = formatDateToDisplay(startDate);
                const check_out = formatDateToDisplay(endDate);
                return (
                    <div className="surface-200 -mx-3 p-1 -mt-2 -mb-3" >
                        <div className='mb-1 align-items-center justify-content-center text-center md:text-3xl text-m'>{'Nuova Prenotazione'}</div>
                        <div className="flex flex-wrap align-items-center justify-content-between text-l md:text-xl mb-3">
                            < Button className='w-3rem h-3rem  p-button-secondary p-button-outlined md:ml-3 ml-1' tooltip={'Indietro'} icon=" pi pi-undo" onClick={() => { setRoomsSuggestions({}) }}></Button >
                            <div className="flex flex-column justify-content-end text-center">
                                <div className='flex align-items-center justify-content-end'>Check-in: {check_in}</div>
                                <div className='flex align-items-center justify-content-end'>Check-out: {check_out}</div>
                            </div>

                            <div className="flex flex-column justify-content-end text-center">
                                <div className='flex align-items-center justify-content-end'>Ospiti: {guests}</div>
                                <div className='flex align-items-center justify-content-end'>Stanze: {rooms}</div>
                            </div>
                        </div >
                    </div >
                )
            };

            const footer = () => {
                return (
                    <div className="flex flex-row text-l align-items-center justify-content-end flex-wrap -m-3 surface-200" style={{ height: '2.5rem' }}>
                        <div className="flex flex-row justify-content-end m-2">
                            <div className='flex align-items-center justify-content-center'>Totale Soggiorno:</div>
                            <div className='flex align-items-center justify-content-center ml-1'>{formatPrice(totalPrice)}</div>
                        </div>
                    </div>
                )
            };

            if (roomsSuggestion && Object.keys(roomsSuggestion).length > 0 && !bookingSuccess) {
                return (
                    <div className=' fadein animation-duration-200'>
                        <div className='mx-2 font-semibold'>
                            {headerInfo}
                        </div>
                        <div className="flex">
                            <DataTable stripedRows scrollable scrollHeight='33vh' value={groupedByType} header={header} footer={footer} style={{ width: "95vw" }}>
                                <Column align={'left'} header="Foto" body={imageBodyTemplate}></Column>
                                <Column align={'center'} header="Tipo Stanza" body={roomDetails} ></Column>
                                <Column align={'right'} header="Numero Stanze" body={numberRooms}></Column>
                            </DataTable>
                        </div>

                        <div className="flex flex-row justify-content-center justify-content-evenly gap-3 mt-2">
                            <Button label="Prenota" onClick={""} icon={"pi pi-check"} className="p-button-raised p-button-primary mt-1 -mb-3 md:mb-0 w-12rem" />
                        </div>
                    </div>
                )
            }
        }

        const renderSearch = () => {

            if (Object.keys(roomsSuggestion).length === 0 && !manualChoiche && !bookingSuccess) {
                return (
                    <div className='fadein animation-duration-200 font-semibold'>
                        <div className='mx-2'>
                            {headerInfo}
                        </div>
                        <div className="flex flex-column align-items-center justify-content-center relative">
                            <div className="flex flex-column align-items-center justify-content-center w-full fade-in-200 p-4 m-1 md:p-5 shadow-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px' }}>
                                <div className='flex flex-row justify-content-center align-items-center -mt-3'>Dettagli della nuova prenotazione</div>
                                <div className="flex flex-wrap gap-3 flex-row justify-content-center align-items-center mt-3">

                                    <div className="flex align-items-center justify-content-center">
                                        <Calendar minDate={new Date()} id='check-in' dateFormat='dd/mm/yy' locale='it' value={startDate} onChange={(e) => setStartDate(e.value)} placeholder='Modifica Check-in' showIcon showButtonBar />
                                    </div>

                                    <div className="flex align-items-center justify-content-center">
                                        <Calendar id='check-out' minDate={startDate ? datePlusOne(startDate) : datePlusOne(new Date())} dateFormat='dd/mm/yy' locale='it' value={endDate} onChange={(e) => setEndDate(e.value)} placeholder='Modifica Check-out' showIcon showButtonBar />
                                    </div>

                                    <div className="flex align-items-center justify-content-center">
                                        <Dropdown value={guests} options={guestOptions} onChange={(e) => setGuests(e.value)} required placeholder="Guests" />
                                    </div>

                                    <div className="flex align-items-center justify-content-center">
                                        <Dropdown value={rooms} options={roomOptions} onChange={(e) => setRooms(e.value)} required placeholder="Rooms" />
                                    </div>

                                    <div className="flex align-items-center justify-content-center">
                                        <Button label="Cerca Disponibilità" icon="pi pi-search" onClick={handleSearchModifyBooking} className="p-button-raised p-button-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }

        const handleOnHideInfo = () => {
            if (!visibleDialogInfo) {
                return;
            }
            if (isModifiyng) {
                setGuests(0)
                setRooms(0)
                setStartDate(null)
                setEndDate(null)
                setRoomsSuggestions({})
            }
            setVisibleDialogInfo(false)
        }

        const renderBookingInfo = () => {
            // La funzione reduce viene utilizzata per contare il numero di Stanze prenotate per ciascun tipo.
            const roomCounts = selectedBooking.rooms.reduce((acc, room) => {
                // I risultati vengono trasformati in un array di oggetti con il tipo di stanza e il conteggio corrispondente.
                acc[room.type] = (acc[room.type] || 0) + 1;
                return acc;
            }, {});
            // Questo array può essere utilizzato per visualizzare i dettagli delle Stanze prenotate in modo chiaro e strutturato.
            const roomData = Object.keys(roomCounts).map(type => ({
                type,
                count: roomCounts[type]
            }));

            const footerInfo = (
                <div className="flex flex-row text-l align-items-center justify-content-end flex-wrap -m-3 surface-200" style={{ height: '2.5rem' }}>
                    <div className="flex flex-row justify-content-end m-2">
                        <div className='flex align-items-center justify-content-center'>Totale Soggiorno:</div>
                        <div className='flex align-items-center justify-content-center ml-1'>{formatPrice(selectedBooking.total_price)}</div>
                    </div>
                </div>
            );

            return (
                <div>
                    {!isModifiyng ?
                        <div>
                            <DataTable value={roomData} stripedRows scrollable scrollHeight='35vh' header={headerInfo} footer={footerInfo}>
                                <Column className='font-bold capitalize' field="type" header="Tipo" />
                                <Column className='font-bold' field="count" header="Stanze Prenotate" />
                                <Column header="Foto" body={(rowData) => <img src={`/${rowData.type}.jpg`} alt={rowData.type} style={{ width: '100px', height: 'auto' }} />} />
                            </DataTable>
                            <div className="flex flex-row justify-content-center justify-content-evenly gap-3 mt-2">
                                <Button label="Elimina Prenotazione" icon="pi pi-trash" className="p-button-raised p-button-danger mt-3" onClick={() => { setVisibleDialogDelete(true) }} />
                                <Button label="Modifica Prenotazione" icon="pi pi-file-edit" className="p-button-raised p-button-primary mt-3" onClick={() => { setIsModifying(true) }} />
                            </div>
                        </div>
                        :
                        <div>
                            {renderSearch()}
                            {renderManualChoiche()}
                        </div>
                    }
                </div>

            );
        }

        if (selectedBooking)
            return <Dialog visible={visibleDialogInfo} modal headerClassName='-mb-4 -mt-3 h-content' header={!isModifiyng ? "Informazioni Prenotazione" : "Modifica Prenotazione"} dismissableMask onHide={handleOnHideInfo}>
                {renderBookingInfo()}
            </Dialog>
    }
    // Renderizza dialog per la cancellazione della prenotazione
    const renderDeleteDialog = () => {

        const deleteBooking = async () => {
            try {
                props.blockUiCallaback(true)
                const response = await fetch(`${process.env.REACT_APP_ENDPOINT}/cancel_booking`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userInfo.token}`
                    },
                    body: JSON.stringify({ booking_id: selectedBooking.id })
                });
                const data = await response.json();
                if (response.ok) {
                    props.blockUiCallaback(false)
                    toast.current.show({ severity: 'success', summary: 'Successo', detail: 'Prenotazione eliminata con successo' });
                    getUserBooking()
                } else {
                    props.blockUiCallaback(false)
                    toast.current.show({ severity: 'error', summary: 'Errore', detail: data.message });
                }
            } catch (error) {
                props.blockUiCallaback(false)
                toast.current.show({ severity: 'error', summary: 'Errore', detail: 'Errore durante la cancellazione' });
            }
        };

        const accept = () => {
            setVisibleDialogDelete(false);
            setVisibleDialogInfo(false)
            deleteBooking()
        };

        const reject = () => {
            setVisibleDialogDelete(false);
        };

        if (selectedBooking)
            return <ConfirmDialog group="declarative" visible={visibleDialogDelete} onHide={() => { setVisibleDialogDelete(false) }} message="Sicuro di voler eliminare la prenotazione?"
                header="Elimina Prenotazione" icon="pi pi-exclamation-triangle" acceptClassName='p-button-danger w-8rem h-4rem m-2' acceptLabel='Elimina' acceptIcon='pi pi-trash' rejectClassName='p-button-primary w-8rem h-4rem m-2' rejectIcon='pi pi-undo' rejectLabel='Indietro' accept={accept} reject={reject} />
    }


    return (
        <>
            {renderBookingManager()}
            {renderDeleteDialog()}
            {renderInfoDialog()}
        </>
    );
}

export default ManageBookings;