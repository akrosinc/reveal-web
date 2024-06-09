import React, { useRef } from 'react';
import { Table, FormCheck, Col, Row as ReactRow } from 'react-bootstrap';
import { useTable, useExpanded, Column, Row } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ROW_DEPTH_COLOR_1,
  ROW_DEPTH_COLOR_2,
  ROW_DEPTH_COLOR_3,
  USER_ROW_DEPTH_COLOR_1,
  USER_ROW_DEPTH_COLOR_2,
  USER_ROW_DEPTH_COLOR_3
} from '../../../constants';
import { useAppSelector } from '../../../store/hooks';
import { useTranslation } from 'react-i18next';
import { UserModel } from '../../user/providers/types';
import { OrganizationModelAdapted } from './TagAccessOrganization';

interface Props {
  data: OrganizationModelAdapted[];
  sortHandler: (field: string, direction: boolean) => void;
  setOrganizationAdaptedList: (list: OrganizationModelAdapted[]) => void;
  setSelectedOrganizations: React.Dispatch<React.SetStateAction<OrganizationModelAdapted[]>>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<OrganizationModelAdapted[]>>;
  makePublic: Boolean;
}

const TagAccessOrgUserExpandingTable = ({
  data,
  sortHandler,
  setOrganizationAdaptedList,
  setSelectedOrganizations,
  setSelectedUsers,
  makePublic
}: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const expandAll = useRef<HTMLSpanElement>();
  const { t } = useTranslation();

  const getColorLevelFromRow = (row: Row<OrganizationModelAdapted>) => {
    const objectCell = row.cells.find((cell: any) => {
      const cellData = cell.row.original as any;
      return cellData.type === 'user';
    });
    const depth = (row as any).depth;
    if (objectCell) {
      if (depth === 0) {
        return '';
      } else if (depth === 1) {
        return USER_ROW_DEPTH_COLOR_1;
      } else if (depth === 2) {
        return USER_ROW_DEPTH_COLOR_2;
      } else {
        return USER_ROW_DEPTH_COLOR_3;
      }
    } else {
      if (depth === 0) {
        return '';
      } else if (depth === 1) {
        return ROW_DEPTH_COLOR_1;
      } else if (depth === 2) {
        return ROW_DEPTH_COLOR_2;
      } else {
        return ROW_DEPTH_COLOR_3;
      }
    }
  };

  const mapRows = (row: any): OrganizationModelAdapted[] => {
    if (row.headOf !== undefined && row.headOf.length > 0) {
      let orgRows = row.headOf.map((el: any) => {
        return {
          name: el.name,
          identifier: el.identifier,
          active: el.active.toString(),
          headOf: el.headOf,
          type: el.type,
          userList: el.userList,
          selected: el.selected,
          selectedAll: el.selectedAll
        };
      });

      row.userList?.forEach((userItem: UserModel) => {
        orgRows.unshift({
          name: userItem.username,
          identifier: userItem.sid,
          active: true,
          headOf: undefined,
          type: 'User',
          selectedAll: userItem.selectedAll
        });
      });

      return orgRows;
    } else if (row.userList !== undefined) {
      return row.userList.map((el: any) => {
        return {
          identifier: el.sid,
          name: el.username,
          type: 'User',
          selectedAll: el.selectedAll
        };
      });
    } else {
      return [];
    }
  };

  const columns = React.useMemo<Column<OrganizationModelAdapted>[]>(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Header: ({ getToggleAllRowsExpandedProps }: { getToggleAllRowsExpandedProps: Function }) => (
          <span {...getToggleAllRowsExpandedProps()} ref={expandAll}></span>
        ),
        Cell: ({ row }: { row: any }) =>
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // We can even use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth * 1.5}rem`,
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  paddingRight: '15px'
                }
              })}
            >
              {row.isExpanded ? (
                <FontAwesomeIcon className="ms-1" icon="chevron-down" />
              ) : (
                <FontAwesomeIcon className="ms-1" icon="chevron-right" />
              )}
            </span>
          ) : (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  paddingLeft: `${row.depth * 1.5}rem`,
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  paddingRight: '15px'
                }
              })}
            >
              {row.depth > 0 ? '-' : null}
            </span>
          )
      },
      { Header: 'name', accessor: 'name' },
      { Header: 'type', accessor: 'type' },
      { Header: 'select' }
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<OrganizationModelAdapted>(
    {
      columns,
      data,
      getSubRows: (row: OrganizationModelAdapted) => mapRows(row),
      autoResetExpanded: false
    },
    useExpanded // Use the useExpanded plugin hook
  );

  const checkColumn = (column?: Column<object>) => {
    if (column) {
      if (
        typeof column.Header !== 'function' &&
        column.Header !== null &&
        column.Header !== undefined &&
        column.Header.toString() !== ''
      ) {
        return true;
      }
    }
    return false;
  };

  const setChildrenSelected = (
    evt: React.ChangeEvent<HTMLInputElement>,
    identifier: string,
    org: OrganizationModelAdapted,
    val: { [key: string]: boolean },
    arr: OrganizationModelAdapted[]
  ): OrganizationModelAdapted => {
    val[org.identifier] = evt.currentTarget.checked;
    if (evt.currentTarget.checked) {
      arr.push(org);
    }

    return {
      identifier: org.identifier,
      active: org.active,
      type: org.type,
      partOf: org.partOf,
      headOf: org.headOf.map(orgChild => setChildrenSelected(evt, orgChild.identifier, orgChild, val, arr)),
      name: org.name,
      userList: org.userList,
      selected: org.selected,
      selectedAll: evt.currentTarget.checked
    };
  };

  const setChildrenSelectedDe = (
    evt: React.ChangeEvent<HTMLInputElement>,
    identifier: string,
    org: OrganizationModelAdapted
  ): OrganizationModelAdapted => {
    return {
      identifier: org.identifier,
      active: org.active,
      type: org.type,
      partOf: org.partOf,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      headOf: org.headOf.map(orgChild => setChildrenSelectedDe(evt, orgChild.identifier, orgChild)),
      name: org.name,
      userList: org.userList,
      selected: org.selected,
      selectedAll: false
    };
  };

  const setSelectedIncludingChildren = (
    evt: React.ChangeEvent<HTMLInputElement>,
    orgPassed: OrganizationModelAdapted
  ) => {
    let val: { [key: string]: boolean } = {};
    let arr: OrganizationModelAdapted[] = [];

    val[orgPassed.identifier] = evt.currentTarget.checked;

    if (evt.currentTarget.checked) {
      arr.push(orgPassed);
    }

    let updatedOrg = {
      identifier: orgPassed.identifier,
      active: orgPassed.active,
      type: orgPassed.type,
      partOf: orgPassed.partOf,
      headOf: orgPassed.headOf.map(orgChild => setChildrenSelected(evt, orgPassed.identifier, orgChild, val, arr)),
      name: orgPassed.name,
      userList: orgPassed.userList,
      selected: evt.currentTarget.checked ? false : orgPassed.selected,
      selectedAll: evt.currentTarget.checked
    };

    setSelectedOrganizations(selOrgList => {
      let newOrgList = [];

      let keys = Object.keys(val);

      selOrgList.forEach(existingOrgItem => {
        if (val[existingOrgItem.identifier]) {
          newOrgList.push(existingOrgItem);
        } else if (!keys.includes(existingOrgItem.identifier)) {
          newOrgList.push(existingOrgItem);
        }
      });
      newOrgList.push(...arr);
      return newOrgList;
    });

    let updatedOrgList = setOrgRecursive(updatedOrg, data);

    setOrganizationAdaptedList(updatedOrgList);
  };

  const setSelectedUserItem = (evt: React.ChangeEvent<HTMLInputElement>, userPassed: OrganizationModelAdapted) => {
    setSelectedUsers(orgList => {
      let newOrgList = [];
      orgList.forEach(org => {
        if (org.identifier !== userPassed.identifier) {
          newOrgList.push(org);
        }
      });
      if (evt.currentTarget.checked) {
        newOrgList.push(userPassed);
      }
      return newOrgList;
    });

    let updatedOrg = {
      identifier: userPassed.identifier,
      active: userPassed.active,
      type: userPassed.type,
      partOf: userPassed.partOf,
      headOf: userPassed.headOf,
      name: userPassed.name,
      userList: userPassed.userList,
      selectedAll: evt.currentTarget.checked
    };

    let updatedOrgList = setUserRecursive(updatedOrg, data);

    setOrganizationAdaptedList(updatedOrgList);
  };

  const setOrgRecursive = (
    updatedOrg: OrganizationModelAdapted,
    orgList: OrganizationModelAdapted[]
  ): OrganizationModelAdapted[] => {
    return orgList.map(org => {
      if (org.identifier === updatedOrg.identifier) {
        return {
          identifier: updatedOrg.identifier,
          active: updatedOrg.active,
          type: updatedOrg.type,
          partOf: updatedOrg.partOf,
          headOf: setOrgRecursive(updatedOrg, updatedOrg.headOf),
          name: updatedOrg.name,
          userList: updatedOrg.userList,
          selected: updatedOrg.selected,
          selectedAll: updatedOrg.selectedAll
        };
      } else {
        return {
          identifier: org.identifier,
          active: org.active,
          type: org.type,
          partOf: org.partOf,
          headOf: setOrgRecursive(updatedOrg, org.headOf),
          name: org.name,
          userList: org.userList,
          selected: org.selected,
          selectedAll: org.selectedAll
        };
      }
    });
  };

  const setUserRecursive = (
    updatedOrg: OrganizationModelAdapted,
    orgList: OrganizationModelAdapted[]
  ): OrganizationModelAdapted[] => {
    return orgList?.map(org => {
      let newUserList: UserModel[] = [];
      org.userList?.forEach(user => {
        let selectAll = undefined;
        if (user.sid === updatedOrg.identifier) {
          selectAll = updatedOrg.selectedAll;
        } else {
          selectAll = user.selectedAll;
        }

        newUserList.push({
          selectedAll: selectAll,
          identifier: user.identifier,
          sid: user.sid,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizations: user.organizations,
          password: user.password,
          securityGroups: user.securityGroups,
          tempPassword: user.tempPassword
        });
      });

      return {
        identifier: org.identifier,
        active: org.active,
        type: org.type,
        partOf: org.partOf,
        headOf: org.headOf && org.headOf.length > 0 ? setUserRecursive(updatedOrg, org.headOf) : [],
        name: org.name,
        userList: newUserList,
        selected: org.selected,
        selectedAll: org.selectedAll
      };
    });
  };

  return (
    <>
      <Table bordered responsive hover {...getTableProps()} variant={isDarkMode ? 'dark' : 'white'}>
        <thead className="border border-2">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {checkColumn(column)
                    ? t('reportPage.table.' + column.Header?.toString(), column.Header?.toString())
                    : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              //row.depth is not existing in react table types for some reason, casting to any type solves the issue
              <tr {...row.getRowProps()} style={{ backgroundColor: getColorLevelFromRow(row) }}>
                {row.cells.map(cell => {
                  const cellData = cell.row.original as any;
                  if (cell.column.id === 'select' && cell.row.original.identifier !== 'unassigned') {
                    return (
                      <td>
                        <ReactRow>
                          <Col>
                            <FormCheck
                              label={cellData['type'] === 'User' ? 'Select Item' : 'Select All Including Children'}
                              checked={cell.row.original.selectedAll}
                              disabled={makePublic.valueOf()}
                              onChange={evt => {
                                if (cellData['type'] !== 'User') {
                                  setSelectedIncludingChildren(evt, row.original);
                                } else {
                                  setSelectedUserItem(evt, row.original);
                                }
                              }}
                            />
                          </Col>
                        </ReactRow>
                      </td>
                    );
                  } else {
                    return (
                      <td id={cell.column.id + 'click-handler'} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    );
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export default TagAccessOrgUserExpandingTable;
