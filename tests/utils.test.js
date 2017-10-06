const assert = require('assert');


describe('Utils', function() {
    describe('#starrysDate2js()', function() {
        const starrysDate2js = require('../utils/starrysDate2js');

        it('should convert date', function() {
            const d = starrysDate2js({Date: {
                Year: 17,
                Month: 10,
                Day: 25
            }});

            assert.equal(+d, +new Date(2017, 10, 25));
        });

        it('should convert datetime', function() {
            const d = starrysDate2js({
                Date: {
                    Year: 17,
                    Month: 10,
                    Day: 25
                },
                Time: {
                    Hour: 1,
                    Minute: 49,
                    Second: 10
                }
            });

            assert.equal(+d, +new Date(2017, 10, 25, 1, 49, 10));
        });

        it('should return start of epoch if time is broken', function() {
            assert.equal(+starrysDate2js({ someStrange: -1 }), 0);
            assert.equal(+starrysDate2js(false), 0);
            assert.equal(+starrysDate2js(), 0);
        });
    });
});
