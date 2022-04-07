export interface TeamAssignModel {
  locationId: string;
  teams: string[];
}

export interface TeamAssignHierarchyRequest {
  hierarchy: TeamAssignModel[];
}
