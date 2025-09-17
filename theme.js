document.addEventListener('DOMContentLoaded', () => {
    const toggleThemeBtn = document.getElementById('toggle-theme-btn');
    const body = document.body;

    // Carga el tema guardado en la memoria del navegador (localStorage)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        body.classList.add('dark-mode');
        toggleThemeBtn.textContent = '🌙';
    } else {
        body.classList.remove('dark-mode');
        toggleThemeBtn.textContent = '☀️';
    }

    // Escucha el clic del botón
    toggleThemeBtn.addEventListener('click', () => {
        // Alterna la clase 'dark-mode' en el body
        body.classList.toggle('dark-mode');

        // Guarda la preferencia del usuario y actualiza el botón
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark-mode');
            toggleThemeBtn.textContent = '🌙';
        } else {
            localStorage.setItem('theme', 'light-mode');
            toggleThemeBtn.textContent = '☀️';
        }
    });
});