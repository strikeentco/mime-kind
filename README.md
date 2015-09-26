mime-kind
==========
[![Build Status](https://travis-ci.org/strikeentco/mime-kind.svg)](https://travis-ci.org/strikeentco/mime-kind) [![License](https://img.shields.io/github/license/strikeentco/mime-kind.svg?style=flat)](https://github.com/strikeentco/mime-kind/blob/master/LICENSE)  [![npm](https://img.shields.io/npm/v/mime-kind.svg?style=flat)](https://www.npmjs.com/package/mime-kind) [![Test Coverage](https://codeclimate.com/github/strikeentco/mime-kind/badges/coverage.svg)](https://codeclimate.com/github/strikeentco/mime-kind/coverage) [![bitHound Score](https://www.bithound.io/github/strikeentco/mime-kind/badges/score.svg)](https://www.bithound.io/github/strikeentco/mime-kind)

Detect the mime type of a Buffer, ReadStream, file path and file name.

## Install
```sh
npm install mime-kind
```

## Usage

```js
var fs = require('fs');
var mime = require('mime-kind');

mime('.somefakeext'); // false
mime(fs.createReadStream('./anonim.jpg')); // {ext: 'jpeg', mime: 'image/jpeg'}
```

## API

### mime(data, [defaultValue])

Returns an object (or `false` when no match) with:

* `ext` - file type
* `mime` - the [MIME type](http://en.wikipedia.org/wiki/Internet_media_type)

### Params:

* **data** (*Buffer|ReadStream|String*) - `Buffer`, `ReadStream`, file path or file name.
* **[defaultValue]** (*String|Object*) - `String` or `Object` with value which will be returned if no match will be found. If `defaultValue` is incorrect returns `false`.

```js
var mime = require('mime-kind');

mime('c:/anonim.jpeg'); // {ext: 'jpeg', mime: 'image/jpeg'}

mime('.somefakeext', 'application/octet-stream'); // {ext: 'bin', mime: 'application/octet-stream'}
mime('.somefakeext', {ext: 'mp4', mime: 'video/mp4'}); // {ext: 'mp4', mime: 'video/mp4'}
mime('.somefakeext', 'ogg'); // {ext: 'ogg', mime: 'audio/ogg'}
//but
mime('.somefakeext', 'ogg3'); // false
```

```js
var fs = require('fs');
var mime = require('mime-kind');

function chunkSync(data, length) {
  var buf = new Buffer(length);
  var fd = fs.openSync(data.path, data.flags);

  fs.readSync(fd, buf, 0, length);
  fs.closeSync(fd);

  return buf;
}

mime(chunkSync({path: './anonim.jpeg', flags: 'r'}, 262); // {ext: 'jpeg', mime: 'image/jpeg'}
```

## License

The MIT License (MIT)<br/>
Copyright (c) 2015 Alexey Bystrov
