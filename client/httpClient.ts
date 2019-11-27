import * as fetch from 'node-fetch';
import * as trsa from 'trsa';

export const rsa = trsa;

export interface IRsaFetchParams {
    keyPair?: trsa.IKeyPair;
    serverUrl?: string;
    serverKey: string;
}

export class RsaFetch{
    public keyPair: trsa.IKeyPair;
    public serverUrl: string;
    public serverKey: string;

    constructor({keyPair, serverUrl, serverKey}: IRsaFetchParams){
        this.keyPair = keyPair;
        if (serverUrl) {
            this.serverUrl = serverUrl;
        } else {
            if(typeof window == 'object'){
                this.serverUrl = window.location.origin + '/encrypted'
            } else {
                throw new Error('missing serverUrl');
            }
        }
        this.serverKey = serverKey;
    }

    async fetch(request){
        const requestData = JSON.stringify({
            senderKey: this.keyPair.publicKey,
            method: 'GET',
            ...(typeof request==='string'?{url:request}:request)
        });

        const encrypted = rsa.encrypt(requestData, this.serverKey)
        const signature = rsa.sign(requestData, this.keyPair.privateKey)

        var r = await fetch(this.serverUrl,{
            body: bytesFromHex(encrypted),
            headers: {...request.headers||{}, signature },
            method:'POST',
            mode: 'cors',
        });
        let response = undefined;
        const message = hexFromArrayBuffer(await r.arrayBuffer());
        try{
            const decryptedMessage = rsa.decrypt(message, this.keyPair.privateKey);
            try {
                response = JSON.parse(decryptedMessage);
            } catch {
                response = hexToString(message);
            }
        } catch {
            try {
                response = JSON.parse(message);
            } catch {
                response = message;
            }
        }

        if(r.ok){
            return response;
        }else{
            throw new Error(response);
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

function hexToString(hexx: string) {
    if(hexx.length%2){
        throw new Error('invalid hex');
    }
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2){
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

export const utils = {
    bytesFromHex,
    hexFromArrayBuffer,
    hexToString
}
