const { MongoDatabase } = require('../src/index');
const assert = require('assert');

describe('MongoDatabase', () => {
    const db = new MongoDatabase({
        databasePath: '\\test\\databases\\test.db',
        seperator: '$',
        modelName: 'TEST',
        mongoURL:
            'mongodb+srv://activitybot:132435e@cluster0.blmcn.mongodb.net/test?retryWrites=true&w=majority'
    });

    (async () => {
        await db.deleteAll();
    })();

    it('set', (done) => {
        (async () => {
            assert.equal(await db.set('test$prop', 'EraxDB'), 'EraxDB');
        })();
        done();
    });

    it('get', (done) => {
        (async () => {
            assert.equal(await db.get('test$prop'), 'EraxDB');
        })();
        done();
    });

    it('type', (done) => {
        (async () => {
            assert.equal(await db.type('test'), 'object');
        })();
        done();
    });

    it('has', (done) => {
        (async () => {
            assert.equal(await db.has('test$prop'), true);
        })();
        done();
    });

    it('all', (done) => {
        (async () => {
            assert.equal(await db.all(), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
        })();
        done();
    });

    it('push', (done) => {
        (async () => {
            await db.push('array', ['EraxDB', '??', 'Database'], false, true);
            assert.equal(await db.push('array', 'Hello'), ['EraxDB', '??', 'Database', 'Hello']);
        })();
        done();
    });

    it('pull', (done) => {
        (async () => {
            assert.equal(await db.pull('array', ['??', 'Hello'], true), ['EraxDB', 'Database']);
        })();
        done();
    });

    it('math', (done) => {
        (async () => {
            await db.set('math', 34);
            assert.equal(await db.math('math', '*', 2), 68);
        })();
        done();
    });

    it('keyArray', (done) => {
        (async () => {
            assert.equal(await db.keyArray(), ['test', 'array', 'math']);
        })();
        done();
    });

    it('valueArray', (done) => {
        (async () => {
            assert.equal(await db.valueArray(), [{ prop: 'EraxDB' }, ['EraxDB', 'Database'], 68]);
        })();
        done();
    });

    it('startsWith', (done) => {
        (async () => {
            assert.equal(await db.startsWith('test'), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
        })();
        done();
    });

    it('arrayHas', (done) => {
        (async () => {
            assert.equal(await db.arrayHas('array'), true);
        })();
        done();
    });

    it('arrayHasValue', (done) => {
        (async () => {
            assert.equal(await db.arrayHasValue('array', 'EraxDB'), true);
        })();
        done();
    });

    it('toJSON', (done) => {
        (async () => {
            assert.equal(await db.toJSON(), {
                test: {
                    prop: 'EraxDB'
                },
                array: ['EraxDB', 'Database'],
                math: 68
            });
        })();
        done();
    });
});
