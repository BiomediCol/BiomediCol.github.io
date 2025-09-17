document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejo de borrado y Enter para los campos de texto
    const form = document.getElementById('service-report-form');

    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentField = e.target;
            const formElements = Array.from(form.elements);
            const currentIndex = formElements.indexOf(currentField);

            if (currentIndex > -1 && currentIndex + 1 < formElements.length) {
                formElements[currentIndex + 1].focus();
            }
        }
    });

    // 2. Lógica para el botón "Borrar"
    const clearButtons = document.querySelectorAll('.clear-btn');
    clearButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inputField = button.previousElementSibling;
            inputField.value = '';
            inputField.focus();
        });
    });

    // 3. Funcionalidad de dictado para los campos de texto largo
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        document.querySelectorAll('.voice-btn').forEach(button => {
            button.addEventListener('click', () => {
                const targetTextarea = button.closest('.form-section').querySelector('textarea');
                
                recognition.onresult = (event) => {
                    const speechResult = event.results[0][0].transcript;
                    targetTextarea.value += ' ' + speechResult;
                };

                recognition.onerror = (event) => {
                    console.error('Error en el reconocimiento de voz: ', event.error);
                };

                recognition.start();
            });
        });
    } else {
        document.querySelectorAll('.voice-btn').forEach(button => {
            button.style.display = 'none';
        });
        console.warn('El reconocimiento de voz no es compatible con este navegador.');
    }

    // 4. Lógica para el panel de firmas (Signature Pad)
    const setupSignaturePad = (canvasId) => {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        const startDrawing = (e) => {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        };

        const draw = (e) => {
            if (!isDrawing) return;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        };

        const stopDrawing = () => {
            isDrawing = false;
            ctx.closePath();
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Mobile touch events
        canvas.addEventListener('touchstart', (e) => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const offsetX = touch.clientX - rect.left;
            const offsetY = touch.clientY - rect.top;
            startDrawing({ offsetX, offsetY });
        }, false);
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const offsetX = touch.clientX - rect.left;
            const offsetY = touch.clientY - rect.top;
            draw({ offsetX, offsetY });
        }, false);
        canvas.addEventListener('touchend', stopDrawing, false);
    };

    setupSignaturePad('customer-signature-pad');
    setupSignaturePad('my-signature-pad');
    setupSignaturePad('approval-signature-pad');

    // 5. Lógica para guardar el reporte
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Muestra el mensaje de confirmación
        const confirmMessage = "El reporte será guardado y esta página reseteada, asegúrese que la información sea correcta antes de continuar...";
        if (confirm(confirmMessage)) {
            // El usuario hizo clic en ACEPTAR (OK), proceder con el guardado
            const zip = new JSZip();
        
            // 5.1. Recolectar datos del formulario y preparar el CSV
            const headers = ["Título", "Dato Ingresado"];
            const rows = [];
            const fields = [
                { id: 'equipo', title: 'Equipo' },
                { id: 'marca', title: 'Marca' },
                { id: 'modelo', title: 'Modelo' },
                { id: 'serie', title: 'Serie' },
                { id: 'id', title: 'ID' },
                { id: 'fecha-solicitud', title: 'Fecha y hora de solicitud' },
                { id: 'falla-reportada', title: 'Falla reportada' },
                { id: 'tipo-servicio', title: 'Tipo de servicio' },
                { id: 'quien-reporta', title: '¿Quién reporta?' },
                { id: 'cargo', title: 'Cargo' },
                { id: 'area', title: 'Area' },
                { id: 'fecha-inicio', title: 'Fecha y hora de inicio' },
                { id: 'descripcion-servicio', title: 'Descripción del servicio' },
                { id: 'estado-final', title: 'Estado final del equipo' },
                { id: 'fecha-final', title: 'Fecha y hora Final' }
            ];

            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    // Escapar comillas dobles
                    const value = `"${element.value.replace(/"/g, '""')}"`;
                    rows.push([field.title, value]);
                }
            });

            // Recolectar datos de repuestos
            const sparePartGroups = document.querySelectorAll('.spare-part-group');
            sparePartGroups.forEach((group, index) => {
                const name = group.querySelector('.spare-part-name').value;
                const status = group.querySelector('.spare-part-status').value;
                const quantity = group.querySelector('.spare-part-quantity').value;
                rows.push([`Repuesto ${index + 1}`, `Nombre: ${name}, Estado: ${status}, Cantidad: ${quantity}`]);
            });
            
            const csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
            zip.file("reporte_servicio_datos.csv", csvContent);

            // 5.2. Recolectar y agregar las firmas al ZIP
            const signatures = [
                { id: 'customer-signature-pad', filename: 'firma_cliente.png' },
                { id: 'my-signature-pad', filename: 'mi_firma.png' },
                { id: 'approval-signature-pad', filename: 'firma_aprobacion.png' }
            ];

            signatures.forEach(sig => {
                const canvas = document.getElementById(sig.id);
                const dataURL = canvas.toDataURL("image/png");
                // Eliminar el prefijo 'data:image/png;base64,'
                const base64Data = dataURL.split(',')[1];
                zip.file(sig.filename, base64Data, { base64: true });
            });

            // 5.3. Recolectar y agregar las imágenes subidas al ZIP
            const imageUploadInput = document.getElementById('image-upload');
            const imagePromises = [];

            if (imageUploadInput.files.length > 0) {
                Array.from(imageUploadInput.files).forEach((file, index) => {
                    imagePromises.push(new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            zip.file(`imagen_equipo_${index + 1}.${file.name.split('.').pop()}`, e.target.result);
                            resolve();
                        };
                        reader.readAsArrayBuffer(file);
                    }));
                });
            }
            
            // 5.4. Generar el ZIP y forzar la descarga
            Promise.all(imagePromises).then(() => {
                zip.generateAsync({ type: "blob" }).then(content => {
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(content);
                    link.setAttribute("href", url);
                    link.setAttribute("download", "reporte.zip");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    
                    // Borra el formulario para un nuevo reporte
                    form.reset();
                    
                    // Borra las firmas para evitar que se queden en el canvas
                    const signatureCanvases = document.querySelectorAll('.signature-box canvas');
                    signatureCanvases.forEach(canvas => {
                        const context = canvas.getContext('2d');
                        context.clearRect(0, 0, canvas.width, canvas.height);
                    });
                });
            });
        } else {
            // El usuario hizo clic en CANCELAR, no hacemos nada
        }
    });
});