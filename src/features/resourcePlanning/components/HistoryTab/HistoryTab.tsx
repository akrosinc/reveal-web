import React, { useEffect, useState } from 'react';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { RESOURCE_PLANNING_HISTORY_TABLE_COLUMNS } from '../../../../constants';
import { getResourceHistory } from '../../api';
import { ResourcePlanningHistory } from '../../providers/types';

const HistoryTab = () => {
  const [historyList, setHistoryList] = useState<ResourcePlanningHistory[]>([]);

  useEffect(() => {
    getResourceHistory().then(res => setHistoryList(res));
  }, [])

  return (
    <>
      <h2>Planning History ({historyList.length})</h2>
      <hr />
      {historyList.length > 0 ? (
        <DefaultTable columns={RESOURCE_PLANNING_HISTORY_TABLE_COLUMNS} data={historyList} />
      ) : (
        <p>No data found.</p>
      )}
    </>
  );
};

export default HistoryTab;
