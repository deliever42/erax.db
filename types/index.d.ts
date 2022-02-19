import { EventEmitter } from 'events';
import { Connection, Model } from 'mongoose';

declare module 'erax.db' {
    export class JsonDatabase {
        public static DBCollection: string[];
        public constructor(options?: { databasePath?: string; seperator?: string });
        private dbPath: string;
        private dbName: string;
        private sep: string;
        private readonly data: DataObject;
        public set(key: string, value: any): any;
        public fetch(key: string): any;
        public get(key: string): any;
        public destroy(): boolean;
        public add(key: string, value: number): number;
        public subtract(key: string, value: number, goToNegative?: boolean): number;
        public has(key: string): boolean;
        public arrayHas(key: string): boolean;
        public arrayHasValue(key: string, value: any): boolean;
        public deleteAll(): boolean;
        public fetchAll(): DataSchema[];
        public all(): DataSchema[];
        public size(): number;
        public push(
            key: string,
            value: any,
            valueIgnoreIfPresent?: boolean,
            multiple?: boolean
        ): any[];
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): number;
        public delete(key: string): boolean;
        public includes(key: string): DataSchema[];
        public startsWith(key: string): DataSchema[];
        public endsWith(key: string): DataSchema[];
        public deleteEach(key: string, maxDeletedSize?: number): number;
        public type(key: string): DataTypes;
        public pull(key: string, value: any, multiple?: boolean): any[];
        public filter(callback: (element: DataSchema) => any): DataSchema[];
        public info(): DatabaseInfo<'json'>;
        public keyArray(): string[];
        public valueArray(): any[];
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(
            callback: (element: DataSchema) => any,
            maxDeletedSize?: number
        ): number;
        public reduce(callback: (a: DataSchema, b: DataSchema) => any): any[];
        public map(callback: (element: DataSchema) => any): any[];
        public toJSON(): DataObject;
        public sort(callback: (a: DataSchema, b: DataSchema) => any): any;
    }

    export class YamlDatabase {
        public static DBCollection: string[];
        public constructor(options?: { databasePath?: string; seperator?: string });
        private dbPath: string;
        private dbName: string;
        private readonly data: DataObject;
        private sep: string;
        public set(key: string, value: any): any;
        public fetch(key: string): any;
        public get(key: string): any;
        public destroy(): boolean;
        public add(key: string, value: number): number;
        public subtract(key: string, value: number, goToNegative?: boolean): number;
        public has(key: string): boolean;
        public arrayHas(key: string): boolean;
        public arrayHasValue(key: string, value: any): boolean;
        public deleteAll(): boolean;
        public fetchAll(): DataSchema[];
        public all(): DataSchema[];
        public size(): number;
        public push(
            key: string,
            value: any,
            valueIgnoreIfPresent?: boolean,
            multiple?: boolean
        ): any[];
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): number;
        public delete(key: string): boolean;
        public includes(key: string): DataSchema[];
        public startsWith(key: string): DataSchema[];
        public endsWith(key: string): DataSchema[];
        public deleteEach(key: string, maxDeletedSize?: number): number;
        public type(key: string): DataTypes;
        public pull(key: string, value: any, multiple?: boolean): any[];
        public filter(callback: (element: DataSchema) => any): DataSchema[];
        public info(): DatabaseInfo<'yaml'>;
        public keyArray(): string[];
        public valueArray(): any[];
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(
            callback: (element: DataSchema) => any,
            maxDeletedSize?: number
        ): number;
        public reduce(callback: (a: DataSchema, b: DataSchema) => any): any[];
        public map(callback: (element: DataSchema) => any): any[];
        public toJSON(): DataObject;
        public sort(callback: (a: DataSchema, b: DataSchema) => any): any;
    }

    export class SqliteDatabase {
        public static DBCollection: string[];
        public constructor(options?: {
            databasePath?: string;
            tableName?: string;
            seperator?: string;
        });
        private dbPath: string;
        private dbName: string;
        private tableName: string;
        private sep: string;
        private sql: any;
        public set(key: string, value: any): any;
        public fetch(key: string): any;
        public get(key: string): any;
        public add(key: string, value: number): number;
        public subtract(key: string, value: number, goToNegative?: boolean): number;
        public has(key: string): boolean;
        public arrayHas(key: string): boolean;
        public arrayHasValue(key: string, value: any): boolean;
        public deleteAll(): boolean;
        public destroy(): boolean;
        public fetchAll(): DataSchema[];
        public all(): DataSchema[];
        public size(): number;
        public push(
            key: string,
            value: any,
            valueIgnoreIfPresent?: boolean,
            multiple?: boolean
        ): any[];
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): number;
        public delete(key: string): boolean;
        public includes(key: string): DataSchema[];
        public startsWith(key: string): DataSchema[];
        public endsWith(key: string): DataSchema[];
        public deleteEach(key: string, maxDeletedSize?: number): number;
        public type(key: string): DataTypes;
        public pull(key: string, value: any, multiple?: boolean): any[];
        public filter(callback: (element: DataSchema) => any): DataSchema[];
        public info(): DatabaseInfo<'sqlite'>;
        public keyArray(): string[];
        public valueArray(): any[];
        public import(path?: string): boolean;
        public export(path?: string): boolean;
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(
            callback: (element: DataSchema) => any,
            maxDeletedSize?: number
        ): number;
        public reduce(callback: (a: DataSchema, b: DataSchema) => any): any[];
        public map(callback: (element: DataSchema) => any): any[];
        public toJSON(): DataObject;
        public sort(callback: (a: DataSchema, b: DataSchema) => any): any;
    }

    export class MongoDatabase extends EventEmitter {
        public static DBCollection: string[];
        public constructor(options: {
            mongoURL: string;
            seperator?: string;
            modelName?: string;
            mongoOptions?: object;
        });
        private dbName: string;
        private mongo: Model<any, {}>;
        private sep: string;
        private mongoOptions: object;
        private url: string;
        private mongoose: unknown | NodeRequire;
        private connection: Connection;
        public set(key: string, value: any): Promise<any>;
        public fetch(key: string): Promise<any>;
        public get(key: string): Promise<any>;
        public add(key: string, value: number): Promise<number>;
        public subtract(key: string, value: number, goToNegative?: boolean): Promise<number>;
        public has(key: string): Promise<boolean>;
        public arrayHas(key: string): Promise<boolean>;
        public arrayHasValue(key: string, value: any): Promise<boolean>;
        public deleteAll(): Promise<boolean>;
        public fetchAll(): Promise<DataSchema[]>;
        public all(): Promise<DataSchema[]>;
        public size(): Promise<number>;
        public push(
            key: string,
            value: any,
            valueIgnoreIfPresent?: boolean,
            multiple?: boolean
        ): Promise<any[]>;
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): Promise<number>;
        public delete(key: string): Promise<boolean>;
        public includes(key: string): Promise<DataSchema[]>;
        public startsWith(key: string): Promise<DataSchema[]>;
        public endsWith(key: string): Promise<DataSchema[]>;
        public deleteEach(key: string, maxDeletedSize?: number): Promise<number>;
        public type(key: string): Promise<DataTypes>;
        public pull(key: string, value: any, multiple?: boolean): Promise<any[]>;
        public filter(callback: (element: DataSchema) => any): Promise<DataSchema[]>;
        public info(): Promise<DatabaseInfo<'mongo'>>;
        public keyArray(): Promise<string[]>;
        public valueArray(): Promise<any[]>;
        public import(path?: string): Promise<boolean>;
        public export(path?: string): Promise<boolean>;
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(
            callback: (element: DataSchema) => any,
            maxDeletedSize?: number
        ): Promise<number>;
        public reduce(callback: (a: DataSchema, b: DataSchema) => any): Promise<any[]>;
        public map(callback: (element: DataSchema) => any): any[];
        public ready(...args: any): void;
        public toJSON(): Promise<DataObject>;
        public get state(): 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'DISCONNECTED';
        public get disconnect(): Promise<void>;
        public get connect(): void;
        public get getURL(): string;
        public sort(callback: (a: DataSchema, b: DataSchema) => any): Promise<any>;
    }

    export interface DataSchema {
        ID: string;
        data: any;
    }

    export interface DatabaseInfo<T> {
        Version: number;
        DatabaseName: string;
        DataSize: number;
        DatabaseType: T;
    }

    export interface DataObject {
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
}
