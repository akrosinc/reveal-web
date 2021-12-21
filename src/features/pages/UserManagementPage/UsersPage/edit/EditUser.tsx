import { useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { deleteUserById, getUserById, updateUser } from "../../../../user/api";
import { EditUserModel, UserModel } from "../../../../user/providers/types";
import { cancelTokenGenerator } from "../../../../../utils/cancelTokenGenerator";
import ConfirmDialog from "../../../../../components/dialogs/ConfirmDialog";
import { showLoader } from "../../../../reducers/loader";
import { useAppDispatch } from "../../../../../store/hooks";
import { useForm } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { getSecurityGroups } from "../../../../organization/api";
import { toast } from "react-toastify";
import { ErrorModel } from "../../../../../api/ErrorModel";

interface Props {
  userId: string;
  isEditable: boolean;
  handleClose: () => void;
}

interface RegisterValues {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  securityGroups: string[];
  organizations: string[];
  isTemp: boolean;
}

interface Options {
  value: string;
  label: string;
}

const EditUser = ({ userId, handleClose, isEditable }: Props) => {
  const [user, setUser] = useState<UserModel>();
  const [edit, setEdit] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSecurityGroups, setSelectedSecurityGroups] =
    useState<Options[]>();
  const [selectedOrganizations, setSelectedOrganizations] =
    useState<Options[]>();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm();
  const [groups, setGroups] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    getSecurityGroups().then((data) => {
      setGroups(
        data.map((el) => {
          let opt: Options = {
            label: el.name,
            value: el.name,
          };
          return opt;
        })
      );
    });
    const source = cancelTokenGenerator();
    setEdit(isEditable);
    getUserById(userId, source.token).then((res) => {
      setUser(res);
      setValue("username", res.userName);
      setValue("firstname", res.firstName);
      setValue("lastname", res.lastName);
      setValue("email", res.email);
      setSelectedSecurityGroups(
        res.securityGroups !== undefined
          ? res.securityGroups.map((group) => {
              return {
                label: group,
                value: group,
              };
            })
          : []
      );
      setOrganizations([]);
    });
    return () => {
      //Slow networks can cause a memory leak, cancel a request if its not done if modal is closed
      source.cancel(
        "Request is not done, request cancel. We don't need it anymore."
      );
    };
  }, [userId, isEditable, setValue]);

  const deleteHandler = (action: boolean) => {
    setShowDialog(false);
    if (action) {
      dispatch(showLoader(true));
      toast
        .promise(deleteUserById(userId), {
          pending: "Loading...",
          success: {
            render() {
              handleClose();
              return `User with id ${userId} deleted successfully`;
            },
          },
          error: {
            render({ data }: ErrorModel) {
              console.log(data.statusCode);
              return data.message;
            },
          },
        })
        .finally(() => dispatch(showLoader(false)));
    }
  };

  const submitHandler = (formValues: RegisterValues) => {
    dispatch(showLoader(true));
    let updatedUser: EditUserModel = {
      identifier: userId,
      email: formValues.email,
      firstName: formValues.firstname,
      lastName: formValues.lastname,
      organizations: selectedOrganizations?.map((el) => el.value) ?? [],
      securityGroups: selectedSecurityGroups?.map((el) => el.value) ?? [],
      password: formValues.password,
      tempPassword: formValues.isTemp,
    };
    toast
      .promise(updateUser(updatedUser), {
        pending: "Loading...",
        success: {
          render() {
            setEdit(false);
            return `User with id ${userId} updated successfully`;
          },
        },
        error: {
          render({ data }: ErrorModel) {
            console.log(data.statusCode);
            return data.fieldValidationErrors.map((err) => [
              "Error on field " + err.field,
              " - ",
              err.messageKey,
            ]);
          },
        },
      })
      .finally(() => dispatch(showLoader(false)));
  };

  const selectHandler = (
    selectedOption: MultiValue<{ value: string; label: string }>
  ) => {
    const values = selectedOption.map((selected) => {
      return selected;
    });
    setSelectedSecurityGroups(values);
  };

  const organizationSelectHandler = (
    selectedOption: MultiValue<{ value: string; label: string }>
  ) => {
    const values = selectedOption.map((selected) => {
      return selected;
    });
    setSelectedOrganizations(values);
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Identifier</Form.Label>
        <Form.Control
          readOnly={true}
          type="text"
          placeholder="Enter last name"
          defaultValue={user?.identifier}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          readOnly={true}
          type="username"
          placeholder="Enter last name"
          defaultValue={user?.userName}
        />
      </Form.Group>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>First name</Form.Label>
            <Form.Control
              readOnly={!edit}
              type="text"
              placeholder="Enter first name"
              {...register("firstname", { required: true })}
            />
            {errors.firstname && (
              <Form.Label className="text-danger">
                First name must not be empty.
              </Form.Label>
            )}
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Last name</Form.Label>
            <Form.Control
              readOnly={!edit}
              type="text"
              placeholder="Enter last name"
              {...register("lastname", { required: true })}
            />
            {errors.lastname && (
              <Form.Label className="text-danger">
                Last name must not be empty.
              </Form.Label>
            )}
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          readOnly={!edit}
          type="email"
          placeholder="Enter email"
          defaultValue={user?.email}
          {...register("email", { required: false })}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Security groups</Form.Label>
        <Select
          isDisabled={!edit}
          isMulti
          value={selectedSecurityGroups}
          options={groups}
          onChange={selectHandler}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Organization</Form.Label>
        <Select
          isDisabled={!edit}
          isMulti
          value={selectedOrganizations}
          options={organizations}
          onChange={organizationSelectHandler}
        />
      </Form.Group>
      {edit ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Change password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              {...register("password", { required: false })}
            />
          </Form.Group>
          <Form.Group className="mb-3 d-flex">
            <Form.Label>
              Request user to change password after first login?
            </Form.Label>
            <Form.Check
              className="ms-2"
              type="checkbox"
              {...register("isTemp", { required: false })}
            />
          </Form.Group>
        </>
      ) : null}
      {edit ? (
        <>
          <Button
            className="float-end"
            variant="primary"
            disabled={!isDirty}
            onClick={handleSubmit(submitHandler)}
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
            onClick={() => setShowDialog(!showDialog)}
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
      {showDialog && (
        <ConfirmDialog
          closeHandler={deleteHandler}
          message={
            "Are you sure you want to permanently delete the user " +
            user?.userName
          }
          title="Delete user"
          backdrop={true}
        />
      )}
    </Form>
  );
};

export default EditUser;
