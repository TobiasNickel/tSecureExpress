import * as trsa from 'trsa';
export declare const rsa: typeof trsa;
export declare class RsaFetch {
    keyPair: trsa.IKeyPair;
    serverUrl: string;
    serverKey: string;
    constructor(keyPair: trsa.IKeyPair, serverUrl: string, serverKey: string);
    fetch(request: any): Promise<any>;
}
declare function bytesFromHex(hex: string): Uint8Array;
declare function hexFromArrayBuffer(buf: ArrayBuffer): string;
export declare const utils: {
    bytesFromHex: typeof bytesFromHex;
    hexFromArrayBuffer: typeof hexFromArrayBuffer;
};
export {};
