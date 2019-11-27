# tSecureExpress
express middleware &amp; client for RSA encrypted communication

Two modules in one, meant to work together.

A express middleware, that is able to accept RSA encrypted payloads and change the request to the properties found in the body.
Second, a secure client, that contacts to a server using the encrypted middleware.

# motivation
There are three usecases for this custom http encryption library. 
 1. I wanted to have secure encryption between client and server, without being required to register an SSH certificate.
 2. In China, and other places, the https protocol get purposefully slow down. Having the encrypted communication transfer over plain http, will stay fast.
 3. Provide a secure authentication, that not only the application provider can trust, but also the user.
    - the application provider will be able to prove, that commands are send by a particular user.
    - the user can be sure, that no action was taken in his name without his consent. (these two properties are very important or blockchain applications.) 

In fact I am on the way, to develop a communication system, that is easy for everyone to setup, participate and use. This module is one step on the way, to allow easy development of RSA encrypted client server communication. It is a perfect fit for PWA and can also be used for communications between servers and other clients.

Using the middlewares, it is also possible to add the encryption module to existing applications and have it work, without starting over.

# how it works
Under the hood, is the already provided trsa module, for easy key pair creation and cryptography. The server will generate a keyPair for himself, Clients who send encrypted content to the server using the servers public key. The server key can be provided on a public route, or get shared in any other secure way. (to avoid man in the middle attacks).

The client library, will be configured to the endpoint of the server. The clientside uses the same type of keys. They can even be generated on client side using the trsa module. The client sign the requests to the server. All that will be very easy using the client module.

# how to use it.
This library is made to work with express.js. Reading the sourcecode, a developer should also be able to adopt this logic for other frameworks, as it is only about 40 lines of code.
a simple server can look like this:
```js
// this like generate a keypair, feel free to read it from a file, 
// so it always stay the same, and can be remembered by your clients
const serverKeys = rsa.generateKeyPair({bits:512});

const app = express();
app.listen(1234);

// the encruption missleware, providing a encryted route at /encrypted
app.use(secureMiddlewares.encryptedMiddleware(serverKeys));

// a second optional middleware, to make sure all request take the same time.
// this is made, so that an attacker can not measure the time spend 
// on encryption or other logic.
app.use(secureMiddlewares.saveResponseMiddleware);

// your actual logic
app.use((req,res)=>{
    // respond with encrypted content,
    // in this case, all the extras, that the `encryptedMiddleware` provide or set
    res.respondSave({
        body: req.body
        encrypted: req.encrypted, // boolean
        method: req.method,
        query: req.query,
        senderKey: req.senderKey, // the clients public key, you can use it for authentication
        url: req.url,
    });
});
```

The clientside can look like this:
```js 
import * as httpClient from '../client/httpClient';

export async function main(){
    /**
     * create a client
     * provide the keyPair with private and public key as first argument
     */
    const client = new httpClient.RsaFetch(clientKeys,'http://localhost:1234/encrypted',serverKey);
    // simple GET request to the server
    const requestInfo = await client.fetch('/hello');
    console.log(client)
    /**
     * post some data
     * note: all options will be JSON stringified. so you don't need to stringify the body.
     */
    await client.fetch({
        method: 'POST',
        url: '/someEntity',
        headers: {'your-other':'headers'} // note: they do not get encrypted and signed
        body: {da:'ta'}
    });
}
```

This two examples should show you something great. Setting url, query, body and method, the client has total control, to send requests as before. And also your app, is able to work just as before, with almost no changes.

# import
For the serverside, you simply `require('t-secure-express');`, for clients, using webpack, you can use `require('t-secure-express/client/httpClient');`. of course, modern syntax with `import` works the same way.

The client SDK is also build 
```html
<script src="https://unpkg.com/t-secure-express@0.0.2/client/webClient.js"></script>
```


