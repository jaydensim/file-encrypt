import "@fontsource/manrope/variable.css";
import "./src/styles/base.css";

import template from "./src/templates/main.html?raw";

import { dropperHTML } from "./src/templates/useDropper";
import { humanFileSize } from "./src/scripts/utils";

import * as CryptoJS from "crypto-js";

const qs = (el) => document.querySelector(el);
const qa = (el) => document.querySelectorAll(el);
const df = (el) => document.querySelector(`[data-functional="${el}"]`);

qs("#app").innerHTML = template;

let statusTimeout = null;

const app = new Proxy(
  {
    mode: "encrypt",
    status: "",
    appStatus: 0,
    currentKey: "",
    currentvalidity: false,
    file: null,
    downloadPayload: null,
    fileName: "",
    isDropping: false,
    containerExtention: "",
  },
  {
    set(obj, prop, value) {
      obj[prop] = value;
      for (let key in obj) {
        if (key !== "file") {
          qs("#app").setAttribute(`data-${key}`, obj[key]);
        }
      }
      qa(".app-functional--navy-button-validityPending").forEach(
        (el) => (el.disabled = !obj.currentvalidity)
      );
      if (prop == "status") {
        clearTimeout(statusTimeout);
        df("status").innerHTML = obj.status;
        if (!df("status").innerHTML.includes("...")) {
          statusTimeout = setTimeout(() => {
            df("status").innerHTML = "";
          }, 1000);
        }
      }
      return true;
    },
  }
);

df("dropper").addEventListener("click", () => {
  df("input").click();
});
function convertWordArrayToUint8Array(wordArray) {
  var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
  var length = wordArray.hasOwnProperty("sigBytes")
    ? wordArray.sigBytes
    : arrayOfWords.length * 4;
  var uInt8Array = new Uint8Array(length),
    index = 0,
    word,
    i;
  for (i = 0; i < length; i++) {
    word = arrayOfWords[i];
    uInt8Array[index++] = word >> 24;
    uInt8Array[index++] = (word >> 16) & 0xff;
    uInt8Array[index++] = (word >> 8) & 0xff;
    uInt8Array[index++] = word & 0xff;
  }
  return uInt8Array;
}
let handleFiles = (file) => {
  app.file = file;
  let fileName = file.name;
  let maxLength = 30;
  let icon = "file";
  app.fileName = file.name;
  if (fileName.length > maxLength) {
    fileName =
      fileName.substr(0, maxLength / 2) +
      "..." +
      fileName.substr((maxLength / 2) * -1);
  }
  if (
    file.type == "encrypted/container-dump" ||
    file.name.split(".").pop() == "ecd"
  ) {
    app.fileName = file.name.split(".").slice(0, -1).join(".");
    app.containerExtention = "";
    app.mode = "decrypt";
    icon = "archive";
  } else {
    app.mode = "encrypt";
    app.containerExtention = ".ecd";
  }
  df("dropper").innerHTML = dropperHTML(
    app.fileName,
    `${file.type} ${humanFileSize(file.size)}`,
    icon
  );
  app.status = "FILE UPLOADED";
};
let handleDownload = () => {
  let fileURL = window.URL.createObjectURL(app.downloadPayload);
  let virtualLink = document.createElement("a");
  virtualLink.href = fileURL;
  virtualLink.download = `${app.fileName}${app.containerExtention}`;
  virtualLink.click();
  window.URL.revokeObjectURL(fileURL);
};

df("dropper").addEventListener(
  "dragenter",
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    df("dropper").innerHTML = dropperHTML("Drop your file here", "");
    app.isDropping = true;
  },
  false
);
df("dropper").addEventListener(
  "dragover",
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    df("dropper").innerHTML = dropperHTML("Drop your file here", "");
    app.isDropping = true;
  },
  false
);
df("dropper").addEventListener(
  "dragleave",
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    df("dropper").innerHTML = dropperHTML(
      "Drop files to encrypt",
      "Or click to select a file",
      "upload"
    );
    app.isDropping = false;
  },
  false
);
df("dropper").addEventListener(
  "drop",
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    const files = e.dataTransfer.files[0];
    handleFiles(files);
    app.isDropping = false;
  },
  false
);

df("input").addEventListener("input", (e) => {
  app.status = "Processing...";
  df("dropper").innerHTML = dropperHTML(
    "Processing...",
    "This shoudn't take long...",
    "upload"
  );
  setTimeout(() => {
    handleFiles(e.target.files[0]);
  }, 500);
  app.currentvalidity = df("input").validity.valid && df("key").validity.valid;
});

df("key").addEventListener("input", (e) => {
  app.currentKey = e.target.value;
  app.currentvalidity = df("input").validity.valid && df("key").validity.valid;
});

df("encrypt").addEventListener("click", () => {
  app.status = "Encrypting...";
  app.currentvalidity = false;
  app.appStatus = 2;
  let reader = new FileReader();
  reader.addEventListener("load", () => {
    let wordArray = CryptoJS.lib.WordArray.create(reader.result);
    let encrypted = CryptoJS.Rabbit.encrypt(
      wordArray,
      window.btoa(app.currentKey)
    ).toString();
    app.downloadPayload = new Blob([encrypted]);
    handleDownload();
    app.mode = "download";
    app.appStatus = 1;
    app.status = "READY TO DOWNLOAD";
    app.currentvalidity = true;
  });
  reader.readAsArrayBuffer(app.file);
});
df("decrypt").addEventListener("click", () => {
  app.status = "Decrypting...";
  app.currentvalidity = false;
  app.appStatus = 2;
  let reader = new FileReader();
  reader.addEventListener("load", () => {
    let decrypted = CryptoJS.Rabbit.decrypt(
      reader.result,
      window.btoa(app.currentKey)
    );
    let typedArray = convertWordArrayToUint8Array(decrypted);
    app.downloadPayload = new Blob([typedArray]);
    handleDownload();
    app.mode = "download";
    app.appStatus = 1;
    app.status = "READY TO DOWNLOAD";
    app.currentvalidity = true;
  });
  reader.readAsArrayBuffer(app.file);
});
df("download").addEventListener("click", handleDownload);

df("no").addEventListener("click", () => {
  app.status = "NO ACTION TAKEN";
});

df("input").value = "";
df("key").value = "";

df("dropper").innerHTML = dropperHTML(
  "Drop files to encrypt",
  "Or click to select a file",
  "upload"
);

app.appStatus = 1;
app.status = "APP READY";
