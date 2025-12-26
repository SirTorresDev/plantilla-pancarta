function triggerPrint() {
    window.focus();
    window.print();
}

function updatePreview() {
    const text = document.getElementById('inputText').value;
    const fontClass = document.getElementById('fontSelect').value;
    const styleMode = document.getElementById('styleSelect').value;
    const size = document.getElementById('sizeSlider').value;
    const color = document.getElementById('colorPicker').value;
    
    // Actualizar etiqueta de tamaño
    document.getElementById('sizeLabel').innerText = size + 'px';

    const container = document.getElementById('previewArea');
    container.innerHTML = ''; 

    for (let char of text) {
        if (char === ' ') {
            const spacer = document.createElement('div');
            spacer.className = "w-20 h-20 hidden md:block"; // Ocultar espaciador en móviles para ahorrar espacio visual
            container.appendChild(spacer);
            continue;
        }

        const card = document.createElement('div');
        card.className = "page-break bg-white w-[200px] h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative m-2 overflow-hidden shadow-sm";
        
        const label = document.createElement('span');
        label.className = "absolute top-2 left-2 text-[10px] text-gray-300 font-sans no-print uppercase tracking-wider";
        label.innerText = "Cortar";
        card.appendChild(label);

        const letter = document.createElement('h1');
        letter.innerText = char.toUpperCase();
        
        let letterClasses = `leading-none select-none ${fontClass} `;
        letter.className = letterClasses;
        letter.style.fontSize = size + 'px';

        if (styleMode === 'outline') {
            letter.style.color = 'transparent';
            letter.style.webkitTextStroke = '2px black'; 
        } else {
            letter.style.color = color;
            letter.style.webkitTextStroke = '0px';
        }
        
        card.appendChild(letter);
        container.appendChild(card);
    }
}

window.onload = updatePreview;
