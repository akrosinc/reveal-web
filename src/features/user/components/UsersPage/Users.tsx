import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { UserModel } from '../../../user/providers/types';
import { getUserById, getUserList } from '../../api/';
import { useAppDispatch } from '../../../../store/hooks';
import Paginator from '../../../../components/Pagination';
import { DebounceInput } from 'react-debounce-input';
import CreateUser from './create/CreateUser';
import EditUser from './edit/EditUser';
import { ActionDialog } from '../../../../components/Dialogs';
import { showLoader } from '../../../reducers/loader';
import { PAGINATION_DEFAULT_SIZE, USER_TABLE_COLUMNS } from '../../../../constants';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import { useTranslation } from 'react-i18next';
import DefaultTable from '../../../../components/Table/DefaultTable';

const Users = () => {
  const dispatch = useAppDispatch();
  const [userList, setUserList] = useState<PageableModel<UserModel>>();
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserModel>();
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const { t } = useTranslation();

  const handleClose = () => {
    setShow(false);
    setShowEdit(false);
    getUserList(
      userList?.size ?? PAGINATION_DEFAULT_SIZE,
      userList?.pageable.pageNumber ?? 0,
      currentSearchInput,
      currentSortField,
      currentSortDirection
    ).then(res => {
      setUserList(res);
    });
  };
  const handleShow = () => {
    setShow(true);
  };

  const loadData = useCallback(
    (size: number, page: number, searchData?: string) => {
      dispatch(showLoader(true));
      getUserList(size, page, searchData !== undefined ? searchData : '')
        .then(res => {
          setUserList(res);
        })
        .catch(error => {
          toast.error(error.message);
        })
        .finally(() => {
          dispatch(showLoader(false));
        });
    },
    [dispatch]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const filterData = (e: any) => {
    setCurrentSearchInput(e.target.value);
    loadData(userList?.pageable.pageSize ?? PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const openUserById = (id: string) => {
    dispatch(showLoader(true));
    getUserById(id)
      .then(res => {
        setCurrentUser(res);
        setShowEdit(true);
      })
      .catch(err => toast.error(err.message ? err.message : 'There was an error loading this user.'))
      .finally(() => dispatch(showLoader(false)));
  };

  const sortHanlder = (field: string, sortDirection: boolean) => {
    if (userList !== undefined) {
      setCurrentSortField(field);
      setCurrentSortDirection(sortDirection);
      getUserList(userList.size, 0, currentSearchInput, field, sortDirection).then(res => {
        setUserList(res);
      });
    }
  };

  return (
    <>
      <h2>
        {t('userPage.users')} ({userList?.totalElements ?? 0})
      </h2>
      <Row className="my-4">
        <Col md={8} className="mb-2">
          <Button id="create-user-button" className="btn btn-primary float-end" onClick={() => handleShow()}>
            {t('buttons.create')}
          </Button>
        </Col>
        <Col sm={12} md={4} className="order-md-first">
          <DebounceInput
            id="search-user-input"
            className="form-control"
            placeholder={t('userPage.search')}
            debounceTimeout={800}
            onChange={e => filterData(e)}
            disabled={userList?.totalElements === 0 && currentSearchInput === ''}
          />
        </Col>
      </Row>
      <hr className="my-4" />
      {userList !== undefined && userList.content.length > 0 ? (
        <>
          <DefaultTable
            columns={USER_TABLE_COLUMNS}
            data={userList.content}
            clickHandler={openUserById}
            sortHandler={sortHanlder}
            clickAccessor="identifier"
          />
          <Paginator
            totalElements={userList.totalElements}
            page={userList.pageable.pageNumber}
            size={userList.size}
            totalPages={userList.totalPages}
            paginationHandler={paginationHandler}
          />
        </>
      ) : null}
      {show && <CreateUser show={show} handleClose={handleClose} />}
      {showEdit && currentUser && (
        <ActionDialog
          closeHandler={handleClose}
          element={<EditUser handleClose={handleClose} user={currentUser} />}
          title="User details"
        />
      )}
    </>
  );
};

export default Users;
