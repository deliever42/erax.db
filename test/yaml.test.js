const { YamlDatabase } = require('../src/index');
const assert = require('assert');

describe('YamlDatabase', () => {
    const db = new YamlDatabase({
        databasePath: '\\test\\databases\\test.yml',
        seperator: '$'
    });

    db.deleteAll();

    it('set', () => {
        assert.deepStrictEqual(db.set('test$prop', 'EraxDB'), 'EraxDB');
    });

    it('get', () => {
        assert.deepStrictEqual(db.get('test$prop'), 'EraxDB');
    });

    it('type', () => {
        assert.deepStrictEqual(db.type('test'), 'object');
    });

    it('has', () => {
        assert.deepStrictEqual(db.has('test$prop'), true);
    });

    it('all', () => {
        assert.deepStrictEqual(db.all(), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
    });

    it('push', () => {
        db.push('array', ['EraxDB', '??', 'Database'], false, true);
        assert.deepStrictEqual(db.push('array', 'Hello'), ['EraxDB', '??', 'Database', 'Hello']);
    });

    it('pull', () => {
        assert.deepStrictEqual(db.pull('array', ['??', 'Hello'], true), ['EraxDB', 'Database']);
    });

    it('math', () => {
        db.set('math', 34);
        assert.deepStrictEqual(db.math('math', '*', 2), 68);
    });

    it('keyArray', () => {
        assert.deepStrictEqual(db.keyArray(), ['test', 'array', 'math']);
    });

    it('valueArray', () => {
        assert.deepStrictEqual(db.valueArray(), [{ prop: 'EraxDB' }, ['EraxDB', 'Database'], 68]);
    });

    it('startsWith', () => {
        assert.deepStrictEqual(db.startsWith('test'), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
    });

    it('arrayHas', () => {
        assert.deepStrictEqual(db.arrayHas('array'), true);
    });

    it('arrayHasValue', () => {
        assert.deepStrictEqual(db.arrayHasValue('array', 'EraxDB'), true);
    });

    it('toJSON', () => {
        assert.deepStrictEqual(db.toJSON(), {
            test: {
                prop: 'EraxDB'
            },
            array: ['EraxDB', 'Database'],
            math: 68
        });
    });
});
