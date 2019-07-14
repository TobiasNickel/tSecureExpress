import * as fetch from 'node-fetch';
import * as trsa from 'trsa';

export const rsa = trsa;

export class RsaFetch{
    public keyPair: trsa.IKeyPair;
    public serverUrl: string;
    public serverKey: string;

    constructor(keyPair: trsa.IKeyPair, serverUrl: string, serverKey: string){
        this.keyPair = keyPair;
        this.serverUrl = serverUrl;
        this.serverKey = serverKey
    }

    async fetch(request){
        const requestData = JSON.stringify({
            senderKey: this.keyPair.publicKey,
            method: 'GET',
            mode: 'cors',
            ...(typeof request==='string'?{url:request}:request)
        });

        const encrypted = rsa.encrypt(requestData, this.serverKey)
        const signature = rsa.sign(requestData, this.keyPair.privateKey)

        var r = await fetch(this.serverUrl,{
            method:'POST',
            headers: {...request.headers||{}, signature },
            body: bytesFromHex(encrypted)
        });
        let respone = undefined;
        if(r.headers.has('Encrypted')){
            const message = hexFromArrayBuffer(await r.arrayBuffer());
            const decryptedMessage = rsa.decrypt(message, this.keyPair.privateKey);

            try {
                respone = JSON.parse(decryptedMessage);
            } catch {
                respone = decryptedMessage;
            }
        } else{
            const message = await r.text();

            try {
                respone = JSON.parse(message);
            } catch {
                respone = message;
            }
        }

        if(r.ok){
            return respone;
        }else{
            throw new Error(respone);
        }
    }
}
function bytesFromHex(hex: string){
    return new Uint8Array(
        hex
            .match(/.{2}/g)
            .map(e => parseInt(e, 16))
    )
}

function pad(n, width, z = '0') {
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function hexFromArrayBuffer(buf: ArrayBuffer) {
    return uIntArrayToArray(new Uint8Array(buf))
        .map(v => pad(v.toString(16), 2))
        .join('');
}
function uIntArrayToArray(arr: Uint8Array):Array<number>{
    const out = [];
    arr.forEach(v=>out.push(v));
    return out;
}

export const utils = {
    bytesFromHex,
    hexFromArrayBuffer
}