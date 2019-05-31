# starrys-complex

JS-библиотека для выполнения запроса `Complex` к облачному сервису аренды онлайн-касс [Starrys](http://check.starrys.ru).

Библитека поддерживает устройства версии 3.3.10

Более подробную информацию про Starrys и их протокол вы можете прочесть в [официальной документации](http://check.starrys.ru/docs/cloudapi_complex.pdf)

---

JS-library to fulfill the `Complex` request to the cloud-based online rental service [Starrys](http://check.starrys.ru).

The library supports devices version 3.3.10

For more information about Starrys and their protocol, you can read in [official documentation](http://check.starrys.ru/docs/cloudapi_complex.pdf)

## Возможности/Opportunities
 - Создание запросов
 - Выполнение запросов
 - Независимость от библиотеки для запросов

---

 - Creation of requests
 - Execution of requests
 - Http-Library independence architecture

## Архитектура/Architecture
Основная часть библиотеки - класс `StarrysClient`. Он служит для создания запросов, их выполнения и небольшой трансформации данных с сервера

---

The main part of the library is the class `StarrysClient`. It is used to create queries, their execution and a small transformation of data from the server


## Пример использования/Example

```js
const Client = require('starrys-complex').Client;
const httpAgent = require('starrys-complex/utils/getHttpsAgent');
const config = require('config').get('starrys');
const axios = require('axios');


const instance = axios.create({ 
    httpsAgent: httpAgent(config.key, config.crt), 
    timeout: 5000 
});
const starrys = new Client(config.url, config.options, instance);


const req = starrys
    .create()
    .addLine({ 
        Qty: thousandth(1),
        Price: 10000,
        TaxId: Tax.WITHOUT,
        Description: 'ServiceName'
    })
    .set('RequestId', 'random-order-id')
    .set('TaxMode', TaxMode.SIMPLIFIED)
    .set('NonCash', [10000, 0, 0]);
    .set('PhoneOrEmail', 'email@example.com');

req.proceed()
    .then(() => {
        console.info('Success!');
    })
    .catch((err) => {
        console.error('Starrys error', err);
    });
```