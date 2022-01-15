const { YamlDatabase } = require('../src/index');
const assert = require('assert');

describe('YamlDatabase', () => {
    const db = new YamlDatabase({
        databasePath: '\\test\\databases\\test.yml',
        seperator: '$'
    });

    db.deleteAll();

    it('set', () => {
        assert.deepEqual(db.set('test$prop', 'EraxDB'), 'EraxDB');
    });

    it('get', () => {
        assert.deepEqual(db.get('test$prop'), 'EraxDB');
    });

    it('type', () => {
        assert.deepEqual(db.type('test'), 'object');
    });

    it('has', () => {
        assert.deepEqual(db.has('test$prop'), true);
    });

    it('all', () => {
        assert.deepEqual(db.all(), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
    });

    it('push', () => {
        db.push('array', ['EraxDB', '??', 'Database'], false, true);
        assert.deepEqual(db.push('array', 'Hello'), ['EraxDB', '??', 'Database', 'Hello']);
    });

    it('pull', () => {
        assert.deepEqual(db.pull('array', ['??', 'Hello'], true), ['EraxDB', 'Database']);
    });

    it('math', () => {
        db.set('math', 34);
        assert.deepEqual(db.math('math', '*', 2), 68);
    });

    it('keyArray', () => {
        assert.deepEqual(db.keyArray(), ['test', 'array', 'math']);
    });

    it('valueArray', () => {
        assert.deepEqual(db.valueArray(), [{ prop: 'EraxDB' }, ['EraxDB', 'Database'], 68]);
    });

    it('startsWith', () => {
        assert.deepEqual(db.startsWith('test'), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
    });

    it('arrayHas', () => {
        assert.deepEqual(db.arrayHas('array'), true);
    });

    it('arrayHasValue', () => {
        assert.deepEqual(db.arrayHasValue('array', 'EraxDB'), true);
    });

    it('toJSON', () => {
        assert.deepEqual(db.toJSON(), {
            test: {
                prop: 'EraxDB'
            },
            array: ['EraxDB', 'Database'],
            math: 68
        });
    });
});
