import React from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import { ErrorPage } from '../../components/pages';
import PageWrapper from '../../components/PageWrapper';
import Tagging from '../../features/tagging/components';

const TagManagement = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper title={t('topNav.TagManagement')}>
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
    </PageWrapper>
  );
};

export default TagManagement;
