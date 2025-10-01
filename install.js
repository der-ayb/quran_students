//service workers
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then((reg) => {
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        newWorker.onstatechange = () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            window.location.reload();
          }
        };
      };
    });
  });
}


// install button
let deferredPrompt;
const installBtn = document.getElementById("installBtn")
document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  installBtn.onclick = async () => {
    deferredPrompt.prompt();
    deferredPrompt = null;
  };
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installBtn.style.display = "none";
  });

  if (window.matchMedia("(display-mode: standalone)").matches) {
    installBtn.style.display = "none";
  }
});
