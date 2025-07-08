/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-require-imports */
// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

// Polyfill for fetch
const { Blob, File } = require('buffer');
const { fetch, Headers, Request, Response } = require('undici');

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Blob: { value: Blob },
  File: { value: File },
  Headers: { value: Headers },
  Request: { value: Request },
  Response: { value: Response },
});

// Polyfill for URL
const { URL, URLSearchParams } = require('url');
Object.defineProperties(globalThis, {
  URL: { value: URL },
  URLSearchParams: { value: URLSearchParams },
});

// Mock crypto for tests
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: arr => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
  },
});

// Mock canvas for tests
const mockCanvas = {
  getContext: () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Array(4) }),
    putImageData: () => {},
    createImageData: () => ({ data: new Array(4) }),
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  }),
  toDataURL: () => '',
  toBlob: () => {},
};

Object.defineProperty(global.HTMLCanvasElement.prototype, 'getContext', {
  value: () => mockCanvas.getContext(),
});

Object.defineProperty(global.HTMLCanvasElement.prototype, 'toDataURL', {
  value: () => mockCanvas.toDataURL(),
});

// Mock Image constructor
global.Image = class {
  constructor() {
    setTimeout(() => {
      void (this.onload && this.onload());
    }, 0);
  }
};
