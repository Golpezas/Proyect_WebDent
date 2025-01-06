/*const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const filePath = path.join('C:', 'Users', 'Mamut', 'Desktop', 'PWebDent', 'ServidorDentista.xlsx');

// Cargar citas existentes desde el archivo Excel si existe
let appointments = [];
if (fs.existsSync(filePath)) {
    console.log('Loading existing appointments from Excel file.');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Appointments'];
    if (worksheet) {
        appointments = XLSX.utils.sheet_to_json(worksheet);
    } else {
        console.log('No "Appointments" sheet found in the Excel file. Creating a new one.');
    }
} else {
    console.log('No existing Excel file found. Starting with an empty list of appointments.');
}

// Ruta para reservar una cita
app.post('/api/book-appointment', (req, res) => {
    const { name, email, dni, phone, date, time } = req.body;

    try {
        const newAppointment = { Name: name, Email: email, DNI: dni, Phone: phone, Date: date, Time: time };
        appointments.push(newAppointment);

        const data = [
            ['Name', 'Email', 'DNI', 'Phone', 'Date', 'Time'],
            ...appointments.map(appointment => [appointment.Name, appointment.Email, appointment.DNI, appointment.Phone, appointment.Date, appointment.Time])
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        let wb;
        if (fs.existsSync(filePath)) {
            wb = XLSX.readFile(filePath);
            // Si la hoja ya existe, elimínala antes de agregar la nueva
            if (wb.Sheets['Appointments']) {
                console.log('Worksheet "Appointments" already exists. It will be replaced.');
                wb.Sheets['Appointments'] = ws;
            } else {
                XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
            }
        } else {
            wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
        }

        XLSX.writeFile(wb, filePath);
        console.log(`File saved to ${filePath}`);
        res.json({ message: 'Appointment booked and saved to Excel file.' });
    } catch (error) {
        console.error(`Error saving file: ${error.message}`);
        res.status(500).json({ message: 'Error saving appointment to Excel file.', error: error.message });
    }
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});*/

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const filePath = path.join('C:', 'Users', 'Mamut', 'Desktop', 'PWebDent', 'ServidorDentista.xlsx');

// Cargar citas existentes desde el archivo Excel si existe
let appointments = [];
if (fs.existsSync(filePath)) {
    console.log('Loading existing appointments from Excel file.');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Appointments'];
    if (worksheet) {
        appointments = XLSX.utils.sheet_to_json(worksheet);
    } else {
        console.log('No "Appointments" sheet found in the Excel file. Creating a new one.');
    }
} else {
    console.log('No existing Excel file found. Starting with an empty list of appointments.');
}

// Ruta para reservar una cita
app.post('/api/book-appointment', (req, res) => {
    const { name, email, dni, phone, date, time } = req.body;
    const appointmentDateTime = new Date(`${date}T${time}`);

    // Validar si la cita está dentro de las restricciones de 1 hora
    const isConflicting = appointments.some(appointment => {
        const existingAppointmentDateTime = new Date(`${appointment.Date}T${appointment.Time}`);
        const timeDifference = Math.abs(existingAppointmentDateTime - appointmentDateTime) / (1000 * 60); // Diferencia en minutos
        return appointment.Date === date && timeDifference < 60; // Mismo día y diferencia de menos de 60 minutos
    });

    if (isConflicting) {
        return res.status(400).json({ 
            message: 'The appointment time is too close to an existing appointment. Please choose a different time or date.',
            availableTimes: getAvailableTimes(appointments, date)
        });
    }

    try {
        const newAppointment = { Name: name, Email: email, DNI: dni, Phone: phone, Date: date, Time: time };
        appointments.push(newAppointment);

        const data = [
            ['Name', 'Email', 'DNI', 'Phone', 'Date', 'Time'],
            ...appointments.map(appointment => [appointment.Name, appointment.Email, appointment.DNI, appointment.Phone, appointment.Date, appointment.Time])
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        let wb;
        if (fs.existsSync(filePath)) {
            wb = XLSX.readFile(filePath);
            // Si la hoja ya existe, elimínala antes de agregar la nueva
            if (wb.Sheets['Appointments']) {
                console.log('Worksheet "Appointments" already exists. It will be replaced.');
                wb.Sheets['Appointments'] = ws;
            } else {
                XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
            }
        } else {
            wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
        }

        XLSX.writeFile(wb, filePath);
        console.log(`File saved to ${filePath}`);
        res.json({ message: 'Appointment booked and saved to Excel file.' });
    } catch (error) {
        console.error(`Error saving file: ${error.message}`);
        res.status(500).json({ message: 'Error saving appointment to Excel file.', error: error.message });
    }
});

// Función para obtener horarios disponibles
function getAvailableTimes(appointments, date) {
    const bookedTimes = appointments
        .filter(appointment => appointment.Date === date)
        .map(appointment => new Date(`${appointment.Date}T${appointment.Time}`));

    const availableTimes = [];
    for (let hour = 7; hour <= 18; hour++) { // Horarios de 7 AM a 6 PM
        const time = new Date(`${date}T${hour.toString().padStart(2, '0')}:00`);
        const isAvailable = bookedTimes.every(bookedTime => {
            const timeDifference = Math.abs(bookedTime - time) / (1000 * 60); // Diferencia en minutos
            return timeDifference >= 60;
        });

        if (isAvailable) {
            availableTimes.push(time.toTimeString().substr(0, 5)); // Formato HH:MM
        }
    }

    return availableTimes;
}

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});