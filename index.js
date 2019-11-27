const rsa = require('trsa');
const { superstruct } = require('superstruct');

const struct = superstruct({
  types: {
    httpMethod: v => 'GET,POST,PUT,DELETE'.split(',').includes(v),
  },
});

const requestSchema = struct({
  method: 'httpMethod?',
  body: 'object?',
  query: 'object?',
  senderKey: 'string?',
  url: 'string?',
});

/**
 * @param {rsa.IKeyPair} keys
 */
module.exports.encryptedMiddleware = (keys)=>(req, res, next) => {
  res.respondSave = (data) => {
    if (req.senderKey) {
      res.append('Encrypted', 'true');
      res.send(Buffer.from(rsa.encrypt(JSON.stringify(data), req.senderKey), 'hex'));
    } else {
      res.json(data);
    }
  }
  if (req.url !== '/encrypted') return next();

  var rawData = '';
  req.setEncoding('hex');
  req.on('data', function (chunk) {
    rawData += chunk;
  });

  req.on('end', function () {
    try {
      req.body = rawData;

      const dataString = rsa.decrypt(req.body, keys.privateKey);
      const data = JSON.parse(dataString);
      requestSchema(data);
      const signature = req.headers.signature;

      if (signature && data.senderKey) {
        const valid = rsa.verify(dataString, signature, data.senderKey)
        if (!valid) {
          throw Object.assign(new Error('invalid signature'), { status: 401 });
        }
        req.isSignatureValid = true;
      }

      requestSchema(data);
      req.url = data.url || req.url;
      req.method = data.method || req.method;
      req.body = data.body;
      req.query = data.query || {};
      req.encrypted = true;
      req.senderKey = data.senderKey;
      //console.log(req)
      next();
    } catch (err) {
      next(err);
    }
  });

}

/**
 * middleware that guaranties a constant response time.
 * the response time will be slower, but always the same.
 * 
 * this is needed, when a hacker try to measure time for key validation.
 */
module.exports.saveResponseMiddleware = (req,res,next) => {
  // redefine the respondSave method from encryptedMiddleware.
  res.respondSave = (data) => {
    if(timeout){
      if (req.senderKey) {
        res.responseData = Buffer.from(rsa.encrypt(JSON.stringify(data), req.senderKey), 'hex');
      } else {
        res.responseData = data;
      }
    } else {
      // when the timeout already ended, we will respond.
      sendResponse();
    }
  }

  /**
   * the timeout that make sure, the time is from this timeout, 
   * not from the time that is spend on the cryptographic operations.
   */
  res.responseData = undefined;
  var timeout = setTimeout(()=>{
    timeout = false;
    if (!res.responseData) {
      return;
    }
    sendResponse()
  }, 0);

  /**
   * the actual send.
   */
  function sendResponse(){
    if (req.senderKey) {
      res.append('Encrypted', 'true');
      res.send(res.responseData);
    } else {
      res.json(res.responseData);
    }
  }
  next();
}

