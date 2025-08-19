import { encryptPortfolio, decryptPortfolio, DEFAULT_PORTFOLIO } from "./file.js";

let tokenClient;
let driveApiKey;
let driveReady = false;
const DRIVE_FILENAME_KEY = "driveFilename";

export function initDrive({ apiKey, clientId }) {
  driveApiKey = apiKey;
  return new Promise((resolve) => {
    gapi.load("client", async () => {
      try {
        await gapi.client.init({
          apiKey,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        });
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/drive.file",
          callback: () => {},
        });
        driveReady = true;
      } catch (err) {
        console.error("Failed to initialize Google Drive", err);
        tokenClient = undefined;
        driveReady = false;
      }
      resolve();
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
  if (!driveReady || !gapi?.client?.getToken || !tokenClient) return;
  try {
    await ensureToken();
  } catch (err) {
    throw new Error("Failed to authorize with Google Drive");
  }
  const defaultName = localStorage.getItem(DRIVE_FILENAME_KEY) || "portfolio.enc";
  const name = prompt("Enter Google Drive filename", defaultName);
  if (!name) return;
  localStorage.setItem(DRIVE_FILENAME_KEY, name);
  try {
    const res = await gapi.client.drive.files.list({
      q: `name='${name.replace(/['\\]/g, "\\$&")}' and trashed=false`,
      pageSize: 1,
      fields: "files(id)",
    });
    const file = res?.result?.files?.[0];
    return file?.id;
  } catch (err) {
    throw new Error("Failed to search Google Drive for file");
  }
}

export async function readDrivePortfolioFile(fileId, password) {
  if (!driveReady || !tokenClient) return;
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
  if (!driveReady || !tokenClient) return;
  await ensureToken();
  const token = gapi.client.getToken().access_token;
  const payload = await encryptPortfolio(data, password);
  const metadata = { name: localStorage.getItem(DRIVE_FILENAME_KEY) || "portfolio.enc" };
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

