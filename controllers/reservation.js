const connection = require('./connection');
let ObjectId = require('mongodb').ObjectId;

async function getReservation(id) {
    const mongoClient = await connection.getConnection();
    let reserva = undefined;
    try {
        reserva = await mongoClient.db('ReservasPuesto').collection('reservas').findOne({ _id: new ObjectId(id) });
    } catch (error) {
        console.log('area not found');
    }
    return reserva;
}

async function getReservationByDate(date) {
    const mongoClient = await connection.getConnection();
    const reservas = await mongoClient.db('ReservasPuesto').collection('reservas').findOne({ date: date });
    return reservas;
}

async function addReservation(date) {
    let reserva = { date: date, usersId: [] }
    const mongoClient = await connection.getConnection();
    const result = await mongoClient.db('ReservasPuesto')
        .collection('reservas')
        .insertOne(reserva);
    return result;
}

async function addUserToReservation(userId, id) {
    const mongoClient = await connection.getConnection();
    const reservation = await getReservation(id);
    if (!reservation) {
        return null;
    }
    let newUsersId = reservation.usersId
    newUsersId.push(userId);
    const result = await mongoClient.db('ReservasPuesto')
        .collection('reservas')
        .updateOne(
            { _id: id },
            { $set: { "usersId": newUsersId } });

    return result;
}

async function validarFechaYReserva(user, date) {
    // TODO: unix timestamp
    let mesActual = new Date().getMonth();
    let anioActual = new Date().getFullYear();
    let diaMesActual = new Date().getDate();
    let valido = false;
    let fechaReserva = new Date(date);
    console.log(fechaReserva);

    let diaSemana = fechaReserva.getDay(); // domingo a sabado(0-6)
    let diaMes = fechaReserva.getDate(); // 0 al 30
    let mes = fechaReserva.getMonth(); // enero - diciembre (0-11)
    let anio = fechaReserva.getFullYear(); // año 2021

    if (diaSemana && diaMes && mes && anio) {
        if (diaSemana >= 1 || diaSemana <= 5 || mes == mesActual || anioActual == anio) {
            if (diaMes >= diaMesActual) {

                let reservas = user.reservas;
                let i = 0;

                while (i < reservas.length && valido) {
                    if (reservas[i] == date) {
                        valido = false;
                    } else {
                        i++;
                    }
                }
                if (valido) {
                    user.reservas.push(date)
                }
            } else {
                valido = false;
            }
        } else {
            valido = false;
        }
    }
    return valido;
}

module.exports = { getReservation, getReservationByDate, addReservation, addUserToReservation, validarFechaYReserva }