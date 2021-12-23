import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import {
  createOrganization,
  getOrganizationListSummary,
} from "../../../../organization/api";
import { OrganizationModel } from "../../../../organization/providers/types";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../../../store/hooks";
import { showLoader } from "../../../../reducers/loader";
import { toast } from "react-toastify";
import { ErrorModel } from "../../../../../api/ErrorModel";
import { UserModel } from "../../../../user/providers/types";

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
  }, []);

  const submitHandler = (formValues: RegisterValues) => {
    dispatch(showLoader(true));
    toast.promise(createOrganization(formValues), {
      pending: "Loading...",
      success: {
        render({ data }: any) {
          let newUser = data as UserModel;
          dispatch(showLoader(false));
          handleClose();
          return (
            "Organization with id: " +
            newUser.identifier +
            " created successfully."
          );
        },
      },
      error: {
        render({ data }: ErrorModel) {
          dispatch(showLoader(false));
          return data.message;
        },
      },
    });
  };

  return (
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
        <Form.Select
          {...register("type", { required: true })}
          aria-label="Default select example"
        >
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
        <Form.Select
          {...register("partOf", { required: false })}
          aria-label="Default select example"
        >
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
        <Form.Check
          {...register("active", { required: false })}
          type="checkbox"
          label="Active"
        />
      </Form.Group>
      <hr />
      <Button
        variant="primary"
        className="float-end"
        onClick={handleSubmit(submitHandler)}
      >
        Save
      </Button>
      <Button
        variant="secondary"
        className="float-end me-2"
        onClick={handleClose}
      >
        Close
      </Button>
    </Form>
  );
};

export default CreateOrganization;
