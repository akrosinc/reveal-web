export interface UserModel {
  identifier: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  tempPassword?: boolean;
  organization: string[];
  securityGroups: string[];
}

export interface PageableUserModel {
  content:          UserModel[];
  pageable:         Pageable;
  last:             boolean;
  totalPages:       number;
  totalElements:    number;
  number:           number;
  size:             number;
  sort:             Sort;
  first:            boolean;
  numberOfElements: number;
  empty:            boolean;
}

export interface Pageable {
  sort:       Sort;
  offset:     number;
  pageNumber: number;
  pageSize:   number;
  unpaged:    boolean;
  paged:      boolean;
}

export interface Sort {
  empty:    boolean;
  sorted:   boolean;
  unsorted: boolean;
}