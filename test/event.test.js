'use strict';

const mm = require('mm');
const net = require('net');
const { APIClientBase } = require('..');

describe('test/event.test.js', () => {
  let port;
  let client;
  class ClusterClient extends APIClientBase {
    get DataClient() {
      return require('./supports/client');
    }

    get clusterOptions() {
      return {
        responseTimeout: 1000,
        port,
      };
    }

    subscribe(...args) {
      return this._client.subscribe(...args);
    }

    publish(...args) {
      return this._client.publish(...args);
    }

    close() {
      return this._client.close();
    }
  }

  before(function* () {
    const server = net.createServer();
    port = yield cb => {
      server.listen(0, () => {
        const address = server.address();
        console.log('using port =>', address.port);
        server.close();
        cb(null, address.port);
      });
    };
    client = new ClusterClient();
  });
  after(function* () {
    yield client.close();
  });

  it('should ok', function* () {
    mm(process, 'emitWarning', err => {
      client.emit('error', err);
    });
    const subscribe = () => {
      let count = 10;
      while (count--) {
        client.subscribe({ key: 'foo' }, () => {});
      }
      client.subscribe({ key: 'foo' }, () => {
        client.emit('foo');
      });
    };

    yield Promise.race([
      client.await('error'),
      client.await('foo'),
      subscribe(),
    ]);
  });

});
