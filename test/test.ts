import * as secureMiddlewares from '../index.js';
import * as express from 'express';
import * as rsa from 'trsa';
import * as sdk from '../client/httpClient';
import * as expect  from 'expect';

const clientKeys = rsa.generateKeyPair({bits:512});
const serverKeys = rsa.generateKeyPair({bits:512});

const app = express();
app.listen(1234);

app.use(secureMiddlewares.encryptedMiddleware(serverKeys));
app.use(secureMiddlewares.saveResponseMiddleware);

app.get('/hello', (req,res)=>{
    res.respondSave({hello:'world'});
});

async function test() {
    const client = new sdk.RsaFetch(clientKeys,'http://localhost:1234/encrypted',serverKeys.publicKey);
    const message = await client.fetch('/hello');
    expect(message.hello).toEqual('world');
}

test().then(()=>{
    console.log('done');
    process.exit();
}).catch(err=>{
    console.log(err);
    process.exit(1);
});
