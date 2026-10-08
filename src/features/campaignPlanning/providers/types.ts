export interface HierarchyNodeProperties {
  name: string;
  geographicLevel: string;
  parentIdentifier: string;
  childrenNumber: number;
}

export interface HierarchyNode {
  identifier: string;
  properties: HierarchyNodeProperties;
  children?: HierarchyNode[];
}

export interface InstanceHierarchy {
  identifier: string;
  name: string;
  nodeOrder: string[];
  geoTree: HierarchyNode[];
}

export interface InstanceDataset {
  identifier: string;
  name: string;
}

export interface TeamMember {
  identifier: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Team {
  identifier: string;
  name: string;
  active: boolean;
  members: TeamMember[];
}
