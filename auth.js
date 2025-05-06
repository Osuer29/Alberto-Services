// auth.js

// Usuarios válidos (puedes cambiar contraseñas aquí)
const usuarios = {
    admin: {
        contraseña: 'admin123',
        rol: 'admin'
    },
    caja: {
        contraseña: 'caja123',
        rol: 'caja'
    }
};

// Validar login (llámala desde login.html)
function login() {
    const usuario = document.getElementById('usuario').value.trim();
    const contraseña = document.getElementById('contraseña').value.trim();
    const error = document.getElementById('error');

    if (usuarios[usuario] && usuarios[usuario].contraseña === contraseña) {
        localStorage.setItem('rol', usuarios[usuario].rol);
        localStorage.setItem('usuario', usuario);
        window.location.href = 'inicio.html';
    } else {
        error.textContent = 'Usuario o contraseña incorrectos.';
    }
}

// Verifica si hay sesión activa
function validarSesionActiva() {
    const rol = localStorage.getItem('rol');
    if (!rol) {
        alert("No has iniciado sesión. Redirigiendo al login...");
        window.location.href = 'login.html';
    }
}

// Controla visibilidad de los módulos del menú y botones por rol
function controlarModulosPorRol() {
    const rol = localStorage.getItem('rol');
    if (rol === 'caja') {
        // Ocultar enlaces de menú
        const ocultar = ['Inventario', 'Ventas', 'Gastos', 'Ingresos', 'Cuadre General'];
        ocultar.forEach(texto => {
            const item = [...document.querySelectorAll("nav ul li a")]
                .find(link => link.textContent.trim() === texto);
            if (item) item.parentElement.style.display = 'none';
        });

        // Ocultar botones de accesos directos
        const botones = document.querySelectorAll(".botones .btn");
        botones.forEach(btn => {
            const texto = btn.textContent.trim();
            if (!['Nueva Reparación', 'Facturar'].includes(texto)) {
                btn.style.display = 'none';
            }
        });
    }
}

// Cierra sesión y borra el almacenamiento
function cerrarSesion() {
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}
