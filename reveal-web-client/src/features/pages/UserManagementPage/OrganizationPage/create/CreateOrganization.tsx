import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { createOrganization, getOrganizationListSummary } from "../../../../organization/api";
import { OrganizationModel } from "../../../../organization/providers/types";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../../../store/hooks";
import { showLoader } from "../../../../reducers/loader";
import { showError, showInfo } from "../../../../reducers/tostify";

interface Props {
  show: boolean;
  handleClose: () => void;
}

interface RegisterValues {
  name: string;
  type: string;
  partOf: string;
  isActive: boolean;
}

const CreateOrganization = ({ show, handleClose }: Props) => {
  const [organizations, setOrganizations] = useState<OrganizationModel[]>([]);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getOrganizationListSummary().then((res) => {
      setOrganizations(res.content);
    });
    return () => {
      console.log("called");
    }
  }, []);

  const submitHandler = (formValues: RegisterValues) => {
    createOrganization(formValues).then(res => {
      dispatch(showInfo(res.name + " created successfully!"));
      handleClose();
    }).catch(error => {
      dispatch(showError(error.response !== undefined ? error.response.data.error || error.response.data.message : null));
    }).finally(() => {
      dispatch(showLoader(false));
    })
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Create organization</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="my-4">
            <Form.Label>Organization name</Form.Label>
            <Form.Control {...register("name", { required: true })} type="input" />
            {errors.name && (
              <Form.Label className="text-danger">
                Organization name must not be empty.
              </Form.Label>
            )}
          </Form.Group>
          <Form.Group className="my-4">
            <Form.Label>Type</Form.Label>
            <Form.Select {...register("type", { required: true })} aria-label="Default select example">
              <option value=""></option>
              <option value="CG">Community group</option>
              <option value="TEAM">Team</option>
              <option value="OTHER">Other</option>
            </Form.Select>
            {errors.type && (
              <Form.Label className="text-danger">
                Organization type must be selected.
              </Form.Label>
            )}
          </Form.Group>
          <Form.Group className="my-4">
            <Form.Label>Part of</Form.Label>
            <Form.Select {...register("partOf", { required: false })} aria-label="Default select example">
              <option value=""></option>
              {organizations.map((org) => {
                return (
                  <option key={org.identifier} value={org.identifier}>
                    {org.name}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
          <Form.Group className="my-4" id="formGridCheckbox">
            <Form.Check {...register("active", { required: false })} type="checkbox" label="Active" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit(submitHandler)}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOrganization;
