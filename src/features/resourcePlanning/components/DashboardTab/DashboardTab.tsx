import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { RootState } from '../../../../store/store';

const DashboardTab = () => {
  const dashboardData = useSelector((state: RootState) => state.resourceConfig.dashboardData);
  const [columns, setColumns] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any>();

  const tableColumns = useMemo(() => {
    return columns.map(el => {
      return {
        name: el,
        accessor: el,
        key: el === 'name' ? undefined : 'value'
      };
    });
  }, [columns]);

  useEffect(() => {
    if (dashboardData && dashboardData.length) {
      console.log(dashboardData[0].columnDataMap);
      const cols = ['name', ...Object.keys(dashboardData[0].columnDataMap)];
      setColumns(cols);
      console.log(
        dashboardData.map(el => {
          return {
            ...el.columnDataMap,
            name: el.name,
            id: el.identifier
          };
        })
      );
      setTableData(
        dashboardData.map(el => {
          return {
            ...el.columnDataMap,
            name: el.name,
            id: el.identifier
          };
        })
      );
    }
  }, [dashboardData]);

  return (
    <div>
      {tableData ? (
        <DefaultTable columns={tableColumns} data={tableData} clickHandler={el => console.log(el)} />
      ) : (
        <p>No data found.</p>
      )}
    </div>
  );
};

export default DashboardTab;
