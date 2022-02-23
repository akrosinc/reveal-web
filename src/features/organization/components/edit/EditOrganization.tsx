import { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ErrorModel } from '../../../../api/providers';
import { ConfirmDialog } from '../../../../components/Dialogs';
import { useAppDispatch } from '../../../../store/hooks';
import { deleteOrganizationById, updateOrganization } from '../../api';
import { OrganizationModel } from '../../../organization/providers/types';
import { showLoader } from '../../../reducers/loader';
import Select, { SingleValue } from 'react-select';

interface Props {
  show: boolean;
  organization: OrganizationModel;
  organizations: OrganizationModel[];
  handleClose: (isEdited: boolean) => void;
}

interface OrganizationValues {
  identifier: string;
  name: string;
  type: string;
  active: boolean;
  partOf: string;
}

interface Option {
  label: string;
  value: string;
}

const EditOrganization = ({ organization, organizations, handleClose }: Props) => {
  const [edit, setEdit] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<SingleValue<Option>>();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<OrganizationValues>({
    defaultValues: {
      identifier: organization.identifier,
      name: organization.name,
      type: organization.type.code,
      active: organization.active,
      partOf: organization.partOf
    }
  });

  // set selected organization
  useEffect(() => {
    let selectedOrganization = organizations.filter(el => el.identifier === organization.partOf);
    if (selectedOrganization.length) {
      setSelectedSecurityGroups({label: selectedOrganization[0].name, value: selectedOrganization[0].identifier});
    }
  }, [setSelectedSecurityGroups, organization, organizations])

  const updateHandler = (formData: OrganizationModel) => {
    dispatch(showLoader(true));
    formData.identifier = organization.identifier;
    toast
      .promise(updateOrganization(formData), {
        pending: 'Loading...',
        success: {
          render({ data }) {
            dispatch(showLoader(false));
            setEdit(false);
            handleClose(true);
            return `Organization with id ${organization.identifier} updated successfully.`;
          }
        },
        error: {
          render({ data }: { data: ErrorModel }) {
            return data !== undefined ? data.message : 'Something went wrong!';
          }
        }
      })
      .finally(() => dispatch(showLoader(false)));
  };

  const deleteHandler = (action: boolean) => {
    if (action) {
      dispatch(showLoader(true));
      toast.promise(deleteOrganizationById(organization.identifier), {
        pending: 'Loading...',
        success: {
          render({ data }) {
            dispatch(showLoader(false));
            handleClose(true);
            return `Organization with id: ${organization.identifier} deleted successfully.`;
          }
        },
        error: {
          render({ data }: { data: ErrorModel }) {
            return data.message;
          }
        }
      });
    } else {
      //hide confirm dialog and don't update anything
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
          {...register('name', {
            required: "Organization name can't be empty.",
            minLength: 1,
            pattern: {
              value: new RegExp('^[^-\\s][\\w\\s-]+$'),
              message: "Organization name can't start with empty space."
            }
          })}
        />
        {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Label>Type</Form.Label>
        <Form.Select disabled={!edit} {...register('type', { required: 'Organization type must be selected.' })}>
          <option value=""></option>
          <option value="CG">Community group</option>
          <option value="TEAM">Team</option>
          <option value="OTHER">Other</option>
        </Form.Select>
        {errors.type && <Form.Label className="text-danger">{errors.type.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Label>Part of</Form.Label>
        <Controller
          control={control}
          name="partOf"
          render={({ field: { onChange } }) => (
            <Select
              menuPosition="fixed"
              isDisabled={!edit}
              isClearable
              {...register('partOf', { required: false })}
              value={selectedSecurityGroups}
              options={organizations.map(el => {
                return {
                  value: el.identifier,
                  label: el.name
                };
              })}
              onChange={selectedOption => {
                setSelectedSecurityGroups(selectedOption);
                onChange(selectedOption?.value);
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Switch disabled={!edit} {...register('active', { required: false })} label="Active" />
      </Form.Group>
      <hr />
      {edit ? (
        <>
          <Button className="float-end" variant="primary" onClick={handleSubmit(updateHandler)}>
            Save
          </Button>
          <Button className="float-end me-2 btn-secondary" onClick={() => setEdit(!edit)}>
            Discard changes
          </Button>
        </>
      ) : (
        <>
          <Button className="float-end" variant="primary" onClick={() => setEdit(!edit)}>
            Edit
          </Button>
          <Button className="float-end me-2" variant="primary" onClick={() => setShowConfirmDialog(!showConfirmDialog)}>
            Delete
          </Button>
          <Button className="float-start" variant="secondary" onClick={() => handleClose(false)}>
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
