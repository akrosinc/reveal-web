import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getOrganizationListSummary } from "../../../../organization/api";
import { OrganizationModel } from "../../../../organization/providers/types";

interface Props {
  show: boolean;
  handleClose: () => void;
}

const CreateOrganization = ({ show, handleClose }: Props) => {
  const [organizations, setOrganizations] = useState<OrganizationModel[]>([]);

  useEffect(() => {
    getOrganizationListSummary().then(res => {
     setOrganizations(res.content);
   }) 
  }, [])

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create organization</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="my-4">
            <Form.Label>Organization name</Form.Label>
            <Form.Control type="input" />
          </Form.Group>
          <Form.Group className="my-4">
            <Form.Label>Type</Form.Label>
            <Form.Select aria-label="Default select example">
              <option>CG</option>
              <option>TEAM</option>
              <option>OTHER</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="my-4">
            <Form.Label>Part of</Form.Label>
            <Form.Select aria-label="Default select example">
              <option value=""></option>
              {organizations.map(org => {
                return <option value={org.identifier}>{org.name}</option>
              })}
            </Form.Select>
          </Form.Group>
          <Form.Group className="my-4" id="formGridCheckbox">
            <Form.Check type="checkbox" label="Active" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary">Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOrganization;
