
// FUNZIONE CHE PRENDE IN INGRESSO UN ARGOMENTO DAL CALENDARIO E RESTITUISCE LA DATA DA INVIARE COME PARAMETRO NELLE CHIAMATE AI SERVIZI (RETURN: "yyyymmdd")
export const formatDate = (str) => {
    var date = new Date(str),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2)

    return ([date.getFullYear(), month, day].join(""))
}

export const formatDateToDisplay = (str) => {
    var date = new Date(str),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2)

    return ([day, month, date.getFullYear()].join("/"))
}

// FUNZIONE CHE PRENDE IN INGRESSO UN ARGOMENTO "data" (dd/mm/yyyy) E LO FORMATTA IN FORMATO OUTPUT DEL COMPONENTE CALENDAR.
export const revertDataToCalendarFormat = (data) => {
    if (data !== null) {
        data = (String(data));
        let year; let month; let day;
        day = data.substring(0, 2);
        month = data.substring(3, 5);
        year = data.substring(6, 10);

        return (new Date(year, month - 1, day))
    } else {
        return null
    }
}

// Funzione che restituisce la data + 1 giorno
export const datePlusOne = (date) => {
    let futureDate = new Date(date)
    futureDate.setDate(futureDate.getDate() + 1)

    return futureDate
}

// Funzione che formatta il prezzo in valuta
export const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);
};
