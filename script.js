document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-page-container');
    const appContainer = document.getElementById('app-main-container');

    // Handle the login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'Tecnico_invitado' && password === '0002') {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
            document.body.classList.remove('login-page');
            document.body.classList.add('app-page');
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    });

    // Functionality to clear fields with a button
    document.querySelectorAll('.clear-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const inputGroup = e.target.closest('.input-with-button') || e.target.closest('.textarea-with-buttons');
            if (inputGroup) {
                const input = inputGroup.querySelector('input, textarea, select');
                if (input) {
                    input.value = '';
                }
            }
        });
    });

    // Functionality to save on Enter key press
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                alert('Información guardada. (Lógica de guardado pendiente)');
            }
        });
    });

    // Voice recognition functionality
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'es-ES';
        
        document.querySelectorAll('.voice-btn').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                const targetInput = document.getElementById(targetId);

                if (!targetInput) return;

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    targetInput.value += transcript;
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                };

                recognition.start();
            });
        });
    } else {
        document.querySelectorAll('.voice-btn').forEach(button => {
            button.style.display = 'none';
        });
    }

    // Logic to save the report (when the button is pressed)
    const saveReportBtn = document.getElementById('save-report-btn');
    saveReportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Reporte guardado. (Falta implementar la lógica de guardado)');
    });
});