const assert = require('assert');
const { Client, Request } = require('../Starrys');


describe('Starrys', function() {
    describe('#Request', function() {
        it('should call proceed function', function(done) {
            const r = new Request({}, (self) => {
                assert.equal(self, r);
                done();
            });

            r.proceed();
        });

        it('should set variables and add line', function() {
            const r = new Request()
                .addLine({example: 0})
                .set('name', 'value')
                .set('zero', 0)
                .set(14, false)
                .addLine({example: 1})
                .addLine({example: 2});

            assert.deepEqual(r.data, {
                name: 'value',
                zero: 0,
                14: false,
                Lines: [{example: 0}, {example: 1}, {example: 2}]
            });
        });
    });

    describe('#Client', function() {
        const client = new Client(
            'http://localhost',
            { Group: 'example' },
        );

        it('should call axios function with url and correct data', function (done) {
            client.postableInstance = {
                post: (url, data) => {
                    assert.equal(url, 'http://localhost/fr/api/v2/Complex');
                    assert.deepEqual(data, {
                        Device: 'auto',
                        ClientId: 'abc',
                        Password: 1,
                        TaxMode: 1,
                        FullResponse: false,
                        Group: 'example',
                        Field: 10,
                        Lines: [{example: 0}, {example: 1}]
                    });

                    done();
                }
            };

            client.create()
                .addLine({example: 0})
                .addLine({example: 1})
                .set('ClientId', 'abc')
                .set('Field', 10)
                .proceed();
        });

        it('should transform starrys response', function () {
            client.postableInstance = {
                post: (url, data) => {
                    return Promise.resolve({data: {
                        "RequestId": "D35",
                        "ClientId": "",
                        "Path": "/fr/api/v2/Complex",
                        "Response": {
                            "Error": 0
                        },
                        "FiscalDocNumber": 31,
                        "DocNumber": 5,
                        "Date": {
                            "Date": {
                                "Day": 15,
                                "Month": 7,
                                "Year": 17
                            },
                            "Time": {
                                "Hour": 14,
                                "Minute": 38,
                                "Second": 27
                            }
                        },
                        "GrandTotal": 125000,
                        "FiscalSign": 1879546968,
                        "DocumentType": 0,
                        "QR": "t=20170715T1438&s=1250.00&fn=9999078900006825&i=31&fp=1879546968&n=1",
                        "FNSerialNumber": "9999078900006825",
                        "DeviceSerialNumber": "00000000381001017439",
                        "DeviceRegistrationNumber": "3949620073015105"
                    }});
                }
            };

            return client.create()
                .addLine({example: 0})
                .addLine({example: 1})
                .set('ClientId', 'abc')
                .set('Field', 10)
                .proceed()
                .then((resp) => {
                    assert.equal(+resp.Date, +new Date(2017, 7, 15, 14, 38, 27));
                });
        });

        it('should throw starrys error', function (done) {
            client.postableInstance = {
                post: (url, data) => {
                    return Promise.resolve({data: {
                        Response: {
                            Error: 9,
                            ErrorMessage: 'Неправильный адрес устройства'
                        }
                    }});
                }
            };

            client.create()
                .addLine({example: 0})
                .addLine({example: 1})
                .set('ClientId', 'abc')
                .set('Field', 10)
                .proceed()
                .then(() => {
                    done(new Error('Expected method to reject!'));
                })
                .catch((err) => {
                    assert.equal(err.message, 'Неправильный адрес устройства');
                    done();
                })
                .catch(done);
        });

    });
});
