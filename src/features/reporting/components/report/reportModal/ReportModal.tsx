import { Feature, MultiPolygon, Polygon } from '@turf/turf';
import React, { useMemo, useState } from 'react';
import { Modal, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import {
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM
} from '../../../../../constants';
import { LocationProperties } from '../../../../../utils';
import { FoundCoverage } from '../../../providers/types';

interface Props {
  showModal: (show: boolean) => void;
  feature: Feature<Polygon | MultiPolygon, LocationProperties>;
}

const ReportModal = ({ showModal, feature }: Props) => {
  const [tableData, setTableData] = useState<{ [key: string]: FoundCoverage }>();

  const columns = useMemo<string[]>(() => {
    //Map columns depending on server response
    //we need to parse the object because mapbox only stores string and numeric property values
    if (feature.properties.columnDataMap) {
        const parsed = JSON.parse(feature.properties.columnDataMap);
        return Object.keys(parsed);
    }
    return [];
  }, [feature.properties.columnDataMap]);

  const generatePercentageRow = (colValue: FoundCoverage, index: number) => {
    //check if its already a round number or should be rounded
    let color = '';
    let percentage = Math.round(colValue.value * (colValue.value > 1 ? 1 : 100));
    if (percentage >= REPORT_TABLE_PERCENTAGE_HIGH) {
      color = 'bg-success';
    }
    if (percentage > REPORT_TABLE_PERCENTAGE_MEDIUM && percentage < REPORT_TABLE_PERCENTAGE_HIGH) {
      color = 'bg-warning';
    }
    if (percentage <= REPORT_TABLE_PERCENTAGE_MEDIUM && percentage >= REPORT_TABLE_PERCENTAGE_LOW) {
      color = 'bg-danger';
    }
    if (percentage < REPORT_TABLE_PERCENTAGE_LOW) {
      color = 'bg-secondary';
    }
    if (percentage === 0) {
      color = 'bg-light';
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
      keyboard={false}
      onShow={() => setTableData(JSON.parse(feature.properties.columnDataMap) as { [key: string]: FoundCoverage })}
      onHide={() => showModal(false)}
    >
      <Modal.Header closeButton className="justify-content-center">
        <Modal.Title>{'Report details (' + feature.properties.name + ')'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table responsive>
          <thead>
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
                  ) : (
                    <td key={index}>{tableData[el].value}</td>
                  )
                ) : null;
              })}
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default ReportModal;
