const error = new Error('Network disabled by Gauntlet');

function block() {
  throw error;
}

if (typeof globalThis.fetch === 'function') {
  globalThis.fetch = block;
}

try {
  const http = require('node:http');
  const https = require('node:https');
  const net = require('node:net');
  const dns = require('node:dns');

  http.request = block;
  http.get = block;
  https.request = block;
  https.get = block;
  net.connect = block;
  net.createConnection = block;
  dns.lookup = function (...args) {
    const cb = args[args.length - 1];
    if (typeof cb === 'function') {
      process.nextTick(() => cb(error));
      return;
    }
    throw error;
  };
} catch {
  // Ignore patch errors.
}
