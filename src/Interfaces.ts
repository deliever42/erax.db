export interface BaseFetchOptions {
    force?: boolean;
    cache?: boolean;
}

export interface BasePushOptions {
    returnIfExists?: boolean;
}

export interface BaseDeleteEachOptions {
    maxDeletedSize?: number;
}

export interface BaseMathOptions {
    goToNegative?: boolean;
}

export interface Schema<V> {
    ID: string;
    data: V;
}

export type Operators = '+' | '-' | '*' | '**' | '/' | '%';
