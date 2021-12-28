const { JsonDatabase } = require('../src/index');
const assert = require('assert');

describe('JsonDatabase', () => {
    const db = new JsonDatabase({
        databasePath: '\\test\\databases\\test.json',
        seperator: '$'
    });

    db.deleteAll();

    it('set', () => {
        assert.equal(db.set('test$prop', 'EraxDB'), 'EraxDB');
    });

    it('get', () => {
        assert.equal(db.get('test$prop'), 'EraxDB');
    });

    it('type', () => {
        assert.equal(db.type('test'), 'object');
    });

    it('has', () => {
        assert.equal(db.has('test$prop'), true);
    });

    it('all', () => {
        assert.equal(db.all(), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
    });

    it('push', () => {
        db.push('array', ['EraxDB', '??', 'Database'], false, true);
        assert.equal(db.push('array', 'Hello'), ['EraxDB', '??', 'Database', 'Hello']);
    });

    it('pull', () => {
        assert.equal(db.pull('array', ['??', 'Hello'], true), ['EraxDB', 'Database']);
    });

    it('math', () => {
        db.set('math', 34);
        assert.equal(db.math('math', '*', 2), 68);
    });

    it('keyArray', () => {
        assert.equal(db.keyArray(), ['test', 'array', 'math']);
    });

    it('valueArray', () => {
        assert.equal(db.valueArray(), [{ prop: 'EraxDB' }, ['EraxDB', 'Database'], 68]);
    });

    it('startsWith', () => {
        assert.equal(db.startsWith('test'), [{ ID: 'test', data: { prop: 'EraxDB' } }]);
    });

    it('arrayHas', () => {
        assert.equal(db.arrayHas('array'), true);
    });

    it('arrayHasValue', () => {
        assert.equal(db.arrayHasValue('array', 'EraxDB'), true);
    });

    it('toJSON', () => {
        assert.equal(db.toJSON(), {
            test: {
                prop: 'EraxDB'
            },
            array: ['EraxDB', 'Database'],
            math: 68
        });
    });
});
