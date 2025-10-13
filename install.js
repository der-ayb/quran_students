//service workers
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      !window.location.hostname.includes("ngrok-free")
    ) {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                alert(
                  "New version available, including updated resources! Please refresh."
                );
              }
            });
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  });
}

// install button
let installPrompt = null;
const installButton1 = document.getElementById("installBtn1");
const installButton2 = document.getElementById("installBtn2");

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton1.removeAttribute("hidden");
    installButton2.removeAttribute("hidden");
  });

  installButton1.addEventListener("click", async () => {
    if (!installPrompt) {
      return;
    }
    const result = await installPrompt.prompt();
    disableInAppInstallPrompt();
  });
  installButton2.addEventListener("click", async () => {
    if (!installPrompt) {
      return;
    }
    const result = await installPrompt.prompt();
    disableInAppInstallPrompt();
  });

  function disableInAppInstallPrompt() {
    installPrompt = null;
    installButton1.setAttribute("hidden", "");
    installButton2.setAttribute("hidden", "");
  }
});

window.addEventListener("appinstalled", () => {
  disableInAppInstallPrompt();
});

function disableInAppInstallPrompt() {
  installPrompt = null;
  installButton1.setAttribute("hidden", "");
  installButton2.setAttribute("hidden", "");
}
