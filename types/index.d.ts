import { Operators, Schema, Info, All, DataTypes } from './Types';
import { EventEmitter } from 'events';
import { Connection, Model } from 'mongoose';

declare module 'erax.db' {
    export class JsonDatabase {
        public static DBCollection: string[];
        public constructor(options?: { databasePath?: string; seperator?: string });
        private dbPath: string;
        private dbName: string;
        private sep: string;
        private readonly data: Schema;
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
        public fetchAll(): All[];
        public all(): All[];
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
        public includes(key: string): All[];
        public startsWith(key: string): All[];
        public endsWith(key: string): All[];
        public deleteEach(key: string, maxDeletedSize?: number): number;
        public type(key: string): DataTypes;
        public pull(key: string, value: any, multiple?: boolean): any[];
        public filter(callback: (element: All) => any): All[];
        public info(): Info<'json'>;
        public keyArray(): string[];
        public valueArray(): any[];
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(callback: (element: All) => any, maxDeletedSize?: number): number;
        public reduce(callback: (a: All, b: All) => any): any[];
        public map(callback: (element: All) => any): any[];
        public toJSON(): Schema;
        public sort(callback: (a: All, b: All) => any): any;
    }

    export class YamlDatabase {
        public static DBCollection: string[];
        public constructor(options?: { databasePath?: string; seperator?: string });
        private dbPath: string;
        private dbName: string;
        private readonly data: Schema;
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
        public fetchAll(): All[];
        public all(): All[];
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
        public includes(key: string): All[];
        public startsWith(key: string): All[];
        public endsWith(key: string): All[];
        public deleteEach(key: string, maxDeletedSize?: number): number;
        public type(key: string): DataTypes;
        public pull(key: string, value: any, multiple?: boolean): any[];
        public filter(callback: (element: All) => any): All[];
        public info(): Info<'yaml'>;
        public keyArray(): string[];
        public valueArray(): any[];
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(callback: (element: All) => any, maxDeletedSize?: number): number;
        public reduce(callback: (a: All, b: All) => any): any[];
        public map(callback: (element: All) => any): any[];
        public toJSON(): Schema;
        public sort(callback: (a: All, b: All) => any): any;
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
        public fetchAll(): All[];
        public all(): All[];
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
        public includes(key: string): All[];
        public startsWith(key: string): All[];
        public endsWith(key: string): All[];
        public deleteEach(key: string, maxDeletedSize?: number): number;
        public type(key: string): DataTypes;
        public pull(key: string, value: any, multiple?: boolean): any[];
        public filter(callback: (element: All) => any): All[];
        public info(): Info<'sqlite'>;
        public keyArray(): string[];
        public valueArray(): any[];
        public import(path?: string): boolean;
        public export(path?: string): boolean;
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(callback: (element: All) => any, maxDeletedSize?: number): number;
        public reduce(callback: (a: All, b: All) => any): any[];
        public map(callback: (element: All) => any): any[];
        public toJSON(): Schema;
        public sort(callback: (a: All, b: All) => any): any;
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
        public fetchAll(): Promise<All[]>;
        public all(): Promise<All[]>;
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
        public includes(key: string): Promise<All[]>;
        public startsWith(key: string): Promise<All[]>;
        public endsWith(key: string): Promise<All[]>;
        public deleteEach(key: string, maxDeletedSize?: number): Promise<number>;
        public type(key: string): Promise<DataTypes>;
        public pull(key: string, value: any, multiple?: boolean): Promise<any[]>;
        public filter(callback: (element: All) => any): Promise<All[]>;
        public info(): Promise<Info<'mongo'>>;
        public keyArray(): Promise<string[]>;
        public valueArray(): Promise<any[]>;
        public import(path?: string): Promise<boolean>;
        public export(path?: string): Promise<boolean>;
        public DBCollectionSize(): number;
        public getDBName(): string;
        public findAndDelete(
            callback: (element: All) => any,
            maxDeletedSize?: number
        ): Promise<number>;
        public reduce(callback: (a: All, b: All) => any): Promise<any[]>;
        public map(callback: (element: All) => any): any[];
        public ready(...args: any): void;
        public toJSON(): Promise<Schema>;
        public get state(): 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'DISCONNECTED';
        public get disconnect(): Promise<void>;
        public get connect(): void;
        public get getURL(): string;
        public sort(callback: (a: All, b: All) => any): Promise<any>;
    }
}
