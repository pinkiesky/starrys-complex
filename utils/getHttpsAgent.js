const https = require("https");
const fs = require("fs");


module.exports = function createHttpsAgentForStarrys(keyFile='cert.key', certFile='cert.crt') {
    return new https.Agent({
        key:  fs.readFileSync(keyFile),
        cert: fs.readFileSync(certFile),
        secureProtocol: true
    });
};