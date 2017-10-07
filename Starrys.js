function starrysDate2js (stDate) {
    if (!stDate || !stDate.Date) {
        return new Date(0);
    }

    const d = stDate.Date, t = stDate.Time || {};
    return new Date(2000 + d.Year, d.Month, d.Day, t.Hour, t.Minute, t.Second);
}

const Tax = {
    VAT18: 1,
    VAT10: 2,
    VAT0: 3,
    WITHOUT: 4,
    RATE_18_118: 5,
    RATE_10_110: 6,
};

const DocumentType = {
    INCOME: 0,
    EXPENDITURE: 1,
    RETURN_INCOME: 2,
    RETURN_EXPENDITURE: 3,
};

const TaxMode = {
    REGULAR: 0,
    SIMPLIFIED: 0,
    SIMPLIFIED_MINUS_EXPENDITURE: 0,
    AGRICULTURAL: 0,
    PATENT: 0,
};


const ALLOWED_KEYS = {
    'Group': "string",
    'Device': "string",
    'RequestId': "string",
    'Password': "number",
    'ClientId': "string",
    'DocumentType': "number",
    'Lines': "object",  // Array
    'Cash': "number",
    'NonCash': "object",
    'AdvancePayment': "number",
    'Credit': "number",
    'Consideration': "number",
    'TaxMode': "number",
    'PhoneOrEmail': "string",
    'Place': "string",
    'MaxDocumentsInTurn': "number",
    'FullResponse': "boolean",
};

const ALLOWED_LINE_KEYS = {
    'Qty': "number",
    'Price': "number",
    'PayAttribute': "number",
    'TaxId': "number",
    'Description': "string",
};

const rejectRequest = () => Promise.reject(new Error('call proceed for client-less request'));
class StarrysComplexRequest {
    constructor (evalFunc=rejectRequest) {
        this.evalFunc = evalFunc;
        this.data = { Lines: [] };
    }

    addLine (position) {
        const errored = Object.keys(position).filter((key) => {
            return typeof position[key] !== ALLOWED_LINE_KEYS[key];
        });

        if (errored.length > 0) {
            throw new TypeError(`Wrong position keys/values: ${errored}`);
        }

        this.data.Lines.push(position);
        return this;
    }

    set (name, value) {
        name = name.substring(0, 1).toUpperCase() + name.substring(1);

        if (ALLOWED_KEYS[name] === undefined) {
            throw new Error(`Unexpected value: ${name}`);
        }

        if (typeof value !== ALLOWED_KEYS[name]) {
            throw new TypeError(`Wrong value type: ${name}, type ${typeof value}`);
        }

        this.data[name] = value;
        return this;
    }

    proceed () {
        return this.evalFunc(this);
    }
}


class StarrysClient {
    /**
     * @constructor
     * @param {string} url адрес формата `https://addr:port`, который вы можете получить в личном кабинете
     * @param {object} [defaults={}] значения по-умолчанию для каждого запроса. Полный список значений смотрите в http://check.starrys.ru/docs/cloudapi_complex.pdf, глава 3
     * @param {object} postable
     * @param {function(url, data)} postable.post функция, которая принимает два значения (url и данные) и возвращает Promise
     */
    constructor (url, defaults, postable) {
        if (!url) {
            throw new URIError('Empty url');
        }

        this.url = url;
        this.defaults = {
            Device: 'auto',
            ClientId: null,
            Password: 1,
            TaxMode: 1,
            FullResponse: false
        };
        this.postableInstance = postable;

        this.setDefaults(defaults);
    }

    /**
     * "Обновляет" значения по-умолчанию для запроса
     * @param {object} newValues
     * @return {object} новые значения по-умолчанию
     * @see Object.assign
     */
    setDefaults (newValues) {
        return Object.assign(this.defaults, newValues);
    }

    /**
     * Создает, привязывает к текущему клиенту и возвращает запрос для дальнейшего конфигурирования
     * @return {StarrysComplexRequest} новый запрос
     */
    create () {
        return new StarrysComplexRequest(this.proceed.bind(this));
    }

    /**
     * Отправляет запрос на удаленный сервер, используя `StarrysClient.postable`
     * Обычно использовать этот метод не требуется, т.к. все запросы уже привязаны к клиенту
     * @param request запрос для выполнения
     * @return {Promise.<Object>}
     */
    proceed (request) {
        const data = JSON.parse(JSON.stringify(this.defaults));
        Object.assign(data, request.data);

        return this.postableInstance.post(this.url + '/fr/api/v2/Complex', data)
            .then((resp) => {
                const data = resp.data || resp;
                if (!data || Object.keys(data).length <= 0) {
                    throw new Error('wrong `postable` response: ' + JSON.stringify(data));
                }

                if (data.Response && data.Response.Error > 0) {
                    const e = new Error(data.Response.ErrorMessage || data.Response.Error || 'Starrys api error');
                    e.data = data;

                    throw e;
                }

                if (data.Date) {
                    data.__Date__ = data.Date;
                    data.Date = starrysDate2js(data.Date);
                }

                return data;
            });
    }
}



module.exports = {
    Request: StarrysComplexRequest,
    Client: StarrysClient,
    DocumentType,
    Tax,
    TaxMode,
    thousandth: function thousandth (number) {
        return number / 1000;
    }
};