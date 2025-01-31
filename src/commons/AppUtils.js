
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

// FUNZIONE CHE PRENDE IN INGRESSO UN ARGOMENTO "data" (yyyymmdd SENZA DIVISORI) E LO FORMATTA IN FORMATO OUTPUT DEL COMPONENTE CALENDAR.
export const revertDataToCalendarFormat = (data) => {
    if (data !== null) {
        data = (String(data));
        let year; let month; let day;
        year = data.substring(0, 4);
        month = data.substring(4, 6);
        day = data.substring(6, 8);

        return (new Date(year, month - 1, day))
    } else {
        return null
    }
}

export const capitalize = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
};