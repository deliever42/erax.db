export interface All {
    ID: string;
    data: any;
}

export interface Info<T> {
    Version: number;
    DatabaseName: string;
    DataSize: number;
    DatabaseType: T;
}

export interface Schema {
    [key: string]: any;
}

export type DataTypes =
    | 'array'
    | 'string'
    | 'number'
    | 'boolean'
    | 'symbol'
    | 'function'
    | 'object'
    | 'null'
    | 'undefined'
    | 'bigint';

export type Operators = '+' | '-' | '*' | '/' | '%';
