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

const firebaseConfig = {
  apiKey: "AIzaSyAWNAaKBsvP0jVYBwd-1OaF0l3lL8T9SWM",
  authDomain: "quran-students-ecaa8.firebaseapp.com",
  projectId: "quran-students-ecaa8",
  appId: "233292477998",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let db;
openAuthDB().then(async (res) => {
  db = res;

  const ui = new firebaseui.auth.AuthUI(auth);

  const uiConfig = {
    signInFlow: "popup", // Force popup instead of redirect
    signInOptions: [
      //firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: async function (authResult) {
        const token = await authResult.user.getIdToken();
        await putToken(db, token);
        document.getElementById(
          "status"
        ).textContent = `Welcome, ${authResult.user.email}`;
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("loginUI").style.display = "none";
        userIsAuth = true
        return false;
      },
    },
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  };

  // Only start FirebaseUI if no user is already signed in
  auth.onAuthStateChanged((user) => {
    if (user) {
      document.getElementById(
        "status"
      ).textContent = `Welcome back, ${user.email}`;
      document.getElementById("logoutBtn").style.display = "block";
      document.getElementById("loginUI").style.display = "none";
      userIsAuth = true
    } else {
      document.getElementById("logoutBtn").style.display = "none";
      document.getElementById("loginUI").style.display = "block";
      userIsAuth = false
      ui.start("#firebaseui-auth-container", uiConfig);
    }
  });

  const savedToken = await getToken(db);
  if (savedToken) {
    console.log("Token from IndexedDB:", savedToken);
    document.getElementById("status").textContent =
      "Session active from IndexedDB token.";
  }

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await auth.signOut();
    await deleteToken(db);
    document.getElementById("status").textContent = "Logged out.";
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("loginUI").style.display = "block";
    userIsAuth = false
    ui.start("#firebaseui-auth-container", uiConfig);
  });
});
