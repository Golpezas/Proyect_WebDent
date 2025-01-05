const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const filePath = path.join('C:', 'Users', 'Mamut', 'Desktop', 'PWebDent', 'ServidorDentista.xlsx');

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

app.post('/api/book-appointment', (req, res) => {
    const { name, email, dni, phone, date, time } = req.body;

    const overlapping = appointments.find(appointment => appointment.Date === date && appointment.Time === time);
    if (overlapping) {
        return res.status(400).send({ message: `Fecha y hora ya reservadas: ${date} a las ${time}. Intente de nuevo.` });
    }

    const newAppointment = { Name: name, Email: email, DNI: dni, Phone: phone, Date: date, Time: time };
    appointments.push(newAppointment);

    const data = [
        ['Name', 'Email', 'DNI', 'Phone', 'Date', 'Time'],
        ...appointments.map(appointment => [appointment.Name, appointment.Email, appointment.DNI, appointment.Phone, appointment.Date, appointment.Time])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = fs.existsSync(filePath) ? XLSX.readFile(filePath) : XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');

    try {
        XLSX.writeFile(wb, filePath);
        console.log(`File saved to ${filePath}`);
        res.send({ message: 'Appointment booked and saved to Excel file.' });
    } catch (error) {
        console.error(`Error saving file: ${error}`);
        res.status(500).send({ message: 'Error saving appointment to Excel file.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});