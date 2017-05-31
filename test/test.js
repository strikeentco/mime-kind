'use strict';

const fs = require('fs');
const should = require('should/as-function');
const mime = require('../main');

const fixtures = `${__dirname}/fixture`;

function chunkSync(path) {
  const fd = fs.openSync(path, 'r');
  const buf = new Buffer(262);

  fs.readSync(fd, buf, 0, 262);
  fs.closeSync(fd);

  return buf;
}

describe('mime()', () => {
  describe('when data is a string', () => {
    it('should be equal { ext: \'jpeg\', mime: \'image/jpeg\' }', () => {
      should(mime('c:/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });

      should(mime(`${fixtures}/fixture`)).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });

    it('should be equal { ext: \'bin\', mime: \'application/octet-stream\' }', () => {
      should(mime('.anonim', 'bin')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { ext: 'bin' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { mime: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { ext: 'bin', mime: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.anonim', { type: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(mime('.opus', 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
    });

    it('should throw', () => {
      should(() => mime(fs.createReadStream('anonim.jpg'))).throw('The file must be local and exists.');
    });
  });

  describe('when data is a stream', () => {
    it('should be equal { ext: \'jpg\', mime: \'image/jpeg\' }', () => {
      should(mime(fs.createReadStream(`${fixtures}/fixture`))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(fs.createReadStream(`${fixtures}/fixture`, { fd: fs.openSync(`${fixtures}/fixture`, 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(fs.createReadStream(null, { fd: fs.openSync(`${fixtures}/fixture`, 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });
  });

  describe('when data is a buffer', () => {
    it('should be equal { ext: \'jpg\', mime: \'image/jpeg\' }', () => {
      should(mime(chunkSync(`${fixtures}/fixture`))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });

    it('should be equal { ext: \'opus\', mime: \'audio/opus\' }', () => {
      should(mime(chunkSync(`${fixtures}/fixture.opus`))).be.eql({ ext: 'opus', mime: 'audio/opus' });
    });

    it('should be equal { ext: \'mp3\', mime: \'audio/mpeg\' }', () => {
      should(mime(chunkSync(`${fixtures}/fixture.mp3`))).be.eql({ ext: 'mp3', mime: 'audio/mpeg' });
    });

    it('should be equal { ext: \'bin\', mime: \'application/octet-stream\' }', () => {
      should(mime(new Buffer('binary data'), 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
    });
  });

  describe('when defaultValue is { ext: \'fake\', mime: \'fake/fake\' }', () => {
    it('should be equal { ext: \'fake\', mime: \'fake/fake\' }', () => {
      should(mime('.anonim', { ext: 'fake', mime: 'fake/fake' })).be.eql({ ext: 'fake', mime: 'fake/fake' });
      should(mime(null, { ext: 'fake', mime: 'fake/fake' })).be.eql({ ext: 'fake', mime: 'fake/fake' });
    });
  });

  describe('when one of the arguments is wrong', () => {
    it('should be null', () => {
      const file = fs.createReadStream(`${fixtures}/fixture`);
      file.emit('end');
      should(mime(file)).be.null();
      should(mime()).be.null();
      should(mime([])).be.null();
      should(mime([], [])).be.null();
      should(mime(null, [])).be.null();
      should(mime(null, ' ')).be.null();
      should(mime('.anonim', { ext: 'fake' })).be.null();
      should(mime('.anonim', { type: 'fake/fake' })).be.null();
      should(mime('.anonim', 'fake/fake')).be.null();
    });
  });
});
