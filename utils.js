'use strict';

const { promisify } = require('util');
const {
  accessSync, openSync, readSync, closeSync,
  access, open, read, close
} = require('fs');
const { normalize } = require('path');

const BUFFER_LENGTH = 262;

const accessAsync = promisify(access);
const openAsync = promisify(open);
const readAsync = promisify(read);
const closeAsync = promisify(close);

/**
 * Returns true if value is a String
 * @param {*} val
 * @returns {Boolean}
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Returns true if value is an Object
 * @param {*} val
 * @returns {Boolean}
 */
function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

/**
 * Returns true if value is a Buffer, UInt8Array or ArrayBuffer
 * @param {*} val
 * @returns {Boolean}
 */
function isBuffer(val) {
  return Buffer.isBuffer(val) || val instanceof Uint8Array || val instanceof ArrayBuffer;
}

/**
 * Returns true if value is a Readable Stream
 * @param {*} val
 * @returns {Boolean}
 */
function isStream(val) {
  return typeof val === 'object' && typeof val.pipe === 'function'
    && val.readable !== false && typeof val._read === 'function' && !val.closed && !val.destroyed;
}

/**
 * Tests whether or not the given path exists
 * @param {String} path
 * @returns {Boolean}
 */
function isExistsSync(path) {
  try {
    accessSync(normalize(path));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tests whether or not the given path exists
 * @param {String} path
 * @returns {Promise<Boolean>}
 * @async
 */
async function isExists(path) {
  try {
    await accessAsync(normalize(path));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Read a chunk from a file
 * @param {Object} data
 * @param {String} [data.path]
 * @param {String} [data.flags]
 * @param {String} [data.mode]
 * @returns {{bytesRead: Number, buffer: Buffer}}
 */
function chunkSync(data) {
  if (!data.fd && data.path) {
    data.path = normalize(data.path);
    if (isExistsSync(data.path)) {
      data.fd = openSync(data.path, data.flags, data.mode);
    }
  }
  if (data.fd) {
    try {
      const buffer = Buffer.alloc(BUFFER_LENGTH);
      const bytesRead = readSync(data.fd, buffer, 0, BUFFER_LENGTH);
      return { bytesRead, buffer };
    } finally {
      closeSync(data.fd);
    }
  }
  throw new Error('The file must be local and exists.');
}

/**
 * Read a chunk from a file
 * @param {Object} data
 * @param {String} data.path
 * @param {String} data.flags
 * @param {String} [data.mode]
 * @returns {Promise<{bytesRead: Number, buffer: Buffer}>}
 * @async
 */
async function chunkAsync(data) {
  const fd = await openAsync(normalize(data.path), data.flags, data.mode);
  try {
    return await readAsync(fd, Buffer.alloc(BUFFER_LENGTH), 0, BUFFER_LENGTH, 0);
  } finally {
    await closeAsync(fd);
  }
}

/**
 * Read a chunk from a stream
 * @param {ReadableStream} stream
 * @returns {Promise<Buffer>}
 * @async
 */
async function streamChunk(stream) {
  return new Promise((resolve, reject) => {
    stream.once('error', reject);
    stream.once('readable', () => {
      const chunk = stream.read(BUFFER_LENGTH) || stream.read();
      if (chunk) {
        stream.unshift(chunk);
      }
      return resolve(chunk);
    });
  });
}

module.exports = {
  isString,
  isObject,
  isBuffer,
  isStream,
  isExists,
  isExistsSync,
  chunkAsync,
  chunkSync,
  streamChunk,

  BUFFER_LENGTH
};
