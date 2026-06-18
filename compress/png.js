const signature = [137, 80, 78, 71, 13, 10, 26, 10];

function checkPNGSignature(bytes) {

    for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !==signature[i]) {
            return false;
        }
    }

    return true;
}

function readChunks(bytes) {
    const chunks = [];
    let offset = signature.length; // skip the signature
    
    while (offset < bytes.length) {
        const length = (bytes[offset] << 24) |
                        (bytes[offset + 1] << 16) |
                        (bytes[offset + 2] << 8) |
                        (bytes[offset + 3]);
        
        const type = String.fromCharCode (
            bytes[offset + 4],
            bytes[offset + 5],
            bytes[offset + 6],
            bytes[offset + 7]

        );
        
        const dataStart = offset + 8;
        const dataEnd = dataStart + length;
        const data = bytes.slice(dataStart, dataEnd);

        chunks.push({ type, data });

        offset = dataEnd + 4;
    }

    return chunks;
}

function findChunk(chunks, type) {
    return chunks.find(chunk => chunk.type === type);
}

function readIHDR(data) {
    const width = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
    const height = (data[4] << 24) | (data[5] << 16) | (data[6] << 8) | data[7];
    const bitDepth = data[8];
    const colorType = data[9];

    return { width, height, bitDepth, colorType };
}