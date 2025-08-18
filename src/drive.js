import { encryptPortfolio, decryptPortfolio, DEFAULT_PORTFOLIO } from "./file.js";

let tokenClient;
let driveApiKey;

export function initDrive({ apiKey, clientId }) {
  driveApiKey = apiKey;
  return new Promise((resolve) => {
    gapi.load("client", async () => {
      await gapi.client.init({
        apiKey,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      });
      resolve();
    });
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: () => {},
    });
  });
}

function ensureToken() {
  return new Promise((resolve) => {
    tokenClient.callback = () => resolve();
    tokenClient.requestAccessToken();
  });
}

export async function openDriveFile() {
  if (!gapi?.client?.getToken) return;
  await ensureToken();
  return new Promise((resolve) => {
    gapi.load("picker", () => {
      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.DOCS)
        .setOAuthToken(gapi.client.getToken().access_token)
        .setDeveloperKey(driveApiKey)
        .setCallback((data) => {
          if (data.action === google.picker.Action.PICKED) {
            resolve(data.docs[0].id);
          }
        })
        .build();
      picker.setVisible(true);
    });
  });
}

export async function readDrivePortfolioFile(fileId, password) {
  await ensureToken();
  const token = gapi.client.getToken().access_token;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: "Bearer " + token },
  });
  const buf = await res.arrayBuffer();
  if (buf.byteLength === 0) return DEFAULT_PORTFOLIO;
  return await decryptPortfolio(buf, password);
}

export async function writeDrivePortfolioFile(fileId, password, data) {
  await ensureToken();
  const token = gapi.client.getToken().access_token;
  const payload = await encryptPortfolio(data, password);
  const metadata = { name: "portfolio.enc" };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", new Blob([payload], { type: "application/octet-stream" }));
  const method = fileId ? "PATCH" : "POST";
  const url = fileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  const res = await fetch(url, {
    method,
    headers: { Authorization: "Bearer " + token },
    body: form,
  });
  const json = await res.json();
  return json.id;
}

