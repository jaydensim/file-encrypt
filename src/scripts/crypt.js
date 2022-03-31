import { encode, decode } from "base64-arraybuffer";
import Rabbit from "crypto-js/rabbit";
import Utf8 from "crypto-js/enc-utf8";

export class Crypt {
  key = "";
  file = null;
  constructor(key, file) {
    this.key = window.btoa(key);
    this.file = file;
  }

  encrypt() {
    return new Promise((resolve, reject) => {
      try {
        let fblob = new Blob([this.file]);
        fblob.arrayBuffer().then((buffer) => {
          let b64buffer = encode(buffer);
          let fTransport = {
            name: this.file.name,
            type: this.file.type,
            size: this.file.size,
            buffer: b64buffer,
          };
          let fString = JSON.stringify(fTransport);
          let fEncrypted = Rabbit.encrypt(fString, this.key).toString();
          console.log(fString, fEncrypted);
          var fContainer = new File([window.btoa(fEncrypted)], this.file.name, {
            type: "application/encrypted",
          });
          resolve(fContainer);
        });
      } catch (error) {
        reject();
      }
    });
  }
  decrypt() {
    return new Promise((resolve, reject) => {
      try {
        let fblob = new Blob([this.file]);
        fblob.text().then((buffer) => {
          try {
            let fContainer = window.atob(buffer);
            let fDecrypted = JSON.parse(
              Rabbit.decrypt(fContainer, this.key).toString(Utf8)
            );
            let fBuffer = decode(fDecrypted.buffer);
            var fProduced = new File([fBuffer], fDecrypted.name, {
              type: fDecrypted.type,
            });
            resolve(fProduced);
          } catch (error) {
            reject();
          }
        });
      } catch (error) {
        reject();
      }
    });
  }
}
