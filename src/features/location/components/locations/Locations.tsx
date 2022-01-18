import React, { useEffect, useCallback, useState } from 'react';
import { Row, Col, Table, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import MapView from '../../../../components/MapBox/MapView';
import { DebounceInput } from 'react-debounce-input';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import { LOCATION_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import Paginator from '../../../../components/Pagination';
import { getLocationById, getLocationHierarchyList, getLocationList } from '../../api';
import { LocationModel } from '../../providers/types';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import classes from './Location.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';

interface Options {
  value: string;
  label: string;
}

const Locations = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationModel>();
  const [locationList, setLocationList] = useState<PageableModel<LocationModel>>();
  const [locationHierarchyList, setLocationHierarchyList] = useState<Options[]>();
  const [,setSelectedLocationHierarchy] = useState<Options>();

  const filterData = (e: any) => {
    setCurrentSearchInput(e.target.value);
    loadData(PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };

  const sortHandler = (field: string, sortDirection: boolean) => {
    if (locationList !== undefined) {
      loadData(
        locationList.pageable.pageSize,
        locationList.pageable.pageNumber,
        currentSearchInput,
        field,
        sortDirection
      );
    }
  };

  const paginationHandler = (size: number, page: number) => {
    setCurrentSortField('');
    loadData(size, page, currentSearchInput, '', false);
  };

  const loadData = useCallback(
    (size: number, page: number, searchData?: string, sortField?: string, sortDirection?: boolean) => {
      dispatch(showLoader(true));
      getLocationList(size, page, true, searchData, sortField, sortDirection)
        .then(res => {
          setLocationList(res);
        })
        .catch(err => toast.error(err.message !== undefined ? err.message : err.toString()))
        .finally(() => dispatch(showLoader(false)));
      getLocationHierarchyList(100, 0, true).then(res => {
        setLocationHierarchyList(
          res.content.map(el => {
            return {
              value: el.identifier ?? '',
              label: el.name
            };
          })
        );
      });
    },
    [dispatch]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  return (
    <>
      <h2 className="m-0 mb-4">{t('locationsPage.locations')}</h2>
      <Row>
        <Col md={3} className={classes.layoutHeight}>
          {locationList?.content !== undefined && locationList.totalElements > 0 ? (
            <div className="d-flex flex-column h-100">
              <Select
                className="mb-2"
                placeholder="Select Location Hierarcy"
                menuPosition="fixed"
                options={locationHierarchyList}
                onChange={e => {
                  setSelectedLocationHierarchy(e !== null ? e : undefined);
                }}
              />
              <DebounceInput
                className="form-control mb-2"
                placeholder={t('userPage.search')}
                debounceTimeout={800}
                onChange={e => filterData(e)}
              />
              <div className="flex-grow-1">
                <Table responsive bordered>
                  <thead className="border border-2">
                    <tr>
                      {LOCATION_TABLE_COLUMNS.map((el, index) => {
                        return (
                          <th
                            style={{ cursor: 'pointer' }}
                            key={index}
                            onClick={() => {
                              setCurrentSortField(el.name);
                              setCurrentSortDirection(!currentSortDirection);
                              sortHandler(el.sortValue, !currentSortDirection);
                            }}
                          >
                            {el.name}
                            {currentSortField === el.name ? (
                              currentSortDirection ? (
                                <FontAwesomeIcon className="ms-1" icon="sort-up" />
                              ) : (
                                <FontAwesomeIcon className="ms-1" icon="sort-down" />
                              )
                            ) : (
                              <FontAwesomeIcon className="ms-1" icon="sort" />
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {locationList.content.map(el => (
                      <tr
                        key={el.identifier}
                        onClick={() => {
                          getLocationById(el.identifier).then(res => {
                            setCurrentLocation(res);
                          });
                        }}
                      >
                        <td>{el.properties.name}</td>
                        <td>{el.properties.geographicLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Paginator
                totalElements={locationList.totalElements}
                totalPages={locationList.totalPages}
                paginationHandler={paginationHandler}
                size={locationList.pageable.pageSize}
                page={locationList.pageable.pageNumber}
              />
            </div>
          ) : (
            <p>No data found</p>
          )}
        </Col>
        <Col md={9}>
          <div className="d-flex flex-column h-100">
            <MapView
              data={currentLocation}
              startingZoom={12}
              showCoordinates={true}
              clearHandler={() => setCurrentLocation(undefined)}
            ></MapView>
            <Card className="mt-2 p-2">
              <p className="text-center m-0">
                {currentLocation !== undefined
                  ? 'Location name: ' +
                    currentLocation.properties.name +
                    ' | Location Status: ' +
                    currentLocation.properties.status +
                    ' | Geography Level: ' +
                    currentLocation.properties.geographicLevel
                  : null}
              </p>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Locations;
