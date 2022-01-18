import React, { useEffect, useCallback, useState } from 'react';
import { Button, Collapse, Table, Card } from 'react-bootstrap';
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
  const [open, setOpen] = useState(false);
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationModel>();
  const [locationList, setLocationList] = useState<PageableModel<LocationModel>>();
  const [locationHierarchyList, setLocationHierarchyList] = useState<Options[]>();
  const [, setSelectedLocationHierarchy] = useState<Options>();

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
      <hr className="my-4" />
      <Card className="mb-2 p-2">
        <p className="text-center m-0">
          {currentLocation !== undefined
            ? 'Location name: ' +
              currentLocation.properties.name +
              ' | Location Status: ' +
              currentLocation.properties.status +
              ' | Geography Level: ' +
              currentLocation.properties.geographicLevel
            : 'To inspect a location on the map select location from locations browser menu.'}
        </p>
      </Card>
      <MapView
        data={currentLocation}
        startingZoom={12}
        showCoordinates={true}
        clearHandler={() => setCurrentLocation(undefined)}
      >
        <div
          className={classes.floatingLocationPicker + " bg-white p-2 rounded"}
        >
          <Button
            onClick={() => setOpen(!open)}
            aria-controls="expand-table"
            aria-expanded={open}
            style={{ width: '100%', border: 'none' }}
            variant="light"
            className="text-start bg-white"
          >
            Browse locations
            {open ? (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-up" />
            ) : (
              <FontAwesomeIcon className="ms-2 mt-1 float-end" icon="chevron-down" />
            )}
          </Button>
          <Collapse in={open}>
            <div id="expand-table" className="mt-2">
              {locationList?.content !== undefined && locationList.totalElements > 0 ? (
                <>
                  <Select
                    className="mb-2"
                    placeholder="Select Location Hierarcy"
                    menuPosition="fixed"
                    value={locationHierarchyList !== undefined && locationHierarchyList.length > 0 ? locationHierarchyList[0] : undefined}
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
                  <div style={{ height: '40vh', width: '100%', overflowY: 'auto' }}>
                    <Table responsive bordered className="bg-white">
                      <thead className="border border-2">
                        <tr>
                          {LOCATION_TABLE_COLUMNS.map((el, index) => {
                            return (
                              <th
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
                              setOpen(!open);
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
                </>
              ) : (
                <p>No data found</p>
              )}
            </div>
          </Collapse>
        </div>
      </MapView>
    </>
  );
};

export default Locations;
