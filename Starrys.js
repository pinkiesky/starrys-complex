function starrysDate2js (stDate) {
    if (!stDate || !stDate.Date) {
        return new Date(0);
    }

    const d = stDate.Date, t = stDate.Time || {};
    return new Date(2000 + d.Year, d.Month, d.Day, t.Hour, t.Minute, t.Second);
}


class StarrysComplexRequest {
    constructor (data, evalFunc) {
        this.data = data || {Lines: []};
        this.evalFunc = evalFunc;
    }

    addLine (value) {
        this.data.Lines.push(value);
        return this;
    }

    set (name, value) {
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
     * @param {array} [lines=[]] массив товарных позиций
     * @return {StarrysComplexRequest} новый запрос
     */
    create (lines) {
        const data = { Lines: lines || [] };
        return new StarrysComplexRequest(data, this.proceed.bind(this));
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
    Client: StarrysClient
};