'use strict';

const fileType = require('file-type');
const { lookup, extension } = require('mime-types');
const {
  isString, isObject, isBuffer, isStream, isExists, isExistsSync,
  chunkAsync, chunkSync, streamChunk, BUFFER_LENGTH
} = require('./utils');

/**
 * @param {Object} [data]
 * @param {String} [data.ext]
 * @param {String} [data.mime]
 * @param {String} [data.type]
 * @returns {{ ext: String, mime: String }|null}
 */
function defaultData(data) {
  if (!data) {
    return null;
  }
  if (isString(data)) {
    const mime = lookup(data);
    if (mime) {
      return { ext: extension(mime), mime };
    }
    const ext = extension(data);
    if (ext) {
      return { ext, mime: lookup(ext) };
    }
  } else if (isObject(data)) {
    if (data.ext) {
      const { ext } = data;
      const mime = lookup(ext);
      if (mime) {
        return { ext, mime };
      }
    }
    if (data.mime || data.type) {
      const mime = data.mime || data.type;
      const ext = extension(mime);
      if (ext) {
        return { ext, mime };
      }
    }
  }
  return null;
}

/**
 * Synchronously determines MIME type of input
 * @param {String|Buffer|Uint8Array|ArrayBuffer|ReadableStream} input
 * @param {Object} [defaultValue]
 * @param {String} [defaultValue.ext]
 * @param {String} [defaultValue.mime]
 * @param {String} [defaultValue.type]
 * @returns {{ ext: String, mime: String }|null}
 */
function sync(input, defaultValue) {
  if (input) {
    let file;
    if (isString(input)) {
      const mime = lookup(input);
      if (mime) {
        return { ext: extension(mime), mime };
      }
      if (isExistsSync(input)) {
        const { bytesRead, buffer } = chunkSync({ path: input, flags: 'r' });
        if (bytesRead && buffer) {
          file = fileType(buffer);
        }
      }
    } else if (isBuffer(input)) {
      file = fileType(input);
    } else if (isStream(input)) {
      const { bytesRead, buffer } = chunkSync(input);
      if (bytesRead && buffer) {
        file = fileType(buffer);
      }
    }
    if (file !== undefined && file !== null) {
      return file;
    }
  }

  return defaultData(defaultValue);
}

/**
 * Asynchronously determines MIME type of input
 * @param {String|Buffer|Uint8Array|ArrayBuffer|ReadableStream} input
 * @param {Object} [defaultValue]
 * @param {String} [defaultValue.ext]
 * @param {String} [defaultValue.mime]
 * @param {String} [defaultValue.type]
 * @returns {Promise<{ ext: String, mime: String }|null>}
 * @async
 */
async function async(input, defaultValue) {
  if (input) {
    let file;
    if (isString(input)) {
      const mime = lookup(input);
      if (mime) {
        return { ext: extension(mime), mime };
      }
      if (await isExists(input)) {
        const { bytesRead, buffer } = await chunkAsync({ path: input, flags: 'r' });
        if (bytesRead && buffer) {
          file = fileType(buffer);
        }
      }
    } else if (isBuffer(input)) {
      file = fileType(input);
    } else if (isStream(input)) {
      const chunk = await streamChunk(input);
      if (chunk) {
        file = fileType(chunk);
      }
    }
    if (file !== undefined && file !== null) {
      return file;
    }
  }

  return defaultData(defaultValue);
}

module.exports = async;
module.exports.sync = sync;
module.exports.async = async;
module.exports.BUFFER_LENGTH = BUFFER_LENGTH;
