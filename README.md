# Smoosh

A Chrome extension for lossless image compression. Compress your images without changing their format — PNGs stay PNGs, JPEGs stay JPEGs.

## Features

- Lossless compression — no quality loss
- Format-preserving — no file type conversion
- Supports PNG, JPEG, and GIF
- Runs entirely in the browser — no uploads to external servers

## Installation

1. Clone this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `smoosh` folder

## Usage

1. Click the Smoosh icon in the Chrome toolbar
2. Select an image file
3. Click **Compress**
4. The compressed file will be downloaded automatically

## Libraries

- [UPNG.js](https://github.com/photopea/UPNG.js) — PNG compression
- [pako](https://github.com/nodeca/pako) — DEFLATE compression (UPNG.js dependency)

## Status

Work in progress. PNG support is being implemented first.

## License

MIT
