export interface GeographicLevel {
  identifier: string;
  title: string;
  name: string;
}

export interface LocationHierarchyModel {
  identifier?: string;
  nodeOrder: string[];
}
