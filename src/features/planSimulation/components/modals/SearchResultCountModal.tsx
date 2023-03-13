import { Button, Col, Modal, Row } from 'react-bootstrap';
import React from 'react';

interface Props {
  setShowCountModal: (val: boolean) => void;
  simulationCountData: any;
  proceedToSearch: () => void;
}

const SearchResultCountModal = ({ setShowCountModal, simulationCountData, proceedToSearch }: Props) => {
  return (
    <Modal
      size="lg"
      show
      centered
      scrollable
      backdrop="static"
      keyboard={false}
      onHide={() => setShowCountModal(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title className="w-100 text-center">Search Result Counts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span className="span-header">Results</span>
        {simulationCountData &&
          Object.keys(simulationCountData['countResponse']).map(key => {
            return (
              <Row key={key}>
                <Col>{key} </Col>
                <Col>{simulationCountData['countResponse'][key]}</Col>
              </Row>
            );
          })}

        {simulationCountData && simulationCountData['inactiveCountResponse'] && (
          <>
            <hr />
            <span className="span-header">Inactive Locations</span>
            {Object.keys(simulationCountData['inactiveCountResponse']).map(key => {
              return (
                <Row key={key}>
                  <Col>{key} </Col>
                  <Col>{simulationCountData['inactiveCountResponse'][key]}</Col>
                </Row>
              );
            })}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Row>
          <Col>
            <Button onClick={() => setShowCountModal(false)}>Cancel</Button>
          </Col>
          <Col>
            <Button onClick={() => proceedToSearch()}>Proceed</Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
};
export default SearchResultCountModal;
