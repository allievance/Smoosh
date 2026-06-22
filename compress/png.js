// ================================================
// PNG CONSTANTS
// ================================================
const signature = [137, 80, 78, 71, 13, 10, 26, 10];

// ================================================
// LOW-LEVEL BYTE HELPERS
// ================================================
function readUint32(bytes, offset) {
    return (
        bytes[offset] * 0x1000000 +
        (bytes[offset + 1] << 16) +
        (bytes[offset + 2] << 8) +
        bytes[offset + 3]
    );
}

// ================================================
// PNG VALIDATION
// ================================================
function checkPNGSignature(bytes) {

    for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !==signature[i]) {
            return false;
        }
    }

    return true;
}

// ================================================
// CHUNK PARSING
// ================================================
function readChunks(bytes) {
    const chunks = [];
    let offset = signature.length; // skip the signature
    
    while (offset < bytes.length) {
        const length = readUint32(bytes, offset);
        
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

// ================================================
// CHUNK UTILITIES
// ================================================
function findChunk(chunks, type) {
    return chunks.find(chunk => chunk.type === type);
}

// ================================================
// IHDR PARSING
// ================================================
function readIHDR(data) {
    const width = readUint32(data, 0);
    const height = readUint32(data, 4);
    const bitDepth = data[8];
    const colorType = data[9];

    return { width, height, bitDepth, colorType };
}

// ================================================
// IDAT DECOMPRESSION
// ================================================
function decompressIDAT(chunks) {
    const idatChunks = chunks.filter(chunk => chunk.type === "IDAT");
    
    const totalLength = idatChunks.reduce((sum, chunk) => sum + chunk.data.length, 0);
    const combined = new Uint8Array(totalLength);

    let offset = 0;
    for (const chunk of idatChunks) {
        combined.set(chunk.data, offset);
        offset += chunk.data.length;
    }

    return pako.inflate(combined)
}

// ================================================
// IDAT RECOMPRESSION
// ================================================
function recompressIDAT(rawPixels) {
    return pako.deflate(rawPixels, { level: 9 });
}

function writeChunk(type, data) {
    const length = data.length;
    const chunk = new Uint8Array(12 + length);

    chunk[0] = (length >> 24) & 0xff;
    chunk[1] = (length >> 16) & 0xff;
    chunk[2] = (length >> 8) & 0xff;
    chunk[3] = length & 0xff;

    for (let i = 0; i < 4; i++) {
        chunk[4 + i] = type.charCodeAt(i);
    }

    chunk.set(data, 8);

    // CRC placeholder - 4 bytes for now
    chunk[8 + length] = 0;
    chunk[9 + length] = 0;
    chunk[10 + length] = 0;
    chunk[11 + length] = 0;

    return chunk;
}

function assemblePNG(chunks, recompressedIDAT) {
    const ihdrChunk = findChunk(chunks, "IHDR");
    const iendChunk = findChunk(chunks, "IEND");

    const ihdrBytes = writeChunk("IHDR", ihdrChunk.data);
    const idatBytes = writeChunk("IDAT", recompressedIDAT);
    const iendBytes = writeChunk("IEND", iendChunk.data)

    const totalLength = signature.length + ihdrBytes.length + idatBytes.length + iendBytes.length;
    const output = new Uint8Array(totalLength);

    let offset = 0;
    output.set(new Uint8Array(signature), offset);
    offset += signature.length;

    output.set(ihdrBytes, offset);
    offset += ihdrBytes.length;

    output.set(idatBytes, offset);
    offset += idatBytes.length;

    output.set(iendBytes, offset);

    return output;
}

// ================================================
// IMAGE FORMAT HELPERS
// ================================================
function getBytesPerPixel(bitDepth, colorType) {

    let channels;

    switch(colorType) {

        case 0:
            channels = 1;
            break;
        
        case 2:
            channels = 3;
            break;
        
        case 3:
            channels = 1;
            break;
        
        case 4:
            channels = 2;
            break;
        
        case 6:
            channels = 4;
            break;
        
        default:
            throw new Error("Unsupported color type.");
    }

    return Math.ceil(channels * bitDepth / 8);
}

function getScanLineLength(width, bitDepth, colorType) {

    const channels = {
        0: 1,
        2: 3,
        3: 1,
        4: 2,
        6: 4
    }[colorType];

    return Math.ceil(width * channels * bitDepth / 8);
}

function readScanlines(raw, width, height, bitDepth, colorType) {

}

// ================================================
// MAIN PIPELINE
// ================================================
function compressPNG(bytes) {
    if (!checkPNGSignature(bytes)) {
        throw new Error("Not a valid PNG.");
    }

    const chunks = readChunks(bytes);

    const ihdr = readIHDR(
        findChunk(chunks, "IHDR").data
    );

    const raw = decompressIDAT(chunks);
    const recompressed = recompressIDAT(raw);
    const output = assemblePNG(chunks, recompressed);

    return output;
}