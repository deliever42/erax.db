const { BsonDatabase } = require('../dist/index');

jest.useFakeTimers();

describe('BsonDatabase', () => {
    const db = new BsonDatabase({
        filePath: 'test\\databases\\test.bson',
        backup: {
            enabled: true,
            filePath: 'test\\databases\\backups\\bson',
            backupInterval: 5000
        }
    });

    test('set', () => {
        expect(db.set('test.prop', 'EraxDB')).toEqual('EraxDB');
    });

    test('delete', () => {
        expect(db.delete('test.prop')).toEqual(void 0);
    });

    test('get', () => {
        expect(db.get('test')).toEqual({});
    });

    test('type', () => {
        expect(db.type('test')).toEqual('object');
    });

    test('has', () => {
        expect(db.has('test')).toEqual(true);
    });

    test('getAll', () => {
        expect(db.getAll()).toEqual([{ ID: 'test', data: {} }]);
    });

    test('push', () => {
        db.push('array', ['EraxDB', '??', 'Database']);
        expect(db.push('array', 'Hello')).toEqual(['EraxDB', '??', 'Database', 'Hello']);
    });

    test('pull', () => {
        expect(db.pull('array', ['??', 'Hello'])).toEqual(['EraxDB', 'Database']);
    });

    test('math', () => {
        db.set('math', 34);
        expect(db.math('math', '*', 2)).toEqual(68);
    });

    test('keyArray', () => {
        expect(db.keyArray()).toEqual(['test', 'array', 'math']);
    });

    test('valueArray', () => {
        expect(db.valueArray()).toEqual([{}, ['EraxDB', 'Database'], 68]);
    });

    test('backup', () => {
        jest.advanceTimersByTime(10000);
    });
});
