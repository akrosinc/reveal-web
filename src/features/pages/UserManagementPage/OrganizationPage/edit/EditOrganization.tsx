import { CancelTokenSource } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import ConfirmDialog from "../../../../../components/dialogs/ConfirmDialog";
import { useAppDispatch } from "../../../../../store/hooks";
import { cancelTokenGenerator } from "../../../../../utils/cancelTokenGenerator";
import {
  deleteOrganizationById,
  getOrganizationById,
  getOrganizationListSummary,
  updateOrganization,
} from "../../../../organization/api";
import { OrganizationModel } from "../../../../organization/providers/types";
import { showError, showInfo } from "../../../../reducers/tostify";

interface Props {
  show: boolean;
  organizationId: string;
  handleClose: () => void;
}

const EditOrganization = ({ organizationId, handleClose }: Props) => {
  const [organization, setOrganization] = useState<OrganizationModel>();
  const [edit, setEdit] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const dispatch = useAppDispatch();
  const [organizations, setOrganizations] = useState<OrganizationModel[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const getData = useCallback(
    (source: CancelTokenSource) => {
      getOrganizationById(organizationId, source.token).then((data) => {
        setOrganization(data);
        setValue("name", data.name);
        setValue("type", data.type.code);
        setValue("active", data.active);
        getOrganizationListSummary().then((res) => {
          setOrganizations(res.content);
          setValue("partOf", data.partOf);
        });
      });
    },
    [organizationId, setValue]
  );

  useEffect(() => {
    const source = cancelTokenGenerator();
    getData(source);
    return () => {
      //Slow networks can cause a memory leak, cancel a request if its not done if modal is closed
      source.cancel(
        "Request is not done, request cancel. We don't need it anymore."
      );
    };
  }, [getData]);

  const updateHandler = (formData: OrganizationModel) => {
    formData.identifier = organizationId;
    updateOrganization(formData);
  };

  const deleteHandler = (action: boolean) => {
    if (action) {
      deleteOrganizationById(organizationId)
        .then((_) => {
          handleClose();
          dispatch(showInfo("Organization deleted successfully"));
        })
        .catch((err) => dispatch(showError(err.response.data.message)));
    } else {
      setShowConfirmDialog(action);
    }
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Identifier</Form.Label>
        <Form.Control
          readOnly={true}
          type="text"
          placeholder="Organization id"
          defaultValue={organization?.identifier}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Organization name</Form.Label>
        <Form.Control
          readOnly={!edit}
          type="text"
          placeholder="Enter organization name"
          {...register("name", { required: true })}
        />
        {errors.type && (
          <Form.Label className="text-danger">
            Organization name can't be empty.
          </Form.Label>
        )}
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Label>Type</Form.Label>
        <Form.Select
          disabled={!edit}
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
          disabled={!edit}
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
          disabled={!edit}
          {...register("active", { required: false })}
          type="checkbox"
          label="Active"
        />
      </Form.Group>
      <hr />
      {edit ? (
        <>
          <Button
            className="float-end"
            variant="primary"
            onClick={handleSubmit(updateHandler)}
          >
            Save
          </Button>
          <Button
            className="float-end me-2 btn-secondary"
            onClick={() => setEdit(!edit)}
          >
            Discard changes
          </Button>
        </>
      ) : (
        <>
          <Button
            className="float-end"
            variant="primary"
            onClick={() => setEdit(!edit)}
          >
            Edit
          </Button>
          <Button
            className="float-end me-2"
            variant="secondary"
            onClick={() => setShowConfirmDialog(!showConfirmDialog)}
          >
            Delete
          </Button>
          <Button
            className="float-start"
            variant="secondary"
            onClick={handleClose}
          >
            Close
          </Button>
        </>
      )}
      {showConfirmDialog && (
        <ConfirmDialog
          backdrop={false}
          closeHandler={deleteHandler}
          message="Are you sure? This organization will be deleted."
          title="Delete organization"
        />
      )}
    </Form>
  );
};

export default EditOrganization;
