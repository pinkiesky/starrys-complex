# starrys-complex

JS-библиотека для выполнения запроса `Complex` к облачному сервису аренды онлайн-касс [Starrys](http://check.starrys.ru).

Библитека поддерживает устройства версии 3.3.10

Более подробную информацию про Starrys и их протокол вы можете прочесть в [официальной документации](http://check.starrys.ru/docs/cloudapi_complex.pdf)


## Возможности
 - Создание запросов
 - Выполнение запросов
 - Независимость от библиотеки для запросов

## Архитектура
Основная часть библиотеки - класс `StarrysClient`. Он служит для создания запросов, их выполнения и небольшой трансформации данных с сервера

## Example/Пример использования

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