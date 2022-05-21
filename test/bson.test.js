const { BsonDatabase } = require('../dist/index');
const assert = require('assert');

describe('BsonDatabase', () => {
    const db = new BsonDatabase({
        filePath: 'test\\databases\\test.bson',
        backup: {
            enabled: true,
            filePath: 'test\\databases\\backups\\bson',
            backupInterval: 5000
        }
    });

    db.clear();

    it('set', () => {
        assert.deepEqual(db.set('test.prop', 'EraxDB'), 'EraxDB');
    });

    it('delete', () => {
        assert.deepEqual(db.delete('test.prop'), void 0);
    });

    it('get', () => {
        assert.deepEqual(db.get('test'), {});
    });

    it('type', () => {
        assert.deepEqual(db.type('test'), 'object');
    });

    it('has', () => {
        assert.deepEqual(db.has('test'), true);
    });

    it('getAll', () => {
        assert.deepEqual(db.getAll(), [{ ID: 'test', data: {} }]);
    });

    it('push', () => {
        db.push('array', ['EraxDB', '??', 'Database']);
        assert.deepEqual(db.push('array', 'Hello'), ['EraxDB', '??', 'Database', 'Hello']);
    });

    it('pull', () => {
        assert.deepEqual(db.pull('array', ['??', 'Hello']), ['EraxDB', 'Database']);
    });

    it('math', () => {
        db.set('math', 34);
        assert.deepEqual(db.math('math', '*', 2), 68);
    });

    it('keyArray', () => {
        assert.deepEqual(db.keyArray(), ['test', 'array', 'math']);
    });

    it('valueArray', () => {
        assert.deepEqual(db.valueArray(), [{}, ['EraxDB', 'Database'], 68]);
    });
});
