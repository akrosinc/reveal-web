import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { LOCATION_HIERARCHY_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import { deleteLocationHierarchy, getGeographicLevelList, getLocationHierarchyList, getLocationHierarchyBase, LocationHierarchyBaseResponse, activateLocationHierarchy } from '../../api';
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
  const [baseHierarchy,setBaseHierarchy]= useState<LocationHierarchyBaseResponse | null>(null)
  const [baseHierarchyFound,setBaseHierarchyFound] = useState<boolean>(false)
  const [loadingForBaseHierarchy,setLoadingForBaseHierarchy]=useState<boolean>(true)
  const [isBase, setIsBase] = useState<boolean>(false);
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

    getLocationHierarchyBase()
      .then(res => {
        setBaseHierarchyFound(true);
        setBaseHierarchy(res);
      })
      .catch(err =>
        {
          if(err?.statusCode === 404){
            setBaseHierarchyFound(false);
            setBaseHierarchy(null);
          }
        }).finally(()=>setLoadingForBaseHierarchy(_=>false));
  }, []);

  const createHandler = (base: boolean = false) => {
    setIsBase(base);
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

    getLocationHierarchyBase()
      .then(res => {
        setBaseHierarchyFound(true);
        setBaseHierarchy(res);
      })
      .catch(err => {
        if (err?.statusCode === 404) {
          setBaseHierarchyFound(false);
          setBaseHierarchy(null);
        }
      });
  };

  const paginationHandler = (size: number, page: number) => {
    getLocationHierarchyList(size, page, true)
      .then(res => {
        setLocationHierarchy(res);
      })
      .catch(err => toast.error(err));
  };

  const activateHandler = (identifier: string) => {
    toast.promise(activateLocationHierarchy(identifier), {
      pending: 'Activating...',
      success: {
        render() {
          closeHandler();
          return 'Successfully activated hierarchy!';
        }
      },
      error: {
        render({ data: err }: { data: any }) {
          return err?.message || err;
        }
      }
    });
  };
// console.log(baseHierarchyFound)
  return (
    <>
      <Row className="align-items-center mb-1">
        <Col>
          <h3 className="m-0 fw-bold" style={{ color: '#444', fontSize: '20px' }}>
            {'Base Hierarchy'}
          </h3>
        </Col>
        {!baseHierarchyFound && <Col>
          <Button
            id="create-button"
            className="float-end "
            onClick={() => createHandler(true)}
            style={{ borderRadius: '6px', fontWeight: 500 }}
          >
            {t('buttons.create')}
          </Button>
        </Col>}
      </Row>
      <Row className="mb-3">
        <Col className="d-flex align-items-center">
          <span className="text-secondary me-2" style={{ fontSize: '14px' }}>
            Node order:
          </span>
          <span className="me-2" style={{ fontSize: '14px', color: '#333' }}>
            {baseHierarchy?.nodeOrder.join(', ') ?? 'No node order found as base hierarchy does not exist.'}
          </span>

        </Col>
      </Row>
      <hr className="my-4" />

      <Row>
        <Col>
          <h2 className="m-0">
            {t('locationsPage.locationHierarchy')} ({locationHierarchy?.totalElements ?? 0})
          </h2>
        </Col>
        <Col>
          <Button id="create-button" disabled={!baseHierarchyFound} style={{opacity:!baseHierarchyFound?0.7:1, cursor:!baseHierarchyFound?'not-allowed':'pointer'}}  className="float-end" onClick={() => createHandler(false)}>
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
                      <Button
                        id="activate-button"
                        variant="primary"
                        onClick={() => {
                          if (el.identifier) {
                            activateHandler(el.identifier);
                          }
                        }}
                        className="float-end me-2"
                      >
                        <FontAwesomeIcon className="m-0" icon="check" /> Activate
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
          title={isBase ? "Create Base Location Hierarchy" : "Create Location Hierarchy"}
          element={
            <CreateLocationHierarchy 
              geographyLevelList={geographyLevelList ?? []} 
              closeHandler={closeHandler} 
              isBase={isBase} 
              baseHierarchyName={baseHierarchy?.nodeOrder.join(', ') || ''}
            />
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
