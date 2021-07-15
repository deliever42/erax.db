declare module "erax.db" {
    export class JsonDatabase {
        public constructor(options?: { databasePath: string });
        public dbPath: string;
        public dbName: string;
        public data: { [key: string]: any | any[] };
        public set(key: string, value: any): any | any[];
        public fetch(key: string): any | any[];
        public get(key: string): any | any[];
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
        public deleteEach(key: string): boolean;
        public type(key: string): DataTypes;
        public pull(key: string, value: any): any[];
        public filter(
            callbackfn: (element: AllData, index: number, array: AllData[]) => boolean
        ): AllData[];
        public info(): Info<"json">;
        public keyArray(): string[];
        public valueArray(): any[];
        private save(): boolean;
    }

    export class YamlDatabase {
        public constructor(options?: { databasePath: string });
        public dbPath: string;
        public dbName: string;
        public data: { [key: string]: any | any[] };
        public set(key: string, value: any): any | any[];
        public fetch(key: string): any | any[];
        public get(key: string): any | any[];
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
        public deleteEach(key: string): boolean;
        public type(key: string): DataTypes;
        public pull(key: string, value: any): any[];
        public filter(
            callbackfn: (element: AllData, index: number, array: AllData[]) => boolean
        ): AllData[];
        public info(): Info<"yaml">;
        public keyArray(): string[];
        public valueArray(): any[];
        private save(): boolean;
    }

    export class SqliteDatabase {
        public constructor(options?: { databasePath: string });
        public dbPath: string;
        public dbName: string;
        private sql: string;
        public set(key: string, value: any): Promise<any | any[]>;
        public fetch(key: string): Promise<any | any[]>;
        public get(key: string): Promise<any | any[]>;
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
        public deleteEach(key: string): Promise<boolean>;
        public type(key: string): Promise<DataTypes>;
        public pull(key: string, value: any): Promise<any[]>;
        public filter(
            callbackfn: (element: AllData, index: number, array: AllData[]) => boolean
        ): Promise<AllData[]>;
        public info(): Promise<Info<"sqlite">>;
        public keyArray(): Promise<string[]>;
        public valueArray(): Promise<any[]>;
        public import(path: string): Promise<boolean>;
        public export(path: string): Promise<boolean>;
    }

    export class MongoDatabase {
        public constructor(options?: { mongoURL: string });
        public dbName: string;
        private mongo: string;
        public url: string;
        public set(key: string, value: any): Promise<any | any[]>;
        public fetch(key: string): Promise<any | any[]>;
        public get(key: string): Promise<any | any[]>;
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
        public deleteEach(key: string): Promise<boolean>;
        public type(key: string): Promise<DataTypes>;
        public pull(key: string, value: any): Promise<any[]>;
        public filter(
            callbackfn: (element: AllData, index: number, array: AllData[]) => boolean
        ): Promise<AllData[]>;
        public info(): Promise<Info<"mongo">>;
        public keyArray(): Promise<string[]>;
        public valueArray(): Promise<any[]>;
        public import(path: string): Promise<boolean>;
        public export(path: string): Promise<boolean>;
    }

    export interface Info<Type> {
        Sürüm: number;
        DatabaseAdı: string;
        ToplamVeriSayısı: number;
        DatabaseTürü: Type;
    }

    export interface AllData {
        ID: string;
        data: any | any[];
    }

    export type DataTypes =
        | "array"
        | "string"
        | "number"
        | "boolean"
        | "symbol"
        | "function"
        | "object"
        | "null"
        | "undefined"
        | "bigint";

    export type Operators = "+" | "-" | "*" | "/" | "%";
}
