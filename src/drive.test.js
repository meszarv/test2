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

test('openDriveFile uses stored API key', async () => {
  let developerKey;
  let pickerCallback;
  global.gapi = {
    load: (name, cb) => cb(),
    client: {
      init: async () => {},
      getToken: () => ({ access_token: 'token' }),
    },
  };
  let tokenClientObj;
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: ({ callback }) => {
          tokenClientObj = {
            callback,
            requestAccessToken: function () {
              this.callback();
            },
          };
          return tokenClientObj;
        },
      },
    },
    picker: {
      ViewId: { DOCS: 'docs' },
      Action: { PICKED: 'picked' },
      PickerBuilder: function () {
        return {
          addView() {
            return this;
          },
          setOAuthToken() {
            return this;
          },
          setDeveloperKey(key) {
            developerKey = key;
            return this;
          },
          setCallback(cb) {
            pickerCallback = cb;
            return this;
          },
          build() {
            return { setVisible: () => {} };
          },
        };
      },
    },
  };
  await initDrive({ apiKey: 'key', clientId: 'id' });
  const promise = openDriveFile();
  await Promise.resolve();
  pickerCallback({ action: google.picker.Action.PICKED, docs: [{ id: '123' }] });
  const id = await promise;
  assert.equal(developerKey, 'key');
  assert.equal(id, '123');
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
