const axios = require("axios");
const uuid = require("uuid/v4");
const createAgent = require('../utils/getHttpsAgent');
const { Client, Tax, thousandth, TaxMode } = require('../Starrys');


const instance = axios.create({ httpsAgent: createAgent(), timeout: 5000 });
const client = new Client('https://kkt.starrys.ru', {}, instance);
const raw = client
    .create();

raw.data = {"Lines":[{"Qty":1000,"Price":23430,"TaxId":4,"Description":"Личный кабинет"}],"RequestId":"6c33ec30-3e68-4cfc-b34c-7612fbc4388d","TaxMode":0,"NonCash":[23430,0,0]};
raw
    .proceed()
    .then(console.log)
    .catch((err) => {
        console.log(err);
    });
