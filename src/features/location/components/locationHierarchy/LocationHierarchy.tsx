import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { LOCATION_HIERARCHY_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import { deleteLocationHierarchy, getGeographicLevelList, getLocationHierarchyList } from '../../api';
import { ActionDialog, ConfirmDialog } from '../../../../components/Dialogs';
import CreateLocationHierarchy from './create/CreateLocationHierarchy';
import { PageableModel } from '../../../../api/providers';
import { LocationHierarchyModel } from '../../providers/types';
import { useAppSelector } from '../../../../store/hooks';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Paginator from '../../../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Options {
  value: string;
  label: string;
}

const LocationHierarchy = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [geographyLevelList, setGeographyLevelList] = useState<Options[]>();
  const [locationHierarchy, setLocationHierarchy] = useState<PageableModel<LocationHierarchyModel>>();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedHierarchy, setSelectedHierarchy] = useState<LocationHierarchyModel>();
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  useEffect(() => {
    getLocationHierarchyList(PAGINATION_DEFAULT_SIZE, 0, true)
      .then(res => {
        setLocationHierarchy(res);
      })
      .catch(err => toast.error(err));
  }, []);

  const createHandler = () => {
    getGeographicLevelList(50, 0).then(res => {
      const options: Options[] = res.content.map(el => {
        return {
          label: el.title,
          value: el.name
        };
      });

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
            render() {
              closeHandler();
              return 'Deleted successfully!';
            }
          },
          error: {
            render({ data: err }: { data: string }) {
              setShowConfirm(false);
              return err;
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

    getLocationHierarchyList(
      locationHierarchy?.size ?? PAGINATION_DEFAULT_SIZE,
      locationHierarchy?.pageable.pageNumber ?? 0,
      true
    ).then(res => {
      setLocationHierarchy(res);
    });
  };

  const paginationHandler = (size: number, page: number) => {
    getLocationHierarchyList(size, page, true)
      .then(res => {
        setLocationHierarchy(res);
      })
      .catch(err => toast.error(err));
  };

  return (
    <>
      <Row>
        <Col>
          <h2 className="m-0">
            {t('locationsPage.locationHierarchy')} ({locationHierarchy?.totalElements ?? 0})
          </h2>
        </Col>
        <Col>
          <Button id="create-button" className="float-end" onClick={createHandler}>
            {t('buttons.create')}
          </Button>
        </Col>
      </Row>
      <hr className="my-4" />
      {locationHierarchy !== undefined && locationHierarchy.content.length > 0 ? (
        <>
          <Table bordered responsive hover variant={isDarkMode ? 'dark' : 'white'}>
            <thead className="border border-2">
              <tr>
                {LOCATION_HIERARCHY_TABLE_COLUMNS.map((el, index) => {
                  return (
                    <th style={{ cursor: 'default' }} key={index}>
                      {t('locationHierarchyPage.' + el.name)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {locationHierarchy.content.map(el => {
                return (
                  <tr key={el.identifier}>
                    <td>{el.name}</td>
                    <td>
                      {el.nodeOrder.toString()}{' '}
                      <Button
                        id="delete-button"
                        variant="secondary"
                        onClick={() => {
                          if (el.identifier) {
                            setSelectedHierarchy(el);
                            setShowConfirm(true);
                          }
                        }}
                        className="float-end"
                      >
                        <FontAwesomeIcon className="m-0" icon="trash" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Paginator
            page={locationHierarchy.pageable.pageNumber}
            paginationHandler={paginationHandler}
            size={locationHierarchy.pageable.pageSize}
            totalElements={locationHierarchy.totalElements}
            totalPages={locationHierarchy.totalPages}
          />
        </>
      ) : (
        <p className="text-center lead">{t('general.noContent')}</p>
      )}

      {showCreate && (
        <ActionDialog
          title="Create Location Hierarchy"
          element={
            <CreateLocationHierarchy geographyLevelList={geographyLevelList ?? []} closeHandler={closeHandler} />
          }
          closeHandler={closeHandler}
        />
      )}
      {showConfirm && (
        <ConfirmDialog
          closeHandler={deleteHandler}
          message={'Are you sure you want to permanently delete hierarchy: ' + selectedHierarchy?.nodeOrder.toString()}
          title="Delete hierarchy"
          backdrop
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default LocationHierarchy;
