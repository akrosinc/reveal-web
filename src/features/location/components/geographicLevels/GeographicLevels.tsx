import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GEOGRAPHY_LEVEL_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import Paginator from '../../../../components/Pagination';
import CreateGeoLevel from './create';
import { ActionDialog } from '../../../../components/Dialogs';
import { getGeographicLevelList } from '../../api';
import { GeographicLevel } from '../../providers/types';
import { PageableModel } from '../../../../api/providers';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import { toast } from 'react-toastify';

const GeographicLevels = () => {
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [geoLevelList, setGeoLevelList] = useState<PageableModel<GeographicLevel>>();
  const dispatch = useAppDispatch();

  const sortHandler = (field: string, sortDirection: boolean) => {
    dispatch(showLoader(true));
    setCurrentSortField(field);
    setCurrentSortDirection(sortDirection);
    if (geoLevelList !== undefined) {
      getGeographicLevelList(geoLevelList.pageable.pageSize, 0, "", field, sortDirection).then(res => {
        setGeoLevelList(res);
        dispatch(showLoader(false));
      });
    }
  };

  const paginationHandler = (size: number, page: number) => {
    dispatch(showLoader(true));
    getGeographicLevelList(size, page).then(res => {
      setGeoLevelList(res);
      dispatch(showLoader(false));
    });
  };

  const closeHandler = () => {
    console.log(currentSortDirection);
    console.log(currentSortField);
    setOpenCreate(false);
  };

  useEffect(() => {
    dispatch(showLoader(true));
    getGeographicLevelList(PAGINATION_DEFAULT_SIZE, 0)
      .then(res => {
        setGeoLevelList(res);
      })
      .catch(err => toast.error(err.message !== undefined ? err.message : err.toString()))
      .finally(() => dispatch(showLoader(false)));
  }, [dispatch]);

  return (
    <>
      <Row>
        <Col>
          <h2 className="m-0">Geographic levels ({geoLevelList?.totalElements})</h2>
        </Col>
        <Col>
          <Button className="float-end" onClick={() => setOpenCreate(true)}>
            Create
          </Button>
        </Col>
      </Row>
      <hr className="my-4" />
      {geoLevelList !== undefined && geoLevelList.totalElements > 0 ? (
        <>
          <Table bordered responsive hover>
            <thead className="border border-2">
              <tr>
                {GEOGRAPHY_LEVEL_TABLE_COLUMNS.map((el, index) => {
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
              {geoLevelList.content.map(el => {
                return (
                  <tr key={el.identifier}>
                    <td>{el.name}</td>
                    <td>{el.title}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Paginator
            page={geoLevelList.pageable.pageNumber}
            paginationHandler={paginationHandler}
            size={geoLevelList.pageable.pageSize}
            totalElements={geoLevelList.totalElements}
            totalPages={geoLevelList.totalPages}
          />
        </>
      ) : (
        <p className="text-center lead">No Geographic Levels found.</p>
      )}
      {openCreate && (
        <ActionDialog
          backdrop={true}
          closeHandler={closeHandler}
          element={<CreateGeoLevel closeHandler={closeHandler} />}
          title="Create Geographic Level"
        />
      )}
    </>
  );
};

export default GeographicLevels;
