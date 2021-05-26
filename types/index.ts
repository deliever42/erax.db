declare module "erax.db" {
  export class JsonDatabase {
    constructor(dbPath?: string);
    private dbPath: string;
    public set(key: string, value: any): void;
    public fetch(key: string): any;
    public get(key: string): any;
    public destroy(): void;
    public add(key: string, value: number): void;
    public subtract(key: string, value: number, goToNegative?: boolean): void;
    public has(key: string): boolean;
    public arrayHas(key: string): boolean;
    public deleteAll(): void;
    public fetchAll(): object;
    public all(): Array<{ ID: string, data: any }>;
    public size(): object;
    public length(): object;
    public push(key: string, value: any): void;
    public math(key: string, operator: "+" | "-" | "*" | "/", value: number, goToNegative?: boolean): void;
    public delete(key: string): void;
    public includes(key: string): Array<{ ID: string, data: any }>;
    public startsWith(key: string): Array<{ ID: string, data: any }>;
    public endsWith(key: string): Array<{ ID: string, data: any }>;
    public deleteEach(key: string): void;
    public type(key: string): "array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint";
  }

  export class YamlDatabase {
    constructor(dbPath?: string);
    private dbPath: string;
    public set(key: string, value: any): void;
    public fetch(key: string): any;
    public get(key: string): any;
    public destroy(): void;
    public add(key: string, value: number): void;
    public subtract(key: string, value: number, goToNegative?: boolean): void;
    public has(key: string): boolean;
    public arrayHas(key: string): boolean;
    public deleteAll(): void;
    public fetchAll(): object;
    public all(): Array<{ ID: string, data: any }>;
    public size(): object;
    public length(): object;
    public push(key: string, value: any): void;
    public math(key: string, operator: "+" | "-" | "*" | "/", value: number, goToNegative?: boolean): void;
    public delete(key: string): void;
    public includes(key: string): Array<{ ID: string, data: any }>;
    public startsWith(key: string): Array<{ ID: string, data: any }>;
    public endsWith(key: string): Array<{ ID: string, data: any }>;
    public deleteEach(key: string): void;
    public type(key: string): "array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint";
  }

  export class SqliteDatabase {
    constructor();
    public set(key: string, value: any): void;
    public fetch(key: string): any;
    public get(key: string): any;
    public add(key: string, value: number): void;
    public subtract(key: string, value: number, goToNegative?: boolean): void;
    public has(key: string): boolean;
    public arrayHas(key: string): boolean;
    public fetchAll(): object;
    public all(): Array<{ ID: string, data: any }>;
    public deleteAll(): void;
    public size(): object;
    public length(): object;
    public deleteEach(key: string): void;
    public push(key: string, value: any): void;
    public delete(key: string): void;
    public includes(key: string): Array<{ ID: string, data: any }>;
    public startsWith(key: string): Array<{ ID: string, data: any }>;
    public math(key: string, operator: "+" | "-" | "*" | "/", value: number, goToNegative?: boolean): void;
    public endsWith(key: string): Array<{ ID: string, data: any }>;
    public type(key: string): "array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint";
    public import(file: string): void;
    public export(file: string): void;
  }
}