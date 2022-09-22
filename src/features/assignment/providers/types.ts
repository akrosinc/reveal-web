export interface TeamAssignModel {
  locationId: string;
  teams: string[];
}

export interface TeamAssignHierarchyRequest {
  hierarchy: TeamAssignModel[];
}

export interface LocationAssignmentRequest {
  organizationIdentifier: string;
  locationIdentifiers: string[];
}
