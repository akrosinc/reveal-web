import React from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../components/PageWrapper';
import Tagging from '../../features/tagging/components';
import { Tab, Tabs } from 'react-bootstrap';
import ComplexTagging from '../../features/tagging/components/ComplexTagging';

const TagManagement2 = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper title={t('topNav.TagManagement')}>
      <Tabs id="tag-tabs" className="mb-3" mountOnEnter={true} unmountOnExit={true}>
        <Tab eventKey="simpleTags" title={t('entityTags.simpleTags')}>
          <Tagging />
        </Tab>
        <Tab eventKey="complexTags" title={t('entityTags.complexTags')}>
          <ComplexTagging />
        </Tab>
      </Tabs>
    </PageWrapper>
  );
};

export default TagManagement2;
