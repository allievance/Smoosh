const fileInput = document.getElementById("fileInput");
const compressBtn = document.getElementById("compressBtn");
const status = document.getElementById("status");

compressBtn.addEventListener("click", () => {
    const file = fileInput.files[0];

    if (!file) {
        status.textContent = "Please select an image first.";
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        const imageData = e.target.result;
        status.textContent = `Read ${imageData.byteLength} bytes from ${file.name} (${file.type}, ${file.size} bytes)`;
        
        if (file.type === "image/png") {
            const compressed = compressPNG(imageData);
            status.textContent = `Compressed: ${imageData.byteLength} bytes → ${compressed.byteLength} bytes`;
        } else if (file.type === "image/jpeg") {
            // compress as JPEG
        } else if (file.type === "image/gif") {
            // compress as GIF
        } else {
            status.textContent = "Unsupported format.";
        }
    };

    reader.readAsArrayBuffer(file);

});