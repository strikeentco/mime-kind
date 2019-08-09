'use strict';

const fs = require('fs');
const { Readable } = require('stream');
const should = require('should/as-function');
const { sync: mime, BUFFER_LENGTH } = require('../');

const fixtures = `${__dirname}/fixture`;

function chunkSync(path) {
  const fd = fs.openSync(path, 'r');
  const buf = Buffer.alloc(BUFFER_LENGTH);

  fs.readSync(fd, buf, 0, BUFFER_LENGTH);
  fs.closeSync(fd);

  return buf;
}

describe('mime.sync()', () => {
  describe('when data is a string', () => {
    it('should be equal { ext: \'jpeg\', mime: \'image/jpeg\' }', () => {
      should(mime('c:/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime('jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(mime(`${fixtures}/fixture`)).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(`${fixtures}/empty`, { ext: 'jpg', mime: 'image/jpeg' })).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
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
      should(() => mime(new Readable())).throw('The file must be local and exists.');
      const stream = new Readable();
      stream.path = 'fake.path';
      should(() => mime(stream)).throw('The file must be local and exists.');
    });
  });

  describe('when data is a stream', () => {
    it('should be equal { ext: \'jpg\', mime: \'image/jpeg\' }', () => {
      should(mime(fs.createReadStream(`${fixtures}/fixture`))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(fs.createReadStream(`${fixtures}/fixture`, { fd: fs.openSync(`${fixtures}/fixture`, 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(fs.createReadStream(null, { fd: fs.openSync(`${fixtures}/fixture`, 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(mime(fs.createReadStream(`${fixtures}/empty`), { ext: 'jpg', mime: 'image/jpeg' })).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
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
      should(mime(Buffer.from('binary data'), 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
    });
  });

  describe('when defaultValue is { ext: \'fake\', mime: \'fake/fake\' }', () => {
    it('should be equal null', () => {
      should(mime('.anonim', { ext: 'fake', mime: 'fake/fake' })).be.eql(null);
      should(mime(null, { ext: 'fake', mime: 'fake/fake' })).be.eql(null);
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
