import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { ComplexTagResponse } from '../../providers/types';
import React from 'react';
import { LocationHierarchyModel } from '../../../location/providers/types';

interface Props {
  showModal: boolean;
  closeHandler: () => void;
  combinedHierarchyList?: LocationHierarchyModel[];
  currentTag?: ComplexTagResponse;
}

const MetadataFormulaPanelViewOnly = ({ showModal, closeHandler, combinedHierarchyList, currentTag }: Props) => {
  return (
    <>
      <Modal show={showModal} onHide={closeHandler} size={'xl'} onBackdropClick={closeHandler}>
        <Modal.Header>
          <Modal.Title>Build Formula</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Label>Hierarchy</Form.Label>
                <Form.Control as={'text'}>
                  {combinedHierarchyList?.find(hierarchy => hierarchy.identifier === currentTag?.hierarchyId)?.name}
                </Form.Control>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Tag Name</Form.Label>
                <Form.Control as={'text'}>{currentTag?.tagName}</Form.Control>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Formula</Form.Label>
                <Form.Control as={'text'}>{currentTag?.formula}</Form.Control>
              </Col>
            </Row>
            <Row>
              <Table>
                <thead>
                  <tr>
                    <td>variable</td>
                    <td>tag</td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {currentTag?.tags.map(tag => (
                    <tr>
                      <td>
                        <Form.Label>{tag.symbol}</Form.Label>
                      </td>
                      <td>
                        <Form.Control as={'text'}>{tag.name}</Form.Control>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeHandler}>close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default MetadataFormulaPanelViewOnly;
