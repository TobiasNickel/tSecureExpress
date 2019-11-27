import * as trsa from 'trsa';
export declare const rsa: typeof trsa;
export interface IRsaFetchParams {
    keyPair?: trsa.IKeyPair;
    serverUrl?: string;
    serverKey: string;
}
export declare class RsaFetch {
    keyPair: trsa.IKeyPair;
    serverUrl: string;
    serverKey: string;
    constructor({ keyPair, serverUrl, serverKey }: IRsaFetchParams);
    fetch(request: any): Promise<any>;
}
declare function bytesFromHex(hex: string): Uint8Array;
declare function hexFromArrayBuffer(buf: ArrayBuffer): string;
declare function hexToString(hexx: string): string;
export declare const utils: {
    bytesFromHex: typeof bytesFromHex;
    hexFromArrayBuffer: typeof hexFromArrayBuffer;
    hexToString: typeof hexToString;
};
export {};
