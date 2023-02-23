export interface GeneralDbRequest {
    command: GeneralDbCommandType;
    connection_id?: string;
    connection_def_name?: string;
    label?: string;
    sql?: string;
    needs_column_resolve?: boolean;
    options?: any;
}

export enum GeneralDbCommandType {
    CountTables = 'CountTables',
    ListByParams = 'ListByParams',
    ListProposals = 'ListProposals',
    ExecuteSql = 'ExecuteSql',
    TestConnection = 'TestConnection',
    ToggleConnection = 'ToggleConnection',
    BatchInsertFromArray = 'BatchInsertFromArray'
}

