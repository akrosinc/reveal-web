import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Accordion, Col, FormCheck, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { getOrganizationCount, getUserList, searchOrganizationList } from '../api';
import { Code, OrganizationModel } from '../providers/types';
import Paginator from '../../../components/Pagination';
import { PAGINATION_DEFAULT_SIZE } from '../../../constants';
import { DebounceInput } from 'react-debounce-input';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../api/providers';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserModel } from '../../user/providers/types';
import { BaseTag, EntityTagResponse } from '../../planSimulation/providers/types';
import { Column } from 'react-table';
import TagAccessOrgUserExpandingTable from './TagAccessOrgUserExpandingTable';
import MetadataEntityTagTable2 from '../../../components/Table/MetadataEntityTagTable2';

export interface OrganizationModelAdapted {
  identifier: string;
  active: boolean;
  type: string;
  partOf: string;
  headOf: OrganizationModelAdapted[];
  name: string;
  userList: UserModel[];
  selectedAll?: boolean;
  selected?: boolean;
}

interface OrgUserList {
  [id: string]: UserModel[];
}

interface Props {
  metadata: BaseTag[];
  updatedMetadata: BaseTag[];
  setUpdatedMetadata: React.Dispatch<React.SetStateAction<BaseTag[]>>;
  addAccess: boolean;
}

const TagAccessOrganization = ({ metadata, updatedMetadata, setUpdatedMetadata, addAccess }: Props) => {
  const [organizationAdaptedList, setOrganizationAdaptedList] = useState<OrganizationModelAdapted[]>([]);
  const [organizationAdaptedListPaged, setOrganizationAdaptedListPaged] =
    useState<PageableModel<OrganizationModelAdapted>>();
  const [organizationCount, setOrganizationCount] = useState(0);
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState<OrganizationModelAdapted[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<OrganizationModelAdapted[]>([]);
  const [makePublic, setMakePublic] = useState<Boolean>(false);

  const { t } = useTranslation();
  const expandAll = useRef<HTMLSpanElement>();

  const addUserToHeadOf = useCallback((orgList: OrganizationModel[], orgUserList: OrgUserList) => {
    let newList: OrganizationModelAdapted[] = [];

    orgList?.forEach(org => {
      let orgAdapted: OrganizationModelAdapted = {
        userList: orgUserList[org.identifier],
        headOf: addUserToHeadOf(org.headOf, orgUserList),
        partOf: org.partOf,
        identifier: org.identifier,
        name: org.name,
        type: org.type.valueCodableConcept,
        active: org.active
      };

      newList.push(orgAdapted);
    });

    return newList;
  }, []);

  const columnsForMetadataTables = React.useMemo<Column<BaseTag>[]>(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          {
            return row.canExpand ? (
              <span
                {...row.getToggleRowExpandedProps({
                  style: {
                    // Use the row.depth property
                    // and paddingLeft to indicate the depth
                    // of the row
                    paddingLeft: `${row.depth}rem`,
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
            ) : null;
          }
      },
      { Header: 'tag', accessor: 'tag' },
      { Header: 'isPublic', accessor: 'public' },
      { Header: 'orgGrants' },
      { Header: 'userGrants' },
      { Header: addAccess ? 'resultingOrgGrants' : 'removeOrgGrants' },
      { Header: addAccess ? 'resultingUserGrants' : 'removeUserGrants' }
    ],
    [addAccess]
  );
  const columnsForMetadataTablesWithoutChildren = React.useMemo<Column<BaseTag>[]>(
    () => [
      { Header: 'tag', accessor: 'tag' },
      { Header: 'isPublic', accessor: 'public' },
      { Header: 'orgGrants' },
      { Header: 'userGrants' },
      { Header: addAccess ? 'resultingOrgGrants' : 'removeOrgGrants' },
      { Header: addAccess ? 'resultingUserGrants' : 'removeUserGrants' }
    ],
    [addAccess]
  );
  const getColumns = useCallback(() => {
    return updatedMetadata != null && updatedMetadata.length === 1 && !(updatedMetadata[0] instanceof EntityTagResponse)
      ? columnsForMetadataTablesWithoutChildren
      : columnsForMetadataTables;
  }, [updatedMetadata, columnsForMetadataTables, columnsForMetadataTablesWithoutChildren]);

  const loadData = useCallback(
    (size: number, page: number, searchData?: string, field?: string, sortDirection?: boolean) => {
      Promise.all([
        searchOrganizationList(size, page, searchData !== undefined ? searchData : '', field, sortDirection),
        getOrganizationCount(),
        getUserList(1000, 0, searchData !== undefined ? searchData : '', 'username')
      ])
        .then(async ([organizations, { count }, userModels]) => {
          let orgUserList: OrgUserList = {};
          userModels.content.forEach(user => {
            if (user.organizations.length > 0) {
              user.organizations.forEach((org: OrganizationModel) => {
                if (!orgUserList[org.identifier]) {
                  orgUserList[org.identifier] = [];
                }
                orgUserList[org.identifier].push(user);
              });
            } else {
              if (!orgUserList['unassigned']) {
                orgUserList['unassigned'] = [];
              }
              orgUserList['unassigned'].push(user);
            }
          });

          let orgListAmended: OrganizationModel[] = [
            ...organizations.content,
            {
              active: true,
              headOf: [],
              type: {
                code: Code.Team,
                valueCodableConcept: 'Users'
              },
              name: 'Unassigned Users',
              identifier: 'unassigned',
              partOf: 'unassigned'
            }
          ];
          let orgListAdapted: OrganizationModelAdapted[] = orgListAmended.map(org => {
            return {
              active: org.active,
              headOf: addUserToHeadOf(org.headOf, orgUserList),
              type: org.type.valueCodableConcept,
              name: org.name,
              identifier: org.identifier,
              partOf: org.partOf,
              userList: orgUserList[org.identifier]
            };
          });

          setOrganizationAdaptedList(orgListAdapted);

          setOrganizationAdaptedListPaged({
            empty: organizations.empty,
            totalElements: organizations.totalElements,
            totalPages: organizations.totalPages,
            size: organizations.size,
            number: organizations.number,
            sort: organizations.sort,
            numberOfElements: organizations.numberOfElements,
            last: organizations.last,
            first: organizations.first,
            pageable: organizations.pageable,
            content: orgListAdapted
          });

          if (searchData !== undefined && searchData.length) {
            setOrganizationCount(organizations.numberOfElements);
            expandAll?.current?.click();
          } else {
            setOrganizationCount(count);
          }
        })
        .catch(err => toast.error(err));
    },
    [addUserToHeadOf]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const paginatonHandler = (size: number, page: number) => {
    loadData(size, page, currentSearchInput, currentSortField, currentSortDirection);
  };

  const filterData = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchInput(e.target.value);
    loadData(organizationAdaptedListPaged?.pageable.pageSize ?? PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };

  const sortHandler = (field: string, sortDirection: boolean) => {
    if (organizationAdaptedListPaged !== undefined) {
      setCurrentSortField(field);
      setCurrentSortDirection(sortDirection);
      loadData(organizationAdaptedListPaged.size, 0, currentSearchInput, field, sortDirection);
    }
  };

  useEffect(() => {
    let uniqueOrgs: { [id: string]: OrganizationModelAdapted } = {};
    selectedOrganizations.forEach(org => {
      uniqueOrgs[org.identifier] = org;
    });

    const resultingOrgs = Object.keys(uniqueOrgs).map(key => {
      return {
        name: uniqueOrgs[key].name,
        id: uniqueOrgs[key].identifier
      };
    });

    setUpdatedMetadata((updatedMetadata: BaseTag[]) => {
      let newMeta = [...updatedMetadata];
      newMeta.forEach(meta => {
        if (meta instanceof EntityTagResponse) {
          meta.children?.forEach(child => {
            child.resultingOrgs = resultingOrgs;
          });
        }
        meta.resultingOrgs = resultingOrgs;
      });
      return newMeta;
    });
  }, [selectedOrganizations, metadata, setUpdatedMetadata]);

  useEffect(() => {
    let uniqueOrgs: { [id: string]: OrganizationModelAdapted } = {};
    selectedUsers.forEach(org => {
      uniqueOrgs[org.identifier] = org;
    });

    const resultingOrgs = Object.keys(uniqueOrgs).map(key => {
      return {
        username: uniqueOrgs[key].name,
        id: uniqueOrgs[key].identifier
      };
    });

    setUpdatedMetadata((updatedMetadata: BaseTag[]) => {
      let newMeta = [...updatedMetadata];
      newMeta.forEach(meta => {
        if (meta instanceof EntityTagResponse) {
          meta.children?.forEach(child => {
            child.resultingUsers = resultingOrgs;
          });
        }
        meta.resultingUsers = resultingOrgs;
      });
      return newMeta;
    });
  }, [selectedUsers, metadata, addUserToHeadOf, setUpdatedMetadata]);

  useEffect(() => {
    setUpdatedMetadata((updatedMetadata: BaseTag[]) => {
      let newMeta = [...updatedMetadata];
      newMeta.forEach(meta => {
        if (meta instanceof EntityTagResponse) {
          meta.children?.forEach(child => {
            child.public = makePublic.valueOf();
          });
        }
        meta.public = makePublic.valueOf();
      });
      return newMeta;
    });
  }, [makePublic, metadata, setUpdatedMetadata]);

  return (
    <>
      <FormCheck
        label={addAccess ? 'Public Access' : 'Make Private'}
        onChange={evt => {
          // setUpdatedMetadata([]);
          setSelectedOrganizations([]);
          setSelectedUsers([]);
          setMakePublic(addAccess ? evt.currentTarget.checked : !evt.currentTarget.checked);
          loadData(PAGINATION_DEFAULT_SIZE, 0);
        }}
      />
      <hr className="my-4" />
      <h5>
        {t('organizationPage.organization')} ({organizationCount})
      </h5>
      <Row className="my-4">
        <Col md={8} className="mb-2"></Col>
        <Col sm={12} md={4} className="order-md-first">
          Search:
          <DebounceInput
            id="search-organizatins-input"
            className="form-control"
            placeholder={t('organizationPage.search') + ' (min 3 charaters)'}
            debounceTimeout={800}
            onChange={e => filterData(e)}
            disabled={organizationCount === 0 && currentSearchInput === ''}
          />
        </Col>
        <Col sm={12} md={4} className="order-md-first"></Col>
        <Col sm={12} md={4} className="order-md-first">
          {/*<div style={{ float: 'right' }}>*/}
          {/*  Select All{' '}*/}
          {/*  <FormCheck*/}
          {/*    checked={makePublic.valueOf()}*/}
          {/*    onChange={evt => {*/}
          {/*      setMakePublic(evt.currentTarget.checked);*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</div>*/}
        </Col>
      </Row>

      {organizationAdaptedListPaged !== undefined && organizationAdaptedListPaged.content.length > 0 ? (
        <>
          <TagAccessOrgUserExpandingTable
            data={organizationAdaptedList}
            sortHandler={sortHandler}
            setOrganizationAdaptedList={setOrganizationAdaptedList}
            setSelectedOrganizations={setSelectedOrganizations}
            setSelectedUsers={setSelectedUsers}
            makePublic={makePublic}
          />
          <Paginator
            totalPages={organizationAdaptedListPaged.totalPages}
            totalElements={organizationAdaptedListPaged.totalElements}
            page={organizationAdaptedListPaged.pageable.pageNumber}
            size={organizationAdaptedListPaged.size}
            paginationHandler={paginatonHandler}
          />
        </>
      ) : (
        <p className="text-center lead">No organizations found.</p>
      )}

      <Accordion className={'p-2'} defaultActiveKey="0">
        <Accordion.Item eventKey={'0'}>
          <Accordion.Header>
            {metadata !== undefined && metadata.length > 0
              ? 'Current Access Grants: (' + metadata.length + ')'
              : undefined}

            <OverlayTrigger placement="top" overlay={<Tooltip id="button-tooltip">Current Access Grants</Tooltip>}>
              <div className={'mx-1'}>
                <FontAwesomeIcon icon="info-circle" />
              </div>
            </OverlayTrigger>
          </Accordion.Header>
          <Accordion.Body>
            <MetadataEntityTagTable2
              data={
                updatedMetadata != null && updatedMetadata.length === 1
                  ? updatedMetadata
                  : updatedMetadata?.filter(meta => meta instanceof EntityTagResponse && !meta.aggregate)
              }
              setMetadataList={() => {}}
              metadataList={[]}
              columns={getColumns()}
              addAccess={addAccess}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

export default TagAccessOrganization;
