declare module "erax.db" {
  export class JsonDatabase {
    public constructor(options?: { databasePath: string });
    public dbPath: string;
    public dbName: string;
    public data: { [key: string]: any };
    public set(key: string, value: any): any;
    public fetch(key: string): any;
    public get(key: string): any;
    public destroy(): boolean;
    public add(key: string, value: number): any;
    public subtract(key: string, value: number, goToNegative?: boolean): any;
    public has(key: string): boolean;
    public arrayHas(key: string): boolean;
    public arrayHasValue(key: string, value: any): boolean;
    public deleteAll(): boolean;
    public fetchAll(): Array<{ ID: string, data: any }>;
    public all(): Array<{ ID: string, data: any }>;
    public size(): number;
    public push(key: string, value: any, valueIgnoreIfPresent?: boolean): Array<any[]>;
    public math(key: string, operator: "+" | "-" | "*" | "/" | "%", value: number, goToNegative?: boolean): any;
    public delete(key: string): boolean;
    public includes(key: string): Array<{ ID: string, data: any }>;
    public startsWith(key: string): Array<{ ID: string, data: any }>;
    public endsWith(key: string): Array<{ ID: string, data: any }>;
    public deleteEach(key: string): boolean;
    public type(key: string): "array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint";
    public pull(key: string, value: any): Array<any[]>;
    public filter(callbackfn: (element: { ID: string, data: any }, index: number, array: Array<{ ID: string, data: any }>) => boolean): Array<{ ID: string, data: any }>;
    public info(): { Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "json" | "yaml" | "sqlite" };
    public keyArray(): Array<string[]>;
    public valueArray(): Array<any[]>;
  }

  export class YamlDatabase {
    public constructor(options?: { databasePath: string });
    public dbPath: string;
    public dbName: string;
    public data: { [key: string]: any };
    public set(key: string, value: any): any;
    public fetch(key: string): any;
    public get(key: string): any;
    public destroy(): boolean;
    public add(key: string, value: number): any;
    public subtract(key: string, value: number, goToNegative?: boolean): any;
    public has(key: string): boolean;
    public arrayHas(key: string): boolean;
    public arrayHasValue(key: string, value: any): boolean;
    public deleteAll(): boolean;
    public fetchAll(): Array<{ ID: string, data: any }>;
    public all(): Array<{ ID: string, data: any }>;
    public size(): number;
    public push(key: string, value: any, valueIgnoreIfPresent?: boolean): Array<any[]>;
    public math(key: string, operator: "+" | "-" | "*" | "/" | "%", value: number, goToNegative?: boolean): any;
    public delete(key: string): boolean;
    public includes(key: string): Array<{ ID: string, data: any }>;
    public startsWith(key: string): Array<{ ID: string, data: any }>;
    public endsWith(key: string): Array<{ ID: string, data: any }>;
    public deleteEach(key: string): boolean;
    public type(key: string): "array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint";
    public pull(key: string, value: any): Array<any[]>;
    public filter(callbackfn: (element: { ID: string, data: any }, index: number, array: Array<{ ID: string, data: any }>) => boolean): Array<{ ID: string, data: any }>;
    public info(): { Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "json" | "yaml" | "sqlite" };
    public keyArray(): Array<string[]>;
    public valueArray(): Array<any[]>;
  }

  export class SqliteDatabase {
    public constructor(options?: { databasePath: string });
    public dbPath: string;
    public dbName: string;
    public data: { [key: string]: any };
    private sql: string
    public set(key: string, value: any): Promise<any>;
    public fetch(key: string): Promise<any>;
    public get(key: string): Promise<any>;
    public add(key: string, value: number): Promise<any>;
    public subtract(key: string, value: number, goToNegative?: boolean): Promise<any>;
    public has(key: string): Promise<boolean>;
    public arrayHas(key: string): Promise<boolean>;
    public arrayHasValue(key: string, value: any): Promise<boolean>;
    public deleteAll(): Promise<boolean>;
    public fetchAll(): Promise<Array<{ ID: string, data: any }>>;
    public all(): Promise<Array<{ ID: string, data: any }>>;
    public size(): Promise<number>;
    public push(key: string, value: any, valueIgnoreIfPresent?: boolean): Promise<Array<any[]>>;
    public math(key: string, operator: "+" | "-" | "*" | "/" | "%", value: number, goToNegative?: boolean): Promise<any>;
    public delete(key: string): Promise<boolean>;
    public includes(key: string): Promise<Array<{ ID: string, data: any }>>;
    public startsWith(key: string): Promise<Array<{ ID: string, data: any }>>;
    public endsWith(key: string): Promise<Array<{ ID: string, data: any }>>;
    public deleteEach(key: string): Promise<boolean>;
    public type(key: string): Promise<"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint">;
    public pull(key: string, value: any): Promise<Array<any[]>>;
    public filter(callbackfn: (element: { ID: string, data: any }, index: number, array: Array<{ ID: string, data: any }>) => boolean): Promise<Array<{ ID: string, data: any }>>;
    public info(): { Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "json" | "yaml" | "sqlite" };
    public keyArray(): Promise<Array<string[]>>;
    public valueArray(): Promise<Array<any[]>>;
  }
};