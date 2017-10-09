const axios = require("axios");
const uuid = require("uuid/v4");
const createAgent = require('../utils/getHttpsAgent');
const { Client, Tax, thousandth, TaxMode } = require('../Starrys');


const instance = axios.create({ httpsAgent: createAgent(), timeout: 5000 });
const client = new Client('https://fce.starrys.ru:4443', {}, instance);
const raw = client
    .create()
    .addLine({Qty: thousandth(1), Price: 100, TaxId: Tax.VAT18, Description: 'Тест 1'})
    .addLine({Qty: thousandth(2), Price: 1, TaxId: Tax.WITHOUT, Description: 'Тест 2'})
    .set('RequestId', uuid())
    .set('TaxMode', TaxMode.REGULAR)
    .set('ClientId', 'abc')
    .set('NonCash', [102, 0, 0])
    .proceed()
    .then(console.log)
    .catch((err) => {
        console.log(err);
    });
