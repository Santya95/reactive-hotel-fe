import React, { useState, useContext } from 'react';
import { addLocale } from 'primereact/api';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { AuthContext, ToastContext } from "./App";
import { formatDate, formatDateToDisplay, formatPrice, revertDataToCalendarFormat, datePlusOne } from './commons/AppUtils';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';



const BookingPage = (props) => {
  // ###############################################
  // STATI DEL COMPONENTE
  // ###############################################
  const [startDate, setStartDate] = useState(sessionStorage.getItem("reactiveHotelLastSearch") ? revertDataToCalendarFormat(JSON.parse(sessionStorage.getItem("reactiveHotelLastSearch")).check_in) : null);
  const [endDate, setEndDate] = useState(sessionStorage.getItem("reactiveHotelLastSearch") ? revertDataToCalendarFormat(JSON.parse(sessionStorage.getItem("reactiveHotelLastSearch")).check_out) : null);
  const [guests, setGuests] = useState(sessionStorage.getItem("reactiveHotelLastSearch") ? JSON.parse(sessionStorage.getItem("reactiveHotelLastSearch")).guests : 2);
  const [rooms, setRooms] = useState(sessionStorage.getItem("reactiveHotelLastSearch") ? JSON.parse(sessionStorage.getItem("reactiveHotelLastSearch")).room_types.length : 1);
  const [roomsSuggestion, setRoomsSuggestions] = useState({})
  const [gropuedByTypeCombination, setGropuedByTypeCombination] = useState([])
  const [groupedByType, setGroupedByType] = useState([])
  const [manualChoiche, setManualChoiche] = useState(false)
  const [standardInput, setStandardInput] = useState(0)
  const [superiorInput, setSuperiorInput] = useState(0)
  const [suiteInput, setSuiteInput] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0);
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


  // ###############################################
  // HANDLERS
  // ###############################################
  const handleSearch = async () => {

    if ((!startDate || !endDate)) {
      toast.current.show({ severity: "error", summary: "Ricerca", detail: "Seleziona un intervallo di di date", life: 3000 });
      return
    }
    if (rooms > guests) {
      setRooms(guests)
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
          rooms: rooms > guests ? guests : rooms
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

  const handleBookingSuggestion = async () => {

    const generateRoomTypesArrayForSuggested = (array) => {
      let roomTypes = []
      array.forEach(rooms => {
        rooms.rooms.forEach(room => {
          roomTypes.push(room.room_type)
        })
      });
      return roomTypes
    }

    try {

      let lastSearch = {
        check_in: formatDate(startDate),
        check_out: formatDate(endDate),
        guests: guests,
        room_types: generateRoomTypesArrayForSuggested(gropuedByTypeCombination)
      }

      if (!userInfo.token && !userInfo.isLogged) {
        toast.current.show({ severity: "error", summary: "Ricerca", detail: "Devi effettuare il login per poter prenotare una stanza", life: 3000 });
        props.renderComponent('login')
        sessionStorage.setItem("reactiveHotelLastSearch", JSON.stringify(lastSearch))
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
            room_types: generateRoomTypesArrayForSuggested(gropuedByTypeCombination)
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


  const getPhoto = (type) => {
    switch (type) {
      case 'standard':
        return '/standard.jpg';

      case 'superior':
        return '/superior.jpg';

      case 'suite':
        return '/suite.jpg';

      default:
        return null;
    }
  };

  const resetBooking = () => {
    setGropuedByTypeCombination({})
    setRoomsSuggestions({})
    setGroupedByType([])
    setStandardInput(0)
    setSuperiorInput(0)
    setSuiteInput(0)
    setTotalPrice(0)
    setManualChoiche(false)
    setBookingSuccess(false)
    setBookingDetails({})
  }

  const resetBookingSuccesful = () => {
    resetBooking()
    setStartDate(null)
    setEndDate(null)
    setGuests(2)
    setRooms(1)
  }

  const switchSuggestedManual = () => {
    if (!manualChoiche)
      setManualChoiche(true)
    else setManualChoiche(false)
  }


  // ###############################################
  // RENDERING
  // ###############################################
  const renderBookingPage = () => {
    if (Object.keys(roomsSuggestion).length === 0 && !manualChoiche)
      return (
        <div className="flex flex-column align-items-center justify-content-center relative fadein animation-duration-500">
          <h1 className="flex align-items-center justify-content-center mb-3 md:mt-0 -mt-3" style={{ fontSize: '2.5rem', color: 'white' }}>Prenota il tuo soggiorno!</h1>
          <div className="flex flex-column align-items-center justify-content-center fade-in-200 p-4 m-5 md:p-5 shadow-2 fadein animation-duration-500" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px' }}>
            <div className="flex flex-wrap gap-3 flex-row justify-content-center align-items-center">

              <div className="flex align-items-center justify-content-center">
                <Calendar id='check-in' minDate={new Date()} appendTo={'self'} dateFormat='dd/mm/yy' locale='it' value={startDate} onChange={(e) => setStartDate(e.value)} placeholder='Data Check-in' showIcon showButtonBar />
              </div>

              <div className="flex align-items-center justify-content-center">
                <Calendar id='check-out' minDate={startDate ? datePlusOne(startDate) : datePlusOne(new Date())} dateFormat='dd/mm/yy' locale='it' value={endDate} onChange={(e) => setEndDate(e.value)} placeholder='Data Check-out' showIcon showButtonBar />
              </div>

              <div className="flex align-items-center justify-content-center">
                <Dropdown value={guests} options={guestOptions} onChange={(e) => setGuests(e.value)} required placeholder="Guests" />
              </div>
              <div className="flex align-items-center justify-content-center">
                <Dropdown value={rooms} options={roomOptions} onChange={(e) => setRooms(e.value)} required placeholder="Rooms" />
              </div>
              <div className="flex align-items-center justify-content-center">
                <Button label="Cerca" icon="pi pi-search" onClick={handleSearch} className="p-button-raised p-button-primary" />
              </div>
            </div>
          </div>
        </div>
      )
  }

  const header = () => {
    const check_in = formatDateToDisplay(startDate);
    const check_out = formatDateToDisplay(endDate);
    return (
      <div className="surface-200 -m-3 p-1" >
        <div className='mb-1 align-items-center justify-content-center text-center md:text-3xl text-2xl -mt-1'>{manualChoiche ? 'Personalizza Scelta' : 'Soluzione Suggerita'}</div>
        <div className="flex flex-row text-l align-items-center justify-content-between flex-wrap w-full text-l md:text-xl" style={{ height: '3.5rem' }}>
          < Button className='w-3rem h-3rem  p-button-secondary p-button-outlined md:ml-3 ml-1' icon=" pi pi-undo" onClick={() => resetBooking()}></Button >
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
          <div className='flex align-items-center justify-content-center ml-1'>{!manualChoiche ? (formatPrice(roomsSuggestion.total_cost_selected_combination)) : formatPrice(totalPrice)}</div>
        </div>
      </div>
    )
  };

  const renderRoomsSuggestions = () => {

    const itemTemplate = (type, index) => {
      return (
        <div key={type.room_type} className={classNames('flex flex-row xl:flex-row xl:align-items-start gap-4', { 'border-top-1 surface-border': index !== 0 })} style={{ padding: '0.5rem' }} >
          <img className="w-12rem md:w-14rem shadow-2 block xl:block mx-auto border-round" src={getPhoto(type.room_type)} alt={type.room_type} />
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3 md:ml-0 -ml-3">
              <div className="text-xl font-bold text-900">{`${type.rooms.length} Stanz${type.rooms.length > 1 ? 'e' : 'a'} `}</div>
              <div className="flex align-items-center gap-3">
                <span className="flex align-items-center gap-2">
                  <i className="pi pi-tag"></i>
                  <span className="font-semibold text-l capitalize">{type.room_type}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-column align-items-center sm:align-items-end">
              <span className="text-2xl font-semibold">{formatPrice(type.rooms[0].price)}</span>
              <span className="text-sm -mt-2">per notte a stanza</span>
            </div>
          </div>
        </div>
      );
    };

    const listTemplate = (items) => {
      if (!items || items.length === 0) return null;

      let list = items.map((type, index) => {
        return itemTemplate(type, index);
      });

      return <div>{list}</div>;
    };

    if (roomsSuggestion && Object.keys(roomsSuggestion).length > 0 && !manualChoiche && !bookingSuccess) {
      return (
        <div>
          <div className="flex mt-6 md:mt-0 flex-column align-items-center justify-content-center relative border-1 surface-border border-round shadow-2 fadein animation-duration-500 m-2 md:md-0" >
            <DataView header={header()} footer={footer()} value={gropuedByTypeCombination} style={{ width: "95vw" }} listTemplate={listTemplate} rows={3} />
          </div>
          <div className="flex flex-row justify-content-center justify-content-evenly gap-3 mt-2">
            <Button label="Personalizza Scelta Stanza" icon={"pi pi-pen-to-square"} onClick={switchSuggestedManual} className="p-button-raised p-button-secondary w-10rem" />
            <Button label="Prenota" onClick={handleBookingSuggestion} icon={"pi pi-check"} className="p-button-raised p-button-primary w-10rem" />
          </div>
        </div>
      );
    }
  }

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

    if (roomsSuggestion && Object.keys(roomsSuggestion).length > 0 && manualChoiche && !bookingSuccess) {
      return (
        <div >
          <div className="flex mt-6 md:mt-0 flex-column align-items-center justify-content-center relative border-1 surface-border border-round shadow-2 fadein animation-duration-500 m-2 md:md-0">
            <DataTable stripedRows scrollable scrollHeight='45vh' value={groupedByType} header={header} footer={footer} style={{ width: "95vw" }} emptyMessage="Nessun suggerimento">
              <Column align={'left'} header="Foto" body={imageBodyTemplate}></Column>
              <Column align={'center'} header="Tipo Stanza" body={roomDetails} ></Column>
              <Column align={'right'} header="Numero Stanze" body={numberRooms}></Column>
            </DataTable>
          </div>

          <div className="flex flex-row justify-content-center justify-content-evenly gap-3 mt-2">
            <Button label="Soluzione Suggerita" icon={"pi pi-lightbulb"} onClick={() => setManualChoiche(false)} className="p-button-raised p-button-secondary w-10rem" />
            <Button label="Prenota" onClick={handleBookingManual} icon={"pi pi-check"} className="p-button-raised p-button-primary w-8rem" />
          </div>
        </div>
      )
    }
  }

  const renderBookingSuccess = () => {
    if (roomsSuggestion && Object.keys(roomsSuggestion).length > 0 && bookingSuccess) {
      // La funzione reduce viene utilizzata per contare il numero di Stanze prenotate per ciascun tipo.
      const roomCounts = bookingDetails.rooms.reduce((acc, room) => {
        // I risultati vengono trasformati in un array di oggetti con il tipo di stanza e il conteggio corrispondente.
        acc[room.room_type] = (acc[room.room_type] || 0) + 1;
        return acc;
      }, {});
      // Questo array può essere utilizzato per visualizzare i dettagli delle Stanze prenotate in modo chiaro e strutturato.
      const roomData = Object.keys(roomCounts).map(type => ({
        type,
        count: roomCounts[type]
      }));

      const headerSuccess = (
        <div className='surface-200 -m-3 p-1'>
          <div className="flex flex-column align-items-center justify-content-center -mb-2 md:mb-0">
            <h2 className="mb-3 line-height-1 -mt-1 md:mt-0" style={{ fontSize: '2.5rem', color: 'green' }}>Prenotazione Effettuata con Successo!</h2>
            <div className="flex flex-wrap justify-content-evenly align-items-center mb-1 md:mb-3">
              <div className='flex border-1 surface-border align-items-center flex-column border-round shadow-2 p-1 m-1 w-14rem md:w-14rem md:h-4rem md:mt-1'>
                <div className="flex mb-1 mr-1 md:mr-0">Check-in: {bookingDetails.check_in}</div>
                <div className="flex mb-1 mr-2">Check-out: {bookingDetails.check_out}</div>
              </div>
              <div className='flex border-1 surface-border align-items-center flex-column border-round md:h-4rem shadow-2 p-1 m-1 md:mt-1'>
                <div className="flex mb-1 mr-1 md:mr-0">Ospiti: {bookingDetails.guests}</div>
                <div className="flex mb-1 mr-1">Stanze: {bookingDetails.rooms.length}</div>
              </div>
            </div>
          </div>
        </div >
      );

      const footerSuccess = (
        <div className="flex flex-row text-l align-items-center justify-content-end flex-wrap -m-3 surface-200" style={{ height: '2.5rem' }}>
          <div className="flex flex-row justify-content-end m-2">
            <div className='flex align-items-center justify-content-center'>Totale Soggiorno:</div>
            <div className='flex align-items-center justify-content-center ml-1'>{formatPrice(bookingDetails.total_price)}</div>
          </div>
        </div>
      );

      return (
        <div>
          <div className="flex mt-6 md:mt-0 flex-column align-items-center justify-content-center relative border-1 surface-border border-round shadow-2 fadein animation-duration-500 m-2">
            <DataTable value={roomData} stripedRows scrollable scrollHeight='35vh' header={headerSuccess} footer={footerSuccess} style={{ width: "95vw" }}>
              <Column align={'left'} className='font-bold capitalize' field="type" header="Tipo" />
              <Column align={'center'} className='font-bold' field="count" header="Stanze Prenotate" />
              <Column align={'right'} header="Foto" body={(rowData) => <img src={`/${rowData.type}.jpg`} alt={rowData.type} style={{ width: '100px', height: 'auto' }} />} />
            </DataTable>
          </div>

          <div className="flex flex-row justify-content-center justify-content-evenly gap-3 mt-2">
            <Button label="Torna alla Home" icon="pi pi-home" className="p-button-raised p-button-primary mt-3" onClick={resetBookingSuccesful} />
          </div>
        </div>
      );
    }
  };


  return (
    <>
      {renderBookingPage()}
      <div className="flex align-items-center justify-content-center fadein animation-duration-500 overflow-hidden" >
        {renderRoomsSuggestions()}
        {renderManualChoiche()}
        {renderBookingSuccess()}
      </div>
    </>
  );
}

export default BookingPage;