const assert = require('assert');
const axios = require("axios");
const fs = require("fs");
const https = require("https");
const uuid = require("uuid/v4");
const createAgent = require('../utils/getHttpsAgent');
const { Client, Request } = require('../Starrys');


const instance = axios.create({ httpsAgent: createAgent() });
const client = new Client('https://fce.starrys.ru:4443', {}, instance);
client
    .create()
    .addLine({Qty: 1, Price: 100, TaxId: 4, Description: 'Тест 1'})
    .addLine({Qty: 2, Price: 1, TaxId: 4, Description: 'Тест 2'})
    .set('RequestId', uuid())
    .set('TaxMode', 1)
    .set('ClientId', 'abc')
    .set('Field', 10)
    .proceed()
    .then(console.log)
    .catch((err) => {
        console.log(err.data.Response);
    });
