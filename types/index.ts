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
    public arrayHasValue(key: string, value: any): boolean;
    public deleteAll(): void;
    public fetchAll(): Array<{ ID: string, data: any }>;
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
    public unpush(key: string, value: any): void;
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
    public arrayHasValue(key: string, value: any): boolean;
    public deleteAll(): void;
    public fetchAll(): Array<{ ID: string, data: any }>;
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
    public unpush(key: string, value: any): void;
  }
}