//service workers
let sw_path = null;
if ("serviceWorker" in navigator) {
  if (window.location.hostname == "localhost" || window.location.hostname.includes('ngrok-free')) {
    sw_path = "./utils/dev-service-worker.js";
  } else {
    sw_path = "./service-worker.js";
  }
}

if (sw_path) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(sw_path)
      .then((registration) => {
        console.log("Service Worker registered:", registration.scope);
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              window.showToast(
                "info",
                "تم التماس تحديث جديد، يرجى <button type='button' class='btn btn-dark' onclick='window.location.reload()'>تحديث</button> الصفحة."
              );
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
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

  installButton1.addEventListener("click", installer);
  installButton2.addEventListener("click", installer);
});

async function installer() {
  if (!installPrompt) {
    return;
  }
  await installPrompt.prompt();
  disableInAppInstallPrompt();
}

window.addEventListener("appinstalled", () => {
  disableInAppInstallPrompt();
});

function disableInAppInstallPrompt() {
  installPrompt = null;
  installButton1.setAttribute("hidden", "");
  installButton2.setAttribute("hidden", "");
}
