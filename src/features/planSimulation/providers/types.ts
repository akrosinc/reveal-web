export interface EntityTag {
  identifier: string;
  tag: string;
  valueType: string;
  lookupEntityType: LookupEntityType;
  more: EntityTag[];
  range?: [EntityTag, EntityTag];
}

export interface LookupEntityType {
  identifier: string;
  code: string;
  tableName: string;
}
