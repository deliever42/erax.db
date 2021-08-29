import { DataTypes } from "./DataTypes";
import { Operators } from "./Operators";
import { data } from "./interfaces/data";
import { Info } from "./interfaces/Info";
import { AllData } from "./interfaces/AllData";

declare module "erax.db" {
    export class JsonDatabase {
        public static DBCollection: string[];
        public constructor(options?: { databasePath: string });
        public dbPath: string;
        public dbName: string;
        public readonly data: data;
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
        public fetchAll(): AllData[];
        public all(): AllData[];
        public size(): number;
        public push(key: string, value: any, valueIgnoreIfPresent?: boolean): any[];
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): number;
        public delete(key: string): boolean;
        public includes(key: string): AllData[];
        public startsWith(key: string): AllData[];
        public endsWith(key: string): AllData[];
        public deleteEach(key: string, maxDeletedSize?: number): boolean;
        public type(key: string): DataTypes;
        public pull(key: string, value: any): any[];
        public filter(
            callback: (element: AllData) => boolean
        ): AllData[];
        public info(): Info<"json">;
        public keyArray(): string[];
        public valueArray(): any[];
        public DBCollectionSize(): number;
        public getDBName(): string;
        public filterAndDelete(
            callback: (element: AllData) => boolean,
            maxDeletedSize?: number
        ): number;
    }

    export class YamlDatabase {
        public static DBCollection: string[];
        public constructor(options?: { databasePath: string });
        public dbPath: string;
        public dbName: string;
        public readonly data: data;
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
        public fetchAll(): AllData[];
        public all(): AllData[];
        public size(): number;
        public push(key: string, value: any, valueIgnoreIfPresent?: boolean): any[];
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): number;
        public delete(key: string): boolean;
        public includes(key: string): AllData[];
        public startsWith(key: string): AllData[];
        public endsWith(key: string): AllData[];
        public deleteEach(key: string, maxDeletedSize?: number): boolean;
        public type(key: string): DataTypes;
        public pull(key: string, value: any): any[];
        public filter(
            callback: (element: AllData) => boolean
        ): AllData[];
        public info(): Info<"yaml">;
        public keyArray(): string[];
        public valueArray(): any[];
        public DBCollectionSize(): number;
        public getDBName(): string;
        public filterAndDelete(
            callback: (element: AllData) => boolean,
            maxDeletedSize?: number
        ): number;
    }

    export class SqliteDatabase {
        public static DBCollection: string[];
        public constructor(options?: { databasePath: string });
        public dbPath: string;
        public dbName: string;
        private sql: string;
        public set(key: string, value: any): Promise<any>;
        public fetch(key: string): Promise<any>;
        public get(key: string): Promise<any>;
        public add(key: string, value: number): Promise<number>;
        public subtract(key: string, value: number, goToNegative?: boolean): Promise<number>;
        public has(key: string): Promise<boolean>;
        public arrayHas(key: string): Promise<boolean>;
        public arrayHasValue(key: string, value: any): Promise<boolean>;
        public deleteAll(): Promise<boolean>;
        public fetchAll(): Promise<AllData[]>;
        public all(): Promise<AllData[]>;
        public size(): Promise<number>;
        public push(key: string, value: any, valueIgnoreIfPresent?: boolean): Promise<any[]>;
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): Promise<number>;
        public delete(key: string): Promise<boolean>;
        public includes(key: string): Promise<AllData[]>;
        public startsWith(key: string): Promise<AllData[]>;
        public endsWith(key: string): Promise<AllData[]>;
        public deleteEach(key: string, maxDeletedSize?: number): Promise<boolean>;
        public type(key: string): Promise<DataTypes>;
        public pull(key: string, value: any): Promise<any[]>;
        public filter(
            callback: (element: AllData) => boolean
        ): Promise<AllData[]>;
        public info(): Promise<Info<"sqlite">>;
        public keyArray(): Promise<string[]>;
        public valueArray(): Promise<any[]>;
        public import(path: string): Promise<boolean>;
        public export(path: string): Promise<boolean>;
        public DBCollectionSize(): number;
        public getDBName(): string;
        public filterAndDelete(
            callback: (element: AllData) => boolean,
            maxDeletedSize?: number
        ): Promise<number>;
    }

    export class MongoDatabase {
        public static DBCollection: string[];
        public constructor(options?: { mongoURL: string });
        public dbName: string;
        private mongo: string;
        public url: string;
        public set(key: string, value: any): Promise<any>;
        public fetch(key: string): Promise<any>;
        public get(key: string): Promise<any>;
        public add(key: string, value: number): Promise<number>;
        public subtract(key: string, value: number, goToNegative?: boolean): Promise<number>;
        public has(key: string): Promise<boolean>;
        public arrayHas(key: string): Promise<boolean>;
        public arrayHasValue(key: string, value: any): Promise<boolean>;
        public deleteAll(): Promise<boolean>;
        public fetchAll(): Promise<AllData[]>;
        public all(): Promise<AllData[]>;
        public size(): Promise<number>;
        public push(key: string, value: any, valueIgnoreIfPresent?: boolean): Promise<any[]>;
        public math(
            key: string,
            operator: Operators,
            value: number,
            goToNegative?: boolean
        ): Promise<number>;
        public delete(key: string): Promise<boolean>;
        public includes(key: string): Promise<AllData[]>;
        public startsWith(key: string): Promise<AllData[]>;
        public endsWith(key: string): Promise<AllData[]>;
        public deleteEach(key: string, maxDeletedSize?: number): Promise<boolean>;
        public type(key: string): Promise<DataTypes>;
        public pull(key: string, value: any): Promise<any[]>;
        public filter(
            callback: (element: AllData) => boolean
        ): Promise<AllData[]>;
        public info(): Promise<Info<"mongo">>;
        public keyArray(): Promise<string[]>;
        public valueArray(): Promise<any[]>;
        public import(path: string): Promise<boolean>;
        public export(path: string): Promise<boolean>;
        public DBCollectionSize(): number;
        public getDBName(): string;
        public filterAndDelete(
            callback: (element: AllData) => boolean,
            maxDeletedSize?: number
        ): Promise<number>;
    }

    export class Util {
        private static updateCheck(): {
            updated: boolean;
            installedVersion: string;
            packageData: string;
        };
        private static parseKey(key: string): string;
        private static write(path, data: data): void | null;
        private static dataSet(data: data, key: string, value: any): void;
        private static dataGet(data: data, key: string): any;
        private static dataHas(data: data, key: string): boolean;
        private static dataDelete(data: data, key: string): void | null;
    }
}
