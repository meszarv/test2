import test from 'node:test';
import assert from 'node:assert/strict';
import { initDrive, openDriveFile } from './drive.js';

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

test('openDriveFile prompts for filename and searches drive', async () => {
  let listArgs;
  global.localStorage = {
    store: {},
    getItem(key) {
      return this.store[key];
    },
    setItem(key, val) {
      this.store[key] = val;
    },
  };
  global.prompt = (msg, def) => {
    assert.equal(def, 'portfolio.enc');
    return 'test.enc';
  };
  global.gapi = {
    load: (name, cb) => cb(),
    client: {
      init: async () => {},
      getToken: () => ({ access_token: 'token' }),
      drive: {
        files: {
          list: async (args) => {
            listArgs = args;
            return { result: { files: [{ id: '123' }] } };
          },
        },
      },
    },
  };
  let tokenClientObj;
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: ({ callback }) => {
          tokenClientObj = {
            callback,
            requestAccessToken() {
              this.callback();
            },
          };
          return tokenClientObj;
        },
      },
    },
  };
  await initDrive({ apiKey: 'key', clientId: 'id' });
  const id = await openDriveFile();
  assert.equal(id, '123');
  assert.ok(listArgs.q.includes("name='test.enc'"));
  assert.equal(localStorage.getItem('driveFilename'), 'test.enc');
  delete global.localStorage;
  delete global.prompt;
});

test('openDriveFile returns undefined if gapi client uninitialized', async () => {
  global.gapi = {};
  const result = await openDriveFile();
  assert.equal(result, undefined);
});

test('initDrive handles discovery failure', async () => {
  global.gapi = {
    load: (name, cb) => cb(),
    client: {
      init: async () => {
        throw new Error('fail');
      },
    },
  };
  let tokenInitCalled = false;
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: () => {
          tokenInitCalled = true;
          return {};
        },
      },
    },
  };
  let errorMessage;
  const originalError = console.error;
  console.error = (msg) => {
    errorMessage = msg;
  };
  await initDrive({ apiKey: 'key', clientId: 'id' });
  const result = await openDriveFile();
  assert.equal(result, undefined);
  assert.equal(tokenInitCalled, false);
  assert.ok(String(errorMessage).includes('Failed to initialize Google Drive'));
  console.error = originalError;
});
