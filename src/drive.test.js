import test from 'node:test';
import assert from 'node:assert/strict';
import { initDrive, openDriveFile, readDrivePortfolioFile } from './drive.js';

test('initDrive initializes gapi client and token client', async () => {
  let initArgs;
  global.window = {
    location: {
      origin: 'https://example.com',
      href: 'https://example.com/',
      hash: '',
      search: '',
      pathname: '/',
    },
    history: { replaceState: () => {} },
  };
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
  assert.equal(tokenArgs.ux_mode, 'redirect');
  assert.equal(tokenArgs.redirect_uri, 'https://example.com');
  delete global.window;
});

test('openDriveFile prompts for filename and searches drive', async () => {
  let listArgs;
  global.window = {
    location: {
      origin: 'https://example.com',
      href: 'https://example.com/',
      hash: '',
      search: '',
      pathname: '/',
    },
    history: { replaceState: () => {} },
  };
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
  let requested = false;
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: () => {
          return {
            requestAccessToken() {
              requested = true;
            },
          };
        },
      },
    },
  };
  await initDrive({ apiKey: 'key', clientId: 'id' });
  const id = await openDriveFile();
  assert.equal(id, '123');
  assert.ok(listArgs.q.includes("name='test.enc'"));
  assert.equal(localStorage.getItem('driveFilename'), 'test.enc');
  assert.equal(requested, false);
  delete global.localStorage;
  delete global.prompt;
  delete global.window;
});

test('openDriveFile returns undefined if gapi client uninitialized', async () => {
  global.gapi = {};
  const result = await openDriveFile();
  assert.equal(result, undefined);
});

test('ensureToken requests access token with redirect prompt', async () => {
  let requestOpts;
  let token = {};
  global.window = {
    location: {
      origin: 'https://example.com',
      href: 'https://example.com/',
      hash: '',
      search: '',
      pathname: '/',
    },
    history: { replaceState: () => {} },
  };
  global.gapi = {
    load: (name, cb) => cb(),
    client: {
      init: async () => {},
      getToken: () => token,
    },
  };
  let tokenClient;
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: () => {
          tokenClient = {
            callback: () => {},
            requestAccessToken: (opts) => {
              requestOpts = opts;
              token = { access_token: 'token' };
              tokenClient.callback();
            },
          };
          return tokenClient;
        },
      },
    },
  };
  global.fetch = async () => ({ arrayBuffer: async () => new ArrayBuffer(0) });
  await initDrive({ apiKey: 'key', clientId: 'id' });
  await readDrivePortfolioFile('1', 'pw');
  assert.deepEqual(requestOpts, { prompt: '' });
  delete global.fetch;
  delete global.window;
  delete global.gapi;
  delete global.google;
});

test('initDrive handles discovery failure', async () => {
  global.window = {
    location: {
      origin: 'https://example.com',
      href: 'https://example.com/',
      hash: '',
      search: '',
      pathname: '/',
    },
    history: { replaceState: () => {} },
  };
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
  delete global.window;
});

test('initDrive sets token from URL and clears params', async () => {
  let setTokenArgs;
  let replacedUrl;
  global.window = {
    location: {
      origin: 'https://example.com',
      href: 'https://example.com/?code=abc#access_token=xyz',
      hash: '#access_token=xyz',
      search: '?code=abc',
      pathname: '/',
    },
    history: {
      replaceState: (_, __, url) => {
        replacedUrl = url;
      },
    },
  };
  global.gapi = {
    load: (name, cb) => cb(),
    client: {
      init: async () => {},
      setToken: (args) => {
        setTokenArgs = args;
      },
    },
  };
  global.google = {
    accounts: {
      oauth2: {
        initTokenClient: () => ({})
      },
    },
  };
  await initDrive({ apiKey: 'key', clientId: 'id' });
  assert.deepEqual(setTokenArgs, { access_token: 'xyz' });
  assert.equal(replacedUrl, 'https://example.com/');
  delete global.window;
});
