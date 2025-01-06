document.getElementById('appointmentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const dni = document.getElementById('dni').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    fetch('http://localhost:3000/api/book-appointment', {  // Asegúrate de que la URL sea correcta
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, dni, phone, date, time })
    })
    .then(response => response.json())
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
            title: 'Error',
            text: 'Failed to fetch: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        console.error('Error:', error);
    });
});