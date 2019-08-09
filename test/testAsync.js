'use strict';

const fs = require('fs');
const { get } = require('https');
const { Readable, PassThrough } = require('stream');
const should = require('should/as-function');
const { async: mime, BUFFER_LENGTH } = require('../');

const fixtures = `${__dirname}/fixture`;

function chunkSync(path) {
  const fd = fs.openSync(path, 'r');
  const buf = Buffer.alloc(BUFFER_LENGTH);

  fs.readSync(fd, buf, 0, BUFFER_LENGTH);
  fs.closeSync(fd);

  return buf;
}

describe('mime.async()', () => {
  describe('when data is a string', () => {
    it('should be equal { ext: \'jpeg\', mime: \'image/jpeg\' }', async () => {
      should(await mime('c:/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(await mime('/anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(await mime('anonim.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(await mime('.jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(await mime('jpg')).be.eql({ ext: 'jpeg', mime: 'image/jpeg' });
      should(await mime(`${fixtures}/fixture`)).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(await mime(`${fixtures}/empty`, { ext: 'jpg', mime: 'image/jpeg' })).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });

    it('should be equal { ext: \'bin\', mime: \'application/octet-stream\' }', async () => {
      should(await mime('.anonim', 'bin')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(await mime('.anonim', 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(await mime('.anonim', { ext: 'bin' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(await mime('.anonim', { mime: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(await mime('.anonim', { ext: 'bin', mime: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(await mime('.anonim', { type: 'application/octet-stream' })).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
      should(await mime('.opus', 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
    });

    it('should throw', () => mime(new Readable()).catch(e => should(e.message).be.eql('The _read() method is not implemented')));
  });

  describe('when data is a stream', () => {
    it('should be equal { ext: \'jpg\', mime: \'image/jpeg\' }', async () => {
      should(await mime(fs.createReadStream(`${fixtures}/fixture`))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(await mime(fs.createReadStream(`${fixtures}/fixture`, { fd: fs.openSync(`${fixtures}/fixture`, 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(await mime(fs.createReadStream(null, { fd: fs.openSync(`${fixtures}/fixture`, 'r') }))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(await mime(fs.createReadStream(`${fixtures}/empty`), { ext: 'jpg', mime: 'image/jpeg' })).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });

    it('should be equal { ext: \'jpg\', mime: \'image/jpeg\' }', async () => {
      const pass = new PassThrough();
      get('https://avatars0.githubusercontent.com/u/2401029', res => res.pipe(pass));
      should(await mime(pass)).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
      should(await mime(pass)).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });
  });

  describe('when data is a buffer', () => {
    it('should be equal { ext: \'jpg\', mime: \'image/jpeg\' }', async () => {
      should(await mime(chunkSync(`${fixtures}/fixture`))).be.eql({ ext: 'jpg', mime: 'image/jpeg' });
    });

    it('should be equal { ext: \'opus\', mime: \'audio/opus\' }', async () => {
      should(await mime(chunkSync(`${fixtures}/fixture.opus`))).be.eql({ ext: 'opus', mime: 'audio/opus' });
    });

    it('should be equal { ext: \'mp3\', mime: \'audio/mpeg\' }', async () => {
      should(await mime(chunkSync(`${fixtures}/fixture.mp3`))).be.eql({ ext: 'mp3', mime: 'audio/mpeg' });
    });

    it('should be equal { ext: \'bin\', mime: \'application/octet-stream\' }', async () => {
      should(await mime(Buffer.from('binary data'), 'application/octet-stream')).be.eql({ ext: 'bin', mime: 'application/octet-stream' });
    });
  });

  describe('when defaultValue is { ext: \'fake\', mime: \'fake/fake\' }', () => {
    it('should be equal null', async () => {
      should(await mime('.anonim', { ext: 'fake', mime: 'fake/fake' })).be.eql(null);
      should(await mime(null, { ext: 'fake', mime: 'fake/fake' })).be.eql(null);
    });
  });

  describe('when one of the arguments is wrong', () => {
    it('should be null', async () => {
      const file = fs.createReadStream(`${fixtures}/fixture`);
      file.emit('end');
      should(await mime(file)).be.null();
      should(await mime()).be.null();
      should(await mime([])).be.null();
      should(await mime([], [])).be.null();
      should(await mime(null, [])).be.null();
      should(await mime(null, ' ')).be.null();
      should(await mime('.anonim', { ext: 'fake' })).be.null();
      should(await mime('.anonim', { type: 'fake/fake' })).be.null();
      should(await mime('.anonim', 'fake/fake')).be.null();
    });
  });
});
