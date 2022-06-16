const { MongoDatabase } = require('../dist/index');

jest.useFakeTimers();

describe('MongoDatabase', () => {
    const db = new MongoDatabase({
        backup: {
            enabled: true,
            filePath: 'test\\databases\\backups\\mongo',
            backupInterval: 5000
        },
        url: 'mongodb+srv://emax:132435e@cluster0.blmcn.mongodb.net/EMAX_DATABASE?retryWrites=true&w=majority',
        modelName: 'test'
    });

    test('set', () => {
        db.set('test.prop', 'EraxDB').then((data) => {
            expect(data).toEqual('EraxDB');
        });
    });

    test('delete', () => {
        db.delete('test.prop').then((data) => {
            expect(data).toEqual(void 0);
        });
    });

    test('get', () => {
        db.get('test').then((data) => {
            expect(data).toEqual({});
        });
    });

    test('type', () => {
        db.type('test').then((data) => {
            expect(data).toEqual('object');
        });
    });

    test('has', () => {
        db.has('test').then((data) => {
            expect(data).toEqual(true);
        });
    });

    test('getAll', () => {
        db.getAll().then((data) => {
            expect(data).toEqual([{ ID: 'test', data: {} }]);
        });
    });

    test('push', () => {
        db.push('array', ['EraxDB', '??', 'Database']).then(() => {
            db.push('array', 'Hello').then((data) => {
                expect(data).toEqual(['EraxDB', '??', 'Database']);
            });
        });
    });

    test('pull', () => {
        db.pull('array', ['??', 'Hello']).then((data) => {
            expect(data).toEqual(['EraxDB', 'Database']);
        });
    });

    test('math', () => {
        db.set('math', 34).then(() => {
            db.math('math', '*', 2).then((data) => {
                expect(data).toEqual(68);
            });
        });
    });

    test('keyArray', () => {
        db.keyArray().then((data) => {
            expect(data).toEqual(['test', 'array', 'math']);
        });
    });

    test('valueArray', () => {
        db.valueArray().then((data) => {
            expect(data).toEqual([{}, ['EraxDB', 'Database'], 68]);
        });
    });

    test('backup', () => {
        jest.advanceTimersByTime(10000);
    });
});
