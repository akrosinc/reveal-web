import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';

interface Props {
  show: boolean;
  isDarkMode: boolean;
  closeHandler: () => void;
  summary: any | undefined;
  initiatingMapData: any;
}

const TableSummaryModal = ({ show, closeHandler, isDarkMode, summary, initiatingMapData }: Props) => {
  const [selectedGeoLevel, setSelectedGeoLevel] = useState<string>();
  const [tableData, setTableData] = useState<{
    identifier: string;
    geoLevel: string;
    name: string;
    data: any[];
  }>();

  useEffect(() => {
    if (summary) {
      setSelectedGeoLevel(Object.keys(summary).filter(key => initiatingMapData.properties.geographicLevel !== key)[0]);

      if (initiatingMapData) {
        let val = summary[initiatingMapData.properties.geographicLevel][initiatingMapData.identifier];
        if (val) {
          if (val.aggregates) {
            let i = Object.keys(val.aggregates)
              .filter(key => val.aggregates[key])
              .map((key: string) => {
                let f: any = {
                  tag: key,
                  agg: val.aggregates[key]
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
    }
  }, [summary, initiatingMapData]);

  const getGeographicLevelMap = useCallback(() => {
    let val: any = {
      cnt: 0,
      stats: {
        sum: {}
      },
      resultCount: 0,
      resultStats: {
        sum: {}
      }
    };

    if (selectedGeoLevel) {
      if (summary[selectedGeoLevel]) {
        let item = summary[selectedGeoLevel];
        if (Object.keys(item).length > 0) {
          Object.keys(item).forEach((key: any) => {
            val.cnt = val.cnt + 1;
            if (item[key].metadata && item[key].metadata.length > 0) {
              item[key].metadata.forEach((element: any) => {
                if (
                  element.type &&
                  !element.type.endsWith('-min') &&
                  !element.type.endsWith('-max') &&
                  !element.type.endsWith('-average')
                ) {
                  if (val.stats.sum[element.type]) {
                    val.stats.sum[element.type] = val.stats.sum[element.type] + element.value;
                  } else {
                    val.stats.sum[element.type] = element.value;
                  }
                }
              });
            }

            if (item[key].result) {
              val.resultCount = val.resultCount + 1;
              if (item[key].metadata && item[key].metadata.length > 0) {
                item[key].metadata.forEach((element: any) => {
                  if (
                    element.type &&
                    !element.type.endsWith('-min') &&
                    !element.type.endsWith('-max') &&
                    !element.type.endsWith('-average')
                  ) {
                    if (val.resultStats.sum[element.type]) {
                      val.resultStats.sum[element.type] = val.resultStats.sum[element.type] ?? 0 + element.value ?? 0;
                    } else {
                      val.resultStats.sum[element.type] = element.value ?? 0;
                    }
                  }
                });
              }
            }
          });
        }
      }
    }
  }, [summary, selectedGeoLevel]);

  useEffect(() => {
    getGeographicLevelMap();
  }, [selectedGeoLevel, summary, getGeographicLevelMap]);

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
              <b>Summary {tableData ? ' - '.concat(tableData.name) : ''}</b>
            </Col>
          </Row>
          {tableData && (
            <>
              <Row>
                <Col>Identifier: {tableData.identifier}</Col>
              </Row>
              <Row>
                <Col>Level: {tableData.geoLevel}</Col>
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
                  <th>Tag</th>
                  <th>Sum</th>
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
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TableSummaryModal;
