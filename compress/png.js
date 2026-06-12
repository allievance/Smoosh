function compressPNG(arrayBuffer) {
    const image = UPNG.decode(arrayBuffer);
    const compressed = UPNG.encode(
        image.data,
        image.width,
        image.height,
        0
    );
    return compressed;
}