declare module "erax.db" {
  export class JsonDatabase {
    constructor(file?: string);
    private file: string;
    public set(data: string, value: any): void;
    public fetch(data: string): any;
    public get(data: string): any;
    public destroy(): object;
    public add(data: string, value: number): void;
    public subtract(data: string, value: number): void;
    public has(data: string): boolean;
    public arrayHas(data: string): boolean;
    public deleteAll(): void;
    public fetchAll(): object;
    public all(): object;
    public version(): object;
    public length(): object;
    public push(data: string, value: any): void;
    public math(data: string, operator: string, value: number): void;
    public delete(data: string): void;
    public includes(data: string): object;
    public startsWith(data: string): object;
    public endsWith(data: string): object;
  }

  export class YamlDatabase {
    constructor(file?: string);
    private file: string;
    public set(data: string, value: any): void;
    public fetch(data: string): any;
    public get(data: string): any;
    public destroy(): object;
    public version(): object;
    public add(data: string, value: number): void;
    public subtract(data: string, value: number): void;
    public has(data: string): boolean;
    public arrayHas(data: string): boolean;
    public deleteAll(): void;
    public fetchAll(): object;
    public all(): object;
    public length(): object;
    public push(data: string, value: any): void;
    public math(data: string, operator: string, value: number): void;
    public delete(data: string): void;
    public includes(data: string): object;
    public startsWith(data: string): object;
    public endsWith(data: string): object;
  }
}