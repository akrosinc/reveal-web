import { useEffect, useState } from 'react';
import { Accordion, Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { LocationMetadataObj, MetadataDefinition } from '../../providers/types';

interface Props {
  show: boolean;
  isDarkMode: boolean;
  closeHandler: () => void;
  aggregationSummary: LocationMetadataObj;
  aggregationSummaryDefinition: MetadataDefinition;
  initiatingMapData: any;
}

const TableSummaryModal = ({
  show,
  closeHandler,
  isDarkMode,
  aggregationSummary,
  initiatingMapData,
  aggregationSummaryDefinition
}: Props) => {
  const [tableData, setTableData] = useState<{
    identifier: string;
    geoLevel: string;
    name: string;
    data: any[];
  }>();
  const { t } = useTranslation();
  const [fieldTypeSet, setFieldTypeSet] = useState<string[]>();
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

  useEffect(() => {
    let fieldTypeSet = new Set<string>();
    Object.keys(aggregationSummaryDefinition).forEach(key => fieldTypeSet.add(aggregationSummaryDefinition[key]));
    setFieldTypeSet(Array.from(fieldTypeSet));
  }, [aggregationSummaryDefinition]);

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
            <Accordion defaultActiveKey="0" alwaysOpen>
              {fieldTypeSet?.map(fieldType => (
                // <>
                //   <h4>{fieldType}</h4>

                <Accordion.Item eventKey={fieldType}>
                  <Accordion.Header>{fieldType}</Accordion.Header>
                  <Accordion.Body>
                    <Table bordered responsive hover className={'my-6'}>
                      <thead className="border border-2">
                        <tr>
                          <th>{t('simulationPage.property')}</th>
                          <th>{t('simulationPage.sum')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData &&
                          tableData.data
                            .filter(
                              val =>
                                aggregationSummaryDefinition[val.tag] !== null &&
                                aggregationSummaryDefinition[val.tag] !== undefined &&
                                aggregationSummaryDefinition[val.tag] === fieldType
                            )
                            .map((val, index) => {
                              return (
                                <tr key={index}>
                                  <td>{val.tag}</td>
                                  <td>{val.agg}</td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>

                // </>
              ))}
            </Accordion>
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
