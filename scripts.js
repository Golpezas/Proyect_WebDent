document.getElementById('appointmentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const dni = document.getElementById('dni').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, dni, phone, date, time })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.message); });
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            title: 'Success',
            text: data.message,
            icon: 'success',
            confirmButtonText: 'OK'
        });
    })
    .catch(error => {
        Swal.fire({
            title: 'Advertencia',
            text: 'Fecha y hora no disponible, seleccione fecha u hora diferente. Gracias',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        });
        console.error('Error:', error);
    });
});