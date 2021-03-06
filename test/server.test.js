'use strict';

const mm = require('mm');
const path = require('path');
const coffee = require('coffee');
const assert = require('assert');
const ClusterServer = require('../lib/server');

describe('test/server.test.js', () => {
  afterEach(mm.restore);

  it('should create different type of server in one process', done => {
    coffee.fork(path.join(__dirname, 'supports/get_server'))
      .expect('stdout', 'success\n')
      .end(done);
  });

  it('should return null create with same name', function* () {
    const server1 = yield ClusterServer.create('same-name', 10001);
    assert(server1);
    const server2 = yield ClusterServer.create('same-name', 10001);
    assert(server2 === null);
    yield server1.close();
  });

  it('should create success if previous closed by ClusterServer.close', function* () {
    const server1 = yield ClusterServer.create('previous-closed', 10002);
    assert(server1);
    yield ClusterServer.close('previous-closed', server1);
    const server2 = yield ClusterServer.create('previous-closed', 10002);
    assert(server2);
    yield ClusterServer.close('previous-closed', server1);
  });
});
