const { MongoDatabase } = require('../dist/index');
const assert = require('assert');

describe('MongoDatabase', () => {
    const db = new MongoDatabase({
        backup: {
            enabled: true,
            filePath: 'test\\databases\\backups\\mongo',
            backupInterval: 5000
        },
        url: 'protected',
        modelName: 'EMAX'
    });

    /*(async () => {
        await db.clear();
    })();*/

    it('set', (done) => {
        (async () => {
            assert.deepEqual(await db.set('test.prop', 'EraxDB'), 'EraxDB');
        })();
        done();
    });

    it('delete', (done) => {
        (async () => {
            assert.deepEqual(await db.delete('test.prop'), void 0);
        })();
        done();
    });

    it('get', (done) => {
        (async () => {
            assert.deepEqual(await db.get('test'), {});
        })();
        done();
    });

    it('type', (done) => {
        (async () => {
            assert.deepEqual(await db.type('test'), 'object');
        })();
        done();
    });

    it('has', (done) => {
        (async () => {
            assert.deepEqual(await db.has('test'), true);
        })();
        done();
    });

    it('getAll', (done) => {
        (async () => {
            assert.deepEqual(await db.all(), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
        })();
        done();
    });

    it('push', (done) => {
        (async () => {
            await db.push('array', ['EraxDB', '??', 'Database'], false, true);
            assert.deepEqual(await db.push('array', 'Hello'), [
                'EraxDB',
                '??',
                'Database',
                'Hello'
            ]);
        })();
        done();
    });

    it('pull', (done) => {
        (async () => {
            assert.deepEqual(await db.pull('array', ['??', 'Hello'], true), ['EraxDB', 'Database']);
        })();
        done();
    });

    it('math', (done) => {
        (async () => {
            await db.set('math', 34);
            assert.deepEqual(await db.math('math', '*', 2), 68);
        })();
        done();
    });

    it('keyArray', (done) => {
        (async () => {
            assert.deepEqual(await db.keyArray(), ['test', 'array', 'math']);
        })();
        done();
    });

    it('valueArray', (done) => {
        (async () => {
            assert.deepEqual(await db.valueArray(), [{}, ['EraxDB', 'Database'], 68]);
        })();
        done();
    });
});
