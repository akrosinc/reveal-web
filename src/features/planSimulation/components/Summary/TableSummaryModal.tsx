import { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { LocationMetadataObj } from '../../providers/types';

interface Props {
  show: boolean;
  isDarkMode: boolean;
  closeHandler: () => void;
  aggregationSummary: LocationMetadataObj;
  initiatingMapData: any;
}

const TableSummaryModal = ({ show, closeHandler, isDarkMode, aggregationSummary, initiatingMapData }: Props) => {
  const [tableData, setTableData] = useState<{
    identifier: string;
    geoLevel: string;
    name: string;
    data: any[];
  }>();
  const { t } = useTranslation();

  useEffect(() => {
    if (aggregationSummary) {
      if (initiatingMapData) {
        let val = aggregationSummary[initiatingMapData.identifier];
        if (val) {
          let i = Object.keys(val).map((key: string) => {
            let f: any = {
              tag: key,
              agg: val[key]
            };
            return f;
          });
          let a = {
            identifier: initiatingMapData.identifier,
            geoLevel: initiatingMapData.properties.geographicLevel,
            name: initiatingMapData.properties.name,
            data: i
          };
          setTableData(a);
        }
      }
    }
  }, [aggregationSummary, initiatingMapData]);

  return (
    <Modal
      size="lg"
      show={show}
      centered
      backdrop="static"
      onHide={closeHandler}
      contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <Row>
            <Col>
              <b>
                {t('simulationPage.summary')} {tableData ? ' - '.concat(tableData.name) : ''}
              </b>
            </Col>
          </Row>
          {tableData && (
            <>
              <Row>
                <Col>
                  {' '}
                  {t('simulationPage.identifier')}: {tableData.identifier}
                </Col>
              </Row>
              <Row>
                <Col>
                  {' '}
                  {t('simulationPage.level')}: {tableData.geoLevel}
                </Col>
              </Row>
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Table bordered responsive hover>
              <thead className="border border-2">
                <tr>
                  <th>{t('simulationPage.property')}</th>
                  <th>{t('simulationPage.sum')}</th>
                </tr>
              </thead>
              <tbody>
                {tableData &&
                  tableData.data.map((val, index) => {
                    return (
                      <tr key={index}>
                        <td>{val.tag}</td>
                        <td>{val.agg}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button id="cancel-goal-button" variant="secondary" onClick={closeHandler}>
          {t('simulationPage.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TableSummaryModal;
