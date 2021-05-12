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
    public all(): object;
    public version(): object;
    public length(): object;
    public push(key: string, value: any): void;
    public math(key: string, operator: "+" | "-" | "*" | "/", value: number, goToNegative?: boolean): void;
    public delete(key: string): void;
    public includes(key: string): object;
    public startsWith(key: string): object;
    public endsWith(key: string): object;
    public type(key: string): "string" | "number" | "bigint" | "boolean" | "symbol" | "Array" | "undefined" | "object" | "Function";
    public deleteEach(key: string): void;
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
    public all(): object;
    public version(): object;
    public length(): object;
    public push(key: string, value: any): void;
    public math(key: string, operator: "+" | "-" | "*" | "/", value: number, goToNegative?: boolean): void;
    public delete(key: string): void;
    public includes(key: string): object;
    public startsWith(key: string): object;
    public endsWith(key: string): object;
    public deleteEach(key: string): void;
    public type(key: string): "string" | "number" | "bigint" | "boolean" | "symbol" | "Array" | "undefined" | "object" | "Function";
  }

  export class SqliteDatabase {
    constructor();
    private file: "json.sqlite";
    public set(key: string, value: any): void;
    public fetch(key: string): any;
    public get(key: string): any;
    public add(key: string, value: number): void;
    public subtract(key: string, value: number, goToNegative?: boolean): void;
    public has(key: string): boolean;
    public arrayHas(key: string): boolean;
    public fetchAll(): object;
    public all(): object;
    public deleteAll(): void;
    public version(): object;
    public length(): object;
    public deleteEach(key: string): void;
    public push(key: string, value: any): void;
    public delete(key: string): void;
    public includes(key: string): object;
    public startsWith(key: string): object;
    public math(key: string, operator: "+" | "-" | "*" | "/", value: number, goToNegative?: boolean): void;
    public endsWith(key: string): object;
    public type(key: string): "string" | "number" | "bigint" | "boolean" | "symbol" | "Array" | "undefined" | "object" | "Function";
    public import(file: string): void;
    public export(file: string): void;
  }
}