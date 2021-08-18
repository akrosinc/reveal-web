import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DrillDownInstanceProps } from '@onaio/drill-down-table';
import React, { useState } from 'react';
import { DropdownMenu } from 'reactstrap';
import uuid from 'uuid/v1';
import { SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS } from '../../../configs/env';
import { CUSTOMIZE_COLUMNS, CUSTOMIZE_COLUMNS_BY_DRUG_FILTER_MESSAGE } from '../../../configs/lang';
import { ALB, ALB_MEB, MBZ, PZQ, VITA } from '../../../constants';
import { DropDownRenderer } from '../../DropDownRenderer';
import './index.css';

export const RevealColumnHider = <T extends object>({ allColumns }: DrillDownInstanceProps<T>) => {
  /** This is where this component might occur more than once in the page, like in FI pages
   * Primarily its to add some noise to the id  for the checkboxes so that they remain unique
   * per page.
   */
  const salt = uuid();
  const anyColumnHidden = allColumns.some(column => !column.isVisible);
  const kenyaDrugs = [PZQ, ALB, MBZ];
  const rwandaDrugs = [PZQ, ALB_MEB, VITA];
  const drugs =
    SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_COLUMNS === 'mdaLiteJurisdictionsColumns'
      ? kenyaDrugs
      : rwandaDrugs;
  const [checkedState, setCheckedState] = useState(new Array(drugs.length).fill(true));
  const handleChange = (position: number) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    setCheckedState(updatedCheckedState);
    const drug = drugs[position];
    allColumns.forEach((column: any) => {
      if (column.drug === drug) {
        column.toggleHidden(checkedState[position]);
      }
    });
  };
  return (
    <>
      <DropDownRenderer
        filterActive={anyColumnHidden}
        // tslint:disable-next-line: jsx-no-lambda
        renderToggle={() => (
          <>
            <span className="mr-2">{CUSTOMIZE_COLUMNS}</span>
            <FontAwesomeIcon icon="cog" />
          </>
        )}
        // tslint:disable-next-line: jsx-no-lambda
        renderMenu={() => (
          <DropdownMenu className="p-3 column-hider" style={{ minWidth: '220px' }}>
            <h6>{CUSTOMIZE_COLUMNS}</h6>
            <p>
              <small>{CUSTOMIZE_COLUMNS_BY_DRUG_FILTER_MESSAGE}</small>
            </p>
            {drugs.map((checkDrug: string, index: number) => (
              <div className="form-check checkbox" key={checkDrug}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  name={checkDrug}
                  checked={checkedState[index]}
                  onChange={() => handleChange(index)}
                  id={`${salt}-${checkDrug}`}
                />
                <label className="form-check-label" htmlFor={`${salt}-${checkDrug}`}>
                  {checkDrug}
                </label>
              </div>
            ))}
          </DropdownMenu>
        )}
      />
    </>
  );
};
