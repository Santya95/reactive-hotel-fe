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
import { formatDate, formatPrice, revertDataToCalendarFormat, datePlusOne } from './commons/AppUtils';
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
    // ###############################################
    // RENDERING
    // ###############################################
    const renderBookingManager = () => {

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

            return <div className='flex md:ml-0 -ml-2 md:mr-0 -mr-3'>
                < Button className='justify-content-center md:p-button-secondary p-button-help border-2' style={{ height: "2.5rem", width: "2.5rem" }} outlined icon="pi pi-info" onClick={() => { handleOnClickInfo() }}></Button>
            </div >
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


    // Renderizza dialog con le informazioni della prenotazione
    const renderInfoDialog = () => {

        const handleOnHideInfo = () => {
            if (!visibleDialogInfo) {
                return;
            }
            if (isModifiyng) {
                setGuests(0)
                setRooms(0)
                setStartDate(null)
                setEndDate(null)
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

            const headerInfo = (
                <div className={!isModifiyng ? 'surface-200 -m-3 p-1 fadein animation-duration-200' : 'surface-200 p-1 -mx-3  fadein animation-duration-200'}>
                    <div className="flex flex-column align-items-center justify-content-center -mb-2 md:mb-0">
                        {isModifiyng ? <div className='flex'>Prenotazione in modifica</div> : <div></div>}
                        <div className="flex flex-wrap justify-content-evenly align-items-center mb-1 md:mb-3">
                            <div className='flex border-1 surface-border align-items-center flex-column border-round shadow-2 p-1 m-1 w-14rem md:w-14rem md:h-4rem md:mt-1 '>
                                <div className="flex mb-1 mr-1 md:mr-0">Check-in: {selectedBooking.check_in}</div>
                                <div className="flex mb-1 mr-2">Check-out: {selectedBooking.check_out}</div>
                            </div>
                            <div className='flex border-1 surface-border align-items-center flex-column border-round md:h-4rem shadow-2 p-1 m-1 md:mt-1'>
                                <div className="flex mb-1 mr-1 md:mr-0">Ospiti: {selectedBooking.guests}</div>
                                <div className="flex mb-1 mr-1">Stanze: {selectedBooking.rooms.length}</div>
                            </div>
                        </div>
                    </div>
                </div >
            );

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
                        <div className='fadein animation-duration-200 font-semibold'>
                            <div className='mx-2'>
                                {headerInfo}
                            </div>
                            <div className="flex flex-column align-items-center justify-content-center relative">
                                <div className="flex flex-column align-items-center justify-content-center w-full fade-in-200 p-4 m-1 md:p-5 shadow-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px' }}>
                                    <div className='flex flex-row justify-content-center align-items-center -mt-3'>Inserire Date e dettagli della nuova prenotazione</div>
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

                    }
                </div>

            );
        }

        if (selectedBooking)
            return <Dialog visible={visibleDialogInfo} modal style={{ width: "95vh" }} header={!isModifiyng ? "Informazioni Prenotazione" : "Modifica Prenotazione"} dismissableMask onHide={handleOnHideInfo}>
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