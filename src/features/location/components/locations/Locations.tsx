import React, { useEffect, useCallback, useState } from 'react';
import { Button, Collapse, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import MapView from '../../../../components/MapBox/MapView';
import { DebounceInput } from 'react-debounce-input';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import { LOCATION_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import Paginator from '../../../../components/Pagination';
import { getLocationById, getLocationHierarchyList, getLocationListByHierarchyId } from '../../api';
import { LocationModel } from '../../providers/types';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import classes from './Location.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import ExpandingTable from '../../../../components/Table/ExpandingTable';

interface Options {
  value: string;
  label: string;
}

const Locations = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentLocation, setCurrentLocation] = useState<LocationModel>();
  const [locationList, setLocationList] = useState<PageableModel<LocationModel>>();
  const [locationHierarchyList, setLocationHierarchyList] = useState<Options[]>();
  const [selectedLocationHierarchy, setSelectedLocationHierarchy] = useState<Options>();

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
    loadData(size, page, currentSearchInput, '', false);
  };

  const loadData = useCallback(
    (size: number, page: number, searchData?: string, sortField?: string, sortDirection?: boolean) => {
      dispatch(showLoader(true));
      getLocationHierarchyList(0, 0, true).then(res => {
        setLocationHierarchyList(
          res.content.map(el => {
            return {
              value: el.identifier ?? '',
              label: el.name
            };
          })
        );
        getLocationListByHierarchyId(
          size,
          page,
          selectedLocationHierarchy !== undefined ? selectedLocationHierarchy.value : res.content[0].identifier!,
          true,
          searchData,
          sortField,
          sortDirection
        )
          .then(res => setLocationList(res))
          .catch(err => toast.error(err.message !== undefined ? err.message : err.toString()))
          .finally(() => dispatch(showLoader(false)));
      });
    },
    [dispatch, selectedLocationHierarchy]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // We can even use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth * 2}rem`,
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
          ) : null
      },
      ...LOCATION_TABLE_COLUMNS
    ],
    []
  );

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
        clearHandler={() => setCurrentLocation(undefined)}
      >
        <div className={classes.floatingLocationPicker + ' bg-white p-2 rounded'}>
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
                    defaultValue={
                      locationHierarchyList !== undefined && locationHierarchyList.length > 0
                        ? locationHierarchyList[0]
                        : undefined
                    }
                    options={locationHierarchyList}
                    onChange={e => {
                      setSelectedLocationHierarchy(e !== null ? e : undefined);
                      console.log(e);
                    }}
                  />
                  <DebounceInput
                    className="form-control mb-2"
                    placeholder={t('userPage.search')}
                    debounceTimeout={800}
                    onChange={e => filterData(e)}
                  />
                  <div style={{ height: '40vh', width: '100%', overflowY: 'auto' }}>
                    <ExpandingTable
                      columns={columns}
                      clickHandler={(identifier: string) => {
                        setOpen(!open);
                        dispatch(showLoader(true));
                        getLocationById(identifier)
                          .then(res => {
                            setCurrentLocation(res);
                          })
                          .catch(err => toast.error('Error loading geoJSON data'))
                          .finally(() => dispatch(showLoader(false)));
                      }}
                      data={locationList.content}
                      sortHandler={sortHandler}
                    />
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
