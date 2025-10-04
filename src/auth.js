const loginStatus = document.getElementById("loginStatus");
let db;
let user;
let userIsAuth = false;

function openAuthDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("auth-db", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("auth");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putToken(db, token) {
  const tx = db.transaction("auth", "readwrite");
  const store = tx.objectStore("auth");
  store.put(token, "idToken");
  await tx.done;
}

async function deleteToken(db) {
  const tx = db.transaction("auth", "readwrite");
  const store = tx.objectStore("auth");
  store.delete("idToken");
  await tx.done;
}

async function getToken(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("auth", "readonly");
    const store = tx.objectStore("auth");
    const request = store.get("idToken");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function putAccessToken(db, token) {
  const tx = db.transaction("auth", "readwrite");
  const store = tx.objectStore("auth");
  store.put(token, "accessToken");
  await tx.done;
}

async function deleteAccessToken(db) {
  const tx = db.transaction("auth", "readwrite");
  const store = tx.objectStore("auth");
  store.delete("accessToken");
  await tx.done;
}

async function getAccessToken(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("auth", "readonly");
    const store = tx.objectStore("auth");
    const request = store.get("accessToken");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function decodeJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function codeJwt(payload) {
  const header = {
    alg: "none",
    typ: "JWT",
  };

  const headerStr = JSON.stringify(header);
  const payloadStr = JSON.stringify(payload);

  const encodedHeader = btoa(unescape(encodeURIComponent(headerStr)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const encodedPayload = btoa(unescape(encodeURIComponent(payloadStr)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${encodedHeader}.${encodedPayload}.`;
}

// async function handleCredentialResponse(response) {
//   const idToken = response.credential;
//   user = decodeJwt(idToken);
//   userIsAuth = true;

//   await openAuthDB().then(async (res) => {
//     db = res;
//     await putToken(db, idToken);
//   });

//   loginStatus.textContent = `تم تسجيل الدخول لـ${user.name}`;

//   // Request access token for Google Drive
//   const client = google.accounts.oauth2.initTokenClient({
//     client_id:
//       "233292477998-p0cdmaicj108fcp76fk5tpisb6qdmmgc.apps.googleusercontent.com",
//     scope: "https://www.googleapis.com/auth/drive.file",
//     callback: async (tokenResponse) => {
//       if (tokenResponse && tokenResponse.access_token) {
//         await putAccessToken(db, tokenResponse.access_token);
//       }
//     },
//   });
//   client.requestAccessToken();
// }

async function initAuth() {
  await openAuthDB().then(async (res) => {
    db = res;
    const idToken = await getToken(db);
    if (idToken) {
      user = decodeJwt(idToken);
      userIsAuth = true;
      const { file, creationTime } = await searchFileInDrive();
      loginStatus.innerHTML = `
        <div class="card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">${user.name}</h5>
            <h6 class="card-subtitle mb-2 text-body-secondary">${user.email}</h6>
            <p class="card-text">${file? `آخر تحديث:${creationTime}`:'لم تتم المزامنة'}</p>
            <button onclick="logout()" class="btn btn-sm btn-secondary">تسجيل الخروج</button>
          </div>
        </div>
      `
    }
  });
}

initAuth();

async function logout() {
  google.accounts.id.disableAutoSelect();
  await deleteToken(db);
  await deleteAccessToken(db);
  user = null;
  userIsAuth = false;
  loginStatus.textContent = "تم تسجيل الخروج.";
};

async function searchFileInDrive(accessToken = null) {
  if (!accessToken) accessToken = await getAccessToken(db);
  // Search for the file named 'quran_students.sqlite3'
  const query = encodeURIComponent(
    "name='quran_students.sqlite3' and trashed=false"
  );
  const listResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,createdTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listResponse.ok) {
    throw new Error(`Failed to list files: ${listResponse.statusText}`);
  }

  const listResult = await listResponse.json();
  if (!listResult.files || listResult.files.length === 0) {
    return false;
  }
  const file = listResult.files[0];
  const date = new Date(file.createdTime).toLocaleString();
  return [file,date];
}

async function _performUpload(data) {
  try {
    const accessToken = await getAccessToken(db);

    if (!accessToken) {
      window.showToast("warning", "خطأ في المصادقة، يرجى إعادة تسجيل الدخول.");
      return;
    }
    let fileId = null
    // Check if a file named 'quran_students.sqlite3' already exists.
    const [ file, creationTime ] = await searchFileInDrive(accessToken);
    if (file) {
      if (
        !confirm(
          `Database file found. Created on: ${creationTime}. upload now?`
        )
      ) {
        return null;
      }
      fileId = file.id;
    }
    

    const metadata = {
      name: "quran_students.sqlite3",
      mimeType: "application/octet-stream",
    };

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    formData.append(
      "file",
      new Blob([data], { type: "application/octet-stream" })
    );

    let uploadUrl;
    let method;

    if (fileId) {
      // File exists, so update it.
      uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      method = "PATCH";
    } else {
      // File doesn't exist, so create it.
      uploadUrl =
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      method = "POST";
    }

    const response = await fetch(uploadUrl, {
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert("إنتهت صلاحية تسجيل الدخول، يرجى إعادة ذلك .");
      }
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (fileId) {
      console.log("📤 DB updated on Google Drive:", result.id);
    } else {
      console.log("📤 DB uploaded to Google Drive:", result.id);
    }
    return result;
  } catch (err) {
    console.error("Error uploading to Google Drive:", err);
    throw err;
  }
}

async function _performDownload() {
  try {
    const accessToken = await getAccessToken(db);

    if (!accessToken) {
      window.showToast("warning", "خطأ في المصادقة، يرجى إعادة تسجيل الدخول.");
      return null;
    }

    const [ file, creationTime ] = await searchFileInDrive(accessToken);
    if (!file) {
      console.log(
        "⚠️ No 'quran_students.sqlite3' found on Google Drive for this user."
      );
      return null;
    }
    const fileId = file.id;

    if (
      !confirm(
        `Database file found. Created on: ${creationTime}. Download now?`
      )
    ) {
      return null;
    }

    // Download the file content
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!downloadResponse.ok) {
      if (downloadResponse.status === 401) {
        window.showToast(
          "warning",
          "إنتهت صلاحية تسجيل الدخول، يرجى إعادة ذلك ."
        );
      }
      throw new Error(`Download failed: ${downloadResponse.statusText}`);
    }

    console.log("📥 DB downloaded from Google Drive for", user.sub);
    return downloadResponse;
  } catch (err) {
    console.error("Error downloading from Google Drive:", err);
    throw err;
  }
}

// Reusable OAuth function
async function initializeGoogleAuth(callback) {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id:
        "233292477998-p0cdmaicj108fcp76fk5tpisb6qdmmgc.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            await putAccessToken(db, tokenResponse.access_token);
            const userInfoResponse = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              }
            );

            user = await userInfoResponse.json();
            await openAuthDB().then(async (res) => {
              db = res;
              await putToken(db, codeJwt(user));
            });
            userIsAuth = true;
            loginStatus.textContent = `تم تسجيل الدخول لـ${user.name}`;

            // Execute the provided callback with the token
            if (callback) {
              await callback(tokenResponse.access_token);
            }

            resolve(tokenResponse.access_token);
          } catch (error) {
            console.error("Auth initialization failed:", error);
            reject(error);
          }
        } else {
          reject(new Error("No access token received"));
        }
      },
    });

    client.requestAccessToken();
  });
}

// Updated upload function
async function uploadDBtoDrive(data) {
  if (userIsAuth) {
    await _performUpload(data);
    return;
  }

  await initializeGoogleAuth(async (accessToken) => {
    await _performUpload(data);
  });
}

// Updated download function
async function downloadDBfromDrive() {
  if (userIsAuth) {
    return await _performDownload();
  }

  return await initializeGoogleAuth(async (accessToken) => {
    return await _performDownload();
  });
}
