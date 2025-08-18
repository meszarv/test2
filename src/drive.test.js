import test from 'node:test';
import assert from 'node:assert/strict';
import { initDrive } from './drive.js';

test('initDrive initializes gapi client and token client', async () => {
  let initArgs;
  global.gapi = {
    load: (name, cb) => {
      assert.equal(name, 'client');
      cb();
    },
    client: {
      init: async (args) => {
        initArgs = args;
      },
    },
  };
  let tokenArgs;
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: (args) => {
          tokenArgs = args;
          return {};
        },
      },
    },
  };
  await initDrive({ apiKey: 'key', clientId: 'id' });
  assert.equal(initArgs.apiKey, 'key');
  assert.equal(tokenArgs.client_id, 'id');
});
