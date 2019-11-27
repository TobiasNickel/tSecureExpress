/// <reference types="node" />

import * as express from 'express';
import * as node from 'events';
import * as rsa from 'trsa';

/**
 * return an express missleware, that listen for requests to /encrypted.
 * note: use it directly via `app.use(encryptedMiddleware);`
 *    without any extra path
 *    and not within a nested router
 * because in order to overwrite all properties on the request object and 
 * have the routing for the rest of the app applied accordingly, this 
 * middleware has to be registered to an express applications root.
 *    
 * @param serverKeys the servers rsa keypair. an object with publicKey and privateKey.
 *    You can load it however you want, from a file, JSON or reach key separate file, or any other data source
 */
export declare function encryptedMiddleware(serverKeys: rsa.IKeyPair)
  : (req:express.Request, res: express.Response, next: express.NextFunction) => void;

/**
 * middleware to allow returning data encrypted. Means only when this middleware is used,
 * you can use the response.respondSave() function
 */
export const saveResponseMiddleware: express.RequestHandler;

declare global {
  namespace Express {
    interface Response {
      /**
       * send the body back to the client.
       * it also will delay the response, to a consistent response-time.
       * This will avoid, that an attacker can analyse response times and gain any information.
       * @param body the data for the client send encrypted over the network
       */
      respondSave(body: any): Response;
    }
  }
}

