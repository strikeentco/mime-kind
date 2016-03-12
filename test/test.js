'use strict';

var fs = require('fs');
var should = require('should/as-function');
var mime = require('../main');
var path = __dirname + '/fixture';

function chunkSync(data, length) {
  var buf = new Buffer(length);
  var fd = fs.openSync(data.path, data.flags);

  fs.readSync(fd, buf, 0, length);
  fs.closeSync(fd);

  return buf;
}

describe('mime()', function () {
  describe('when argument is a string', function () {
    it('should be equal {ext: \'jpeg\', mime: \'image/jpeg\'}', function () {
      should(mime('c:/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });

      should(mime(path + '/fixture')).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });

    it('should be equal {ext: \'bin\', mime: \'application/octet-stream\'}', function () {
      should(mime('.anonim', 'bin')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { ext: 'bin' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { mime: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { ext: 'bin', mime: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { type: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.opus', 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
    });

    it('should throw', function () {
      should(function () {return mime(fs.createReadStream('anonim.jpg'));}).throw('The file must be local and exists.');
    });
  });

  describe('when argument is a stream', function () {
    it('should be equal {ext: \'jpg\', mime: \'image/jpeg\'}', function () {
      should(mime(fs.createReadStream(path + '/fixture'))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(fs.createReadStream(path + '/fixture', { fd: fs.openSync(path + '/fixture', 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(fs.createReadStream(null, { fd: fs.openSync(path + '/fixture', 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });
  });

  describe('when argument is a buffer', function () {
    it('should be equal {ext: \'jpg\', mime: \'image/jpeg\'}', function () {
      should(mime(chunkSync({ path: path + '/fixture', flags: 'r' }, 262))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });

    it('should be equal {ext: \'opus\', mime: \'audio/opus\'}', function () {
      should(mime(chunkSync({ path: path + '/fixture.opus', flags: 'r' }, 262))).be.eql({ ext: 'opus', mime: 'audio/opus' });
    });

    it('should be equal {ext: \'mp3\', mime: \'audio/mpeg\'}', function () {
      should(mime(chunkSync({ path: path + '/fixture.mp3', flags: 'r' }, 262))).be.eql({ ext: 'mp3', mime: 'audio/mpeg' });
    });
  });

  describe('when no argument is passed', function () {
    it('should be false', function () {
      var file = fs.createReadStream(path + '/fixture');
      file.emit('end');
      should(mime(file)).be.false;
      should(mime()).be.false;
      should(mime(null, [])).be.false;
      should(mime(null, ' ')).be.false;
    });
  });
});
