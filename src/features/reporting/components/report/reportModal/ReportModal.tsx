import { Feature, MultiPolygon, Point, Polygon } from '@turf/turf';
import React, { useMemo, useState } from 'react';
import { Button, Modal, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM
} from '../../../../../constants';
import { useAppSelector } from '../../../../../store/hooks';
import { FoundCoverage, ReportLocationProperties, ReportType } from '../../../providers/types';

interface Props {
  showModal: (show: boolean) => void;
  feature: Feature<Polygon | MultiPolygon | Point, ReportLocationProperties>;
}

const ReportModal = ({ showModal, feature }: Props) => {
  const [tableData, setTableData] = useState<{ [key: string]: FoundCoverage }>();
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const { reportType } = useParams();

  const columns = useMemo<string[]>(() => {
    //Map columns depending on server response
    //we need to parse the object because mapbox only stores string and numeric property values
    if (feature.properties.columnDataMap) {
      const parsed = JSON.parse(String(feature.properties.columnDataMap));
      return Object.keys(parsed);
    }
    return [];
  }, [feature.properties.columnDataMap]);

  const generatePercentageRow = (colValue: FoundCoverage, index: number) => {
    //check if its already a round number or should be rounded
    let color = '';
    let percentage = colValue.value;
    percentage = Number(percentage.toFixed(percentage > 1 ? 2 : 3));
    //check if its already a round number or should be rounded
    if (percentage >= REPORT_TABLE_PERCENTAGE_HIGH) {
      color = 'bg-success';
    }
    if (percentage >= REPORT_TABLE_PERCENTAGE_MEDIUM && percentage < REPORT_TABLE_PERCENTAGE_HIGH) {
      color = 'bg-yellow';
    }
    if (percentage >= REPORT_TABLE_PERCENTAGE_LOW && percentage < REPORT_TABLE_PERCENTAGE_MEDIUM) {
      color = 'bg-warning';
    }
    if (percentage >= 0 && percentage < REPORT_TABLE_PERCENTAGE_LOW) {
      color = 'bg-danger';
    }
    return (
      <OverlayTrigger key={index} placement="top" overlay={<Tooltip id="button-tooltip">{colValue.meta}</Tooltip>}>
        <td className={color}>{percentage}%</td>
      </OverlayTrigger>
    );
  };

  return (
    <Modal
      backdrop="static"
      show
      centered
      size="xl"
      onShow={() =>
        setTableData(JSON.parse(String(feature.properties.columnDataMap)) as { [key: string]: FoundCoverage })
      }
      contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}
    >
      <Modal.Header className="justify-content-center">
        <Modal.Title>
          {t('reportPage.reportDetails')} ({feature.properties.name})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{t('reportPage.locationInfo')}</h4>
        <Table bordered responsive className="my-2" variant={isDarkMode ? 'dark' : 'white'}>
          <thead className="border border-2">
            <tr>
              <th>{t('reportPage.identifier')}</th>
              <th>{t('reportPage.locationName')}</th>
              <th>{t('reportPage.locationType')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{feature.properties.id}</td>
              <td>{feature.properties.name}</td>
              <td>{feature.properties.geographicLevel}</td>
            </tr>
          </tbody>
        </Table>
        <hr />
        <h4>{t('reportPage.locationData')}</h4>
        <Table responsive bordered className="my-2" variant={isDarkMode ? 'dark' : 'white'}>
          <thead className="border border-2">
            <tr>
              {columns.map((el, index) => (
                <th key={index}>{el}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map((el, index) => {
                return tableData ? (
                  tableData[el].isPercentage ? (
                    generatePercentageRow(tableData[el], index)
                  ) : el === 'Structure Status' &&
                    (reportType === ReportType.IRS_FULL_COVERAGE ||
                      reportType === ReportType.IRS_LITE_COVERAGE ||
                      reportType === ReportType.IRS_LITE_COVERAGE_OPERATIONAL_AREA_LEVEL) ? (
                    <td key={index}>{tableData[el].value === 'Complete' ? 'Sprayed' : tableData[el].value}</td>
                  ) : (
                    <td key={index}>{tableData[el].value}</td>
                  )
                ) : null;
              })}
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button id="close-button" variant="secondary" onClick={() => showModal(false)}>
          {t('buttons.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;
