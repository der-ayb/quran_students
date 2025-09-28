//service workers
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("src/service-worker.js").then((reg) => {
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
document.addEventListener("DOMContentLoaded", () => {
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  document.getElementById("installBtn").onclick = async () => {
    deferredPrompt.prompt();
    deferredPrompt = null;
  };
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    document.getElementById("install").style.display = "none";
  });

  if (window.matchMedia("(display-mode: standalone)").matches) {
    document.getElementById("install").style.display = "none";
  }
});
