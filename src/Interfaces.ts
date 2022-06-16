export interface BaseFetchOptions {
    force?: boolean;
    cache?: boolean;
}

export interface BasePushOptions {
    returnIfExists?: boolean;
}

export interface BaseMathOptions {
    goToNegative?: boolean;
}

export interface BaseBackupOptions {
    enabled: boolean;
    backupInterval?: number;
    filePath?: string;
}

export interface Schema<V> {
    ID: string;
    data: V;
}

export type Operators = '+' | '-' | '*' | '**' | '/' | '%';
