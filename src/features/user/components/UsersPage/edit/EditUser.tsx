import { useCallback, useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { deleteUserById, getUserById, resetUserPassword, updateUser } from "../../../../user/api";
import { EditUserModel, UserModel } from "../../../../user/providers/types";
import { cancelTokenGenerator } from "../../../../../utils";
import { ConfirmDialog } from "../../../../../components/Dialogs";
import { showLoader } from "../../../../reducers/loader";
import { useAppDispatch } from "../../../../../store/hooks";
import { useForm } from "react-hook-form";
import Select, { MultiValue } from "react-select";
import {
  getOrganizationListSummary,
  getSecurityGroups,
} from "../../../../organization/api";
import { toast } from "react-toastify";
import { ErrorModel } from "../../../../../api/providers";
import { AxiosResponse, CancelToken } from "axios";

interface Props {
  userId: string;
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

const EditUser = ({ userId, handleClose }: Props) => {
  const [user, setUser] = useState<UserModel>();
  const [edit, setEdit] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
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

  const setStartValues = useCallback(
    (userDetails: UserModel) => {
      setUser(userDetails);
      setValue("username", userDetails.username);
      setValue("firstname", userDetails.firstName);
      setValue("lastname", userDetails.lastName);
      setValue("email", userDetails.email);
      setSelectedSecurityGroups(
        userDetails.securityGroups !== undefined
          ? userDetails.securityGroups.map((group) => {
              return {
                label: group,
                value: group,
              };
            })
          : []
      );
      setSelectedOrganizations(
        userDetails.organizations.map((org) => {
          return {
            label: org.name,
            value: org.identifier,
          };
        })
      );
    },
    [setValue]
  );

  const getData = useCallback(
    (cancelToken: CancelToken) => {
      getSecurityGroups(cancelToken)
        .then((res) => {
          setGroups(
            res.map((el) => {
              return {
                label: el.name,
                value: el.name,
              };
            })
          );
        })
        .catch((err) => toast.error(err.toString()));
      getOrganizationListSummary().then((res) => {
        setOrganizations(
          res.content.map((org) => {
            return {
              label: org.name,
              value: org.identifier,
            };
          })
        );
      });
      getUserById(userId, cancelToken)
        .then((res) => {
          setStartValues(res);
        })
        .catch((err) => toast.error(err.toString()));
    },
    [userId, setStartValues]
  );

  useEffect(() => {
    const source = cancelTokenGenerator();
    getData(source.token);
    return () => {
      //Slow networks can cause a memory leak, cancel a request if its not done if modal is closed
      source.cancel("Preventing memory leak - canceling pending promises.");
    };
  }, [getData]);

  const deleteHandler = (action: boolean) => {
    setShowDialog(false);
    if (action) {
      dispatch(showLoader(true));
      toast.promise(deleteUserById(userId), {
        pending: "Loading...",
        success: {
          render() {
            dispatch(showLoader(false));
            handleClose();
            return `User with id ${userId} deleted successfully`;
          },
        },
        error: {
          render(error: ErrorModel) {
            dispatch(showLoader(false));
            return error.data.message !== undefined
              ? error.data.message
              : error.data.error;
          },
        },
      });
    }
  };

  const submitHandler = (formValues: RegisterValues) => {
    dispatch(showLoader(true));
    if (changePassword) {
      const passwordModel = {
        identifier: userId,
        password: formValues.password,
        tempPassword: formValues.isTemp,
      }
      toast.promise(resetUserPassword(passwordModel), {
        pending: "Loading...",
        success: {
          render({ data }) {
            const response = data as AxiosResponse;
            if (response.status === 204) {
              setChangePassword(false);
              setEdit(false);
              dispatch(showLoader(false));
              return "Password updated successfully."
            }
          }
        },
        error: {
          render ( { data }: ErrorModel ) {
            dispatch(showLoader(false));
            return data.error;
          }
        }
      })
    } else {
      let updatedUser: EditUserModel = {
        identifier: userId,
        email: formValues.email,
        firstName: formValues.firstname,
        lastName: formValues.lastname,
        organizations: selectedOrganizations?.map((el) => el.value) ?? [],
        securityGroups: selectedSecurityGroups?.map((el) => el.value) ?? [],
      };
      toast
        .promise(updateUser(updatedUser), {
          pending: "Loading...",
          success: {
            render() {
              setEdit(false);
              handleClose();
              return `User with id ${userId} updated successfully.`;
            },
          },
          error: {
            render({ data }: ErrorModel) {
              return data.fieldValidationErrors.map((err) => [
                "Error on field " + err.field,
                " - ",
                err.messageKey,
              ]);
            },
          },
        })
        .finally(() => dispatch(showLoader(false)));
    }
  };

  const selectHandler = (
    selectedOption: MultiValue<{ value: string; label: string }>
  ) => {
    const values = selectedOption.map((selected) => {
      return selected;
    });
    setValue("securityGroups", values, { shouldDirty: true });
    setSelectedSecurityGroups(values);
  };

  const organizationSelectHandler = (
    selectedOption: MultiValue<{ value: string; label: string }>
  ) => {
    const values = selectedOption.map((selected) => {
      return selected;
    });
    setValue("organizations", values, { shouldDirty: true });
    setSelectedOrganizations(values);
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Identifier</Form.Label>
        <Form.Control
          readOnly={true}
          type="text"
          defaultValue={user?.identifier}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          readOnly={true}
          type="username"
          defaultValue={user?.username}
        />
      </Form.Group>
      {changePassword ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Change password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              {...register("password", { required: true, minLength: 5 })}
            />
            {errors.password && (
                  <Form.Label className="text-danger">
                    Password must containt at least 5 characters
                  </Form.Label>
                )}
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
      ) : (
        <>
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
              {...register("securityGroups", { required: false })}
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
              {...register("organizations", { required: false })}
              isDisabled={!edit}
              isMulti
              value={selectedOrganizations}
              options={organizations}
              onChange={organizationSelectHandler}
            />
          </Form.Group>
        </>
      )}
      <hr />
      {edit ? (
        <>
          <Button
            className="float-start"
            onClick={() => setChangePassword(!changePassword)}
            hidden={changePassword}
          >
            Change password
          </Button>
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
            onClick={() => {
              setEdit(!edit);
              setChangePassword(false);
            }}
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
            user?.username
          }
          title="Delete user"
          backdrop={true}
        />
      )}
    </Form>
  );
};

export default EditUser;
