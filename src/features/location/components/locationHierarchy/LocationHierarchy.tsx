import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LOCATION_HIERARCHY_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import { deleteLocationHierarchy, getGeographicLevelList, getLocationHierarchyList } from '../../api';
import { ActionDialog, ConfirmDialog } from '../../../../components/Dialogs';
import CreateLocationHierarchy from './create/CreateLocationHierarchy';
import { ErrorModel, PageableModel } from '../../../../api/providers';
import { LocationHierarchyModel } from '../../providers/types';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import { toast } from 'react-toastify';

interface Options {
  value: string;
  label: string;
}

const LocationHierarchy = () => {
  const [activeSortField, setActiveSortField] = useState('');
  const [sortDirection, setSortDirection] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [geographyLevelList, setGeographyLevelList] = useState<Options[]>();
  const [locationHierarchy, setLocationHierarchy] = useState<PageableModel<LocationHierarchyModel>>();
  const dispatch = useAppDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedHierarchy, setSelectedHierarchy] = useState<LocationHierarchyModel>();

  useEffect(() => {
    dispatch(showLoader(true));
    getLocationHierarchyList(10, 0, true).then(res => {
      setLocationHierarchy(res);
      dispatch(showLoader(false));
    });
  }, [dispatch]);

  const createHandler = () => {
    dispatch(showLoader(true));
    getGeographicLevelList(50, 0).then(res => {
      const options: Options[] = res.content.map(el => {
        return {
          label: el.title,
          value: el.name
        };
      });
      dispatch(showLoader(false));
      setGeographyLevelList(options);
      setShowCreate(true);
    });
  };

  const deleteHandler = (action: boolean) => {
    if (action) {
      if (selectedHierarchy !== undefined && selectedHierarchy.identifier !== undefined) {
        toast.promise(deleteLocationHierarchy(selectedHierarchy.identifier), {
          pending: 'Loading...',
          success: {
            render({ data }: any) {
              closeHandler();
              return 'Deleted successfully!';
            }
          },
          error: {
            render({ data }: { data: ErrorModel }) {
              setShowConfirm(false);
              return data.message !== undefined ? data.message : 'An error has occured!';
            }
          }
        });
      }
    } else {
      setShowConfirm(false);
    }
  };

  const closeHandler = () => {
    setShowConfirm(false);
    setShowCreate(false);
    dispatch(showLoader(true));
    getLocationHierarchyList(
      locationHierarchy?.size ?? PAGINATION_DEFAULT_SIZE,
      locationHierarchy?.pageable.pageNumber ?? 0,
      true
    ).then(res => {
      setLocationHierarchy(res);
      dispatch(showLoader(false));
    });
  };

  const sortHandler = (sortValue: string, sortDirection: boolean) => {
    dispatch(showLoader(true));
    getLocationHierarchyList(locationHierarchy?.size ?? PAGINATION_DEFAULT_SIZE, 0, true).then(res => {
      setLocationHierarchy(res);
      dispatch(showLoader(false));
    });
  };

  return (
    <>
      <Row>
        <Col>
          <h2 className="m-0">Location Hierarchy ({locationHierarchy?.totalElements ?? 0})</h2>
        </Col>
        <Col>
          <Button className="float-end" onClick={createHandler}>
            Create
          </Button>
        </Col>
      </Row>
      <hr className="my-4" />
      {locationHierarchy !== undefined && locationHierarchy.content.length > 0 ? (
        <Table bordered responsive hover>
          <thead className="border border-2">
            <tr>
              {LOCATION_HIERARCHY_TABLE_COLUMNS.map((el, index) => {
                return (
                  <th
                    style={{ cursor: 'pointer' }}
                    key={index}
                    onClick={() => {
                      setSortDirection(!sortDirection);
                      setActiveSortField(el.name);
                      sortHandler(el.sortValue, sortDirection);
                    }}
                  >
                    {el.name}
                    {activeSortField === el.name ? (
                      sortDirection ? (
                        <FontAwesomeIcon className="float-end mt-1" icon="sort-up" />
                      ) : (
                        <FontAwesomeIcon className="float-end mt-1" icon="sort-down" />
                      )
                    ) : (
                      <FontAwesomeIcon className="float-end mt-1" icon="sort" />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {locationHierarchy.content.map(el => {
              return (
                <tr key={el.identifier}>
                  <td>
                    {el.nodeOrder.toString()}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (el.identifier) {
                          setSelectedHierarchy(el);
                          setShowConfirm(true);
                        }
                      }}
                      className="float-end"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p className="text-center lead">No content found.</p>
      )}

      {showCreate && (
        <ActionDialog
          title="Create Location Hierarchy"
          element={
            <CreateLocationHierarchy geographyLevelList={geographyLevelList ?? []} closeHandler={closeHandler} />
          }
          closeHandler={closeHandler}
          backdrop
        />
      )}
      {showConfirm && (
        <ConfirmDialog
          closeHandler={deleteHandler}
          message={'Are you sure you want to permanently delete hierarchy: ' + selectedHierarchy?.nodeOrder.toString()}
          title="Delete hierarchy"
          backdrop={true}
        />
      )}
    </>
  );
};

export default LocationHierarchy;
