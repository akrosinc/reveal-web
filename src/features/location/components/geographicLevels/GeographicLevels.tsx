import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { GEOGRAPHY_LEVEL_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import Paginator from '../../../../components/Pagination';
import CreateGeoLevel from './create';
import { ActionDialog } from '../../../../components/Dialogs';
import { getGeographicLevelById, getGeographicLevelList } from '../../api';
import { GeographicLevel } from '../../providers/types';
import { PageableModel } from '../../../../api/providers';
import { useAppDispatch } from '../../../../store/hooks';
import { toast } from 'react-toastify';
import GeoLevelDetails from './details/GeoLevelDetails';
import { useTranslation } from 'react-i18next';
import DefaultTable from '../../../../components/Table/DefaultTable';

const GeographicLevels = () => {
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedGeoLevel, setSelectedGeoLocation] = useState<GeographicLevel>();
  const [geoLevelList, setGeoLevelList] = useState<PageableModel<GeographicLevel>>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const sortHandler = (field: string, sortDirection: boolean) => {
    setCurrentSortField(field);
    setCurrentSortDirection(sortDirection);
    if (geoLevelList !== undefined) {
      getGeographicLevelList(geoLevelList.pageable.pageSize, 0, '', field, sortDirection).then(res => {
        setGeoLevelList(res);
      });
    }
  };

  const paginationHandler = (size: number, page: number) => {
    getGeographicLevelList(size, page).then(res => {
      setGeoLevelList(res);
    });
  };

  const openDetails = (identifier: string) => {
    getGeographicLevelById(identifier).then(data => {
      setSelectedGeoLocation(data);
      setOpenEdit(true);
    });
  };

  const closeHandler = () => {
    setOpenCreate(false);
    setOpenEdit(false);
    getGeographicLevelList(
      geoLevelList?.pageable.pageSize ?? PAGINATION_DEFAULT_SIZE,
      geoLevelList?.pageable.pageNumber ?? 0,
      '',
      currentSortField,
      currentSortDirection
    )
      .then(data => {
        setGeoLevelList(data);
      })
      .catch(err => toast.error(err));
  };

  useEffect(() => {
    getGeographicLevelList(PAGINATION_DEFAULT_SIZE, 0)
      .then(res => {
        setGeoLevelList(res);
      })
      .catch(err => toast.error(err));
  }, [dispatch]);

  return (
    <>
      <Row>
        <Col>
          <h2 className="m-0">
            {t('locationsPage.geographicLevels')} ({geoLevelList?.totalElements ?? 0})
          </h2>
        </Col>
        <Col>
          <Button id="create-button" className="float-end" onClick={() => setOpenCreate(true)}>
            {t('buttons.create')}
          </Button>
        </Col>
      </Row>
      <hr className="my-4" />
      {geoLevelList !== undefined && geoLevelList.totalElements > 0 ? (
        <>
          <DefaultTable
            columns={GEOGRAPHY_LEVEL_TABLE_COLUMNS}
            data={geoLevelList.content}
            sortHandler={sortHandler}
            clickAccessor="identifier"
            clickHandler={(identifier: string) => openDetails(identifier)}
          />
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
          closeHandler={closeHandler}
          element={<CreateGeoLevel closeHandler={closeHandler} />}
          title="Create Geographic Level"
        />
      )}
      {openEdit && (
        <ActionDialog
          closeHandler={closeHandler}
          element={<GeoLevelDetails closeHandler={closeHandler} data={selectedGeoLevel} />}
          title="Geographic Level Details"
        />
      )}
    </>
  );
};

export default GeographicLevels;
