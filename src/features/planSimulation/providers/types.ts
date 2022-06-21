export interface EntityTags {
    identifier: string,
    tag: string,
    valueType: string,
    lookupEntityType: LookupEntityType
}

export interface LookupEntityType {
        identifier: string,
        code: string,
        tableName: string
}