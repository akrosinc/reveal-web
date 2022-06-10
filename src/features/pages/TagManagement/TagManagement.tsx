import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../../components/AuthGuard';
import { ErrorPage } from '../../../components/pages';
import Tagging from '../../tagging';

const TagManagement = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="my-4 pb-1 px-2">
      <h2>{t('topNav.TagManagement')}</h2>
      <hr />
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard roles={[]}>
              <Tagging />
            </AuthGuard>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Container>
  );
};

export default TagManagement;
