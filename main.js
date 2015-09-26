'use strict';

var fs = require('fs');
var fileType = require('file-type');
var mime = require('mime-types');

function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

function isStream(stream) {
  return stream && typeof stream === 'object' && typeof stream.pipe === 'function' && stream.readable !== false && typeof stream._read === 'function' && typeof stream._readableState === 'object';
}

function isExists(path) {
  try {
    fs.accessSync(require('path').normalize(path));
    return true;
  } catch (e) {
    return false;
  }
}

function chunkSync(data, length) {
  var buf = new Buffer(length);

  if (!data.fd) {
    data.path = require('path').normalize(data.path);
    if (isExists(data.path)) {
      data.fd = fs.openSync(data.path, data.flags, data.mode);
    } else {
      throw new Error('The file must be local and exists.');
    }
  }

  fs.readSync(data.fd, buf, 0, length);
  fs.closeSync(data.fd);

  return buf;
}

function streamSync(stream, length) {
  var buf;
  if (!stream.closed && !stream.destroyed && length > 0) {
    try {
      var data = {
        path: stream.path,
        flags: stream.flags,
        mode: stream.mode,
        fd: stream.fd
      };

      buf = chunkSync(data, length);

      return buf;
    } catch (e) {
      throw new Error('The file must be local and exists.');
    }
  } else {
    return false;
  }
}

module.exports = function(data, defaultValue) {
  var type;
  var ext;

  if (typeof data === 'string') {
    type = mime.lookup(data);
    if (!type && isExists(data)) {
      type = fileType(chunkSync({path: data, flags: 'r'}, 262));
    }
  } else if (Buffer.isBuffer(data)) {
    type = fileType(data);
  } else if (isStream(data)) {
    type = fileType(streamSync(data, 262));
  }

  if (type) {
    !type.mime || (type = type.mime);
    ext = mime.extension(type);
    return {ext: ext, mime: type};
  }

  if (defaultValue) {
    if (isObject(defaultValue)) {
      if (defaultValue.ext) {
        ext || (ext = defaultValue.ext);
        type || (type = mime.lookup(ext));
      }

      if (defaultValue.mime || defaultValue.type) {
        type || (type = defaultValue.mime || defaultValue.type);
        ext || (ext = mime.extension(type));
      }
    } else if (typeof defaultValue === 'string') {
      ext = mime.extension(defaultValue);
      type = mime.lookup(defaultValue);

      if (ext) {
        type || (type = mime.lookup(ext));
      }

      if (type) {
        ext || (ext = mime.extension(type));
      }
    }

    if (type && ext) {
      return {ext: ext, mime: type};
    }
  }

  return false;
};
