import { Dictionary } from '@onaio/utils';
import { TASK_GREEN, TASK_ORANGE, TASK_YELLOW } from '../../../../colors';
import {
  ALB_ADMINISTERED,
  ALB_OTHER_POP_COVERAGE,
  ALB_TREATMENT_COVERAGE_CENSUS,
  DRUGS_IN_WARD_ALB,
  DRUGS_IN_WARD_MBZ,
  DRUGS_IN_WARD_PZQ,
  MBZ_ADMINISTERED,
  MBZ_OTHER_POP_COVERAGE,
  MBZ_TREATMENT_COVERAGE_CENSUS,
  PEOPLE,
  PZQ_ADMINISTERED,
  PZQ_OTHER_POP_COVERAGE,
  PZQ_TREATMENT_COVERAGE_CENSUS,
  TABLET,
  TOTAL_TREATED,
} from '../../../../configs/lang';
import { IndicatorThresholdItemPercentage } from '../../../../helpers/utils';

/** The default indicator stop */
export const defaultIndicatorStop = [
  ['Complete', TASK_GREEN],
  ['In Progress', TASK_ORANGE],
  ['Not Visited', TASK_YELLOW],
];

/** IRS Lite Indicator stops
 * These are all the indicator stops for IRS Lite that we know about.
 */
export const MDALiteIndicatorStops: { [key: string]: string[][] } = {
  kenya2021: defaultIndicatorStop,
};

/** interface to describe and indicator row item */
export interface MDAIndicatorRowItem {
  accessor: string;
  denominator?: string | number;
  description?: string;
  listDisplay?: boolean;
  numerator?: string | number;
  percentage?: string;
  title: string;
  value?: any;
  unit?: string;
}

/** the indicator row type */
export type IndicatorRows = MDAIndicatorRowItem[];

/** IRS Indicator rows
 * These are all the indicator rows for IRS that we know about.
 */
export const MDAIndicatorRows: { [key: string]: IndicatorRows } = {
  kenya2021: [
    {
      accessor: 'pzq_treatment_coverage',
      denominator: 'official_population',
      description: '',
      numerator: 'pzq_total_treated',
      title: PZQ_TREATMENT_COVERAGE_CENSUS,
      unit: PEOPLE,
    },
    {
      accessor: 'alb_treatment_coverage',
      denominator: 'official_population',
      description: '',
      numerator: 'alb_total_treated',
      title: ALB_TREATMENT_COVERAGE_CENSUS,
      unit: PEOPLE,
    },
    {
      accessor: 'mbz_treatment_coverage',
      denominator: 'official_population',
      description: '',
      numerator: 'meb_total_treated',
      title: MBZ_TREATMENT_COVERAGE_CENSUS,
      unit: PEOPLE,
    },
    {
      accessor: 'pzq_other_pop_coverage',
      denominator: 'other_pop_target',
      description: '',
      numerator: 'pzq_total_treated',
      title: PZQ_OTHER_POP_COVERAGE,
      unit: PEOPLE,
    },
    {
      accessor: 'alb_other_pop_coverage',
      denominator: 'other_pop_target',
      description: '',
      numerator: 'alb_total_treated',
      title: ALB_OTHER_POP_COVERAGE,
      unit: PEOPLE,
    },
    {
      accessor: 'mbz_other_pop_coverage',
      denominator: 'other_pop_target',
      description: '',
      numerator: 'meb_total_treated',
      title: MBZ_OTHER_POP_COVERAGE,
      unit: PEOPLE,
    },
    {
      accessor: 'total_all_genders',
      listDisplay: true,
      title: TOTAL_TREATED,
      unit: PEOPLE,
    },
    {
      accessor: 'pzq_administered',
      listDisplay: true,
      title: PZQ_ADMINISTERED,
      unit: TABLET,
    },
    {
      accessor: 'alb_administered',
      listDisplay: true,
      title: ALB_ADMINISTERED,
      unit: TABLET,
    },
    {
      accessor: 'mbz_administered',
      listDisplay: true,
      title: MBZ_ADMINISTERED,
      unit: TABLET,
    },
    {
      accessor: 'pz_remaining_with_cdd',
      listDisplay: true,
      title: DRUGS_IN_WARD_PZQ,
      unit: TABLET,
    },
    {
      accessor: 'alb_remaining_with_cdd',
      listDisplay: true,
      title: DRUGS_IN_WARD_ALB,
      unit: TABLET,
    },
    {
      accessor: 'mbz_remaining_with_cdd',
      listDisplay: true,
      title: DRUGS_IN_WARD_MBZ,
      unit: TABLET,
    },
  ],
};

export const getMDAIndicatorRows = (indicatorRows: IndicatorRows, subcountyData: Dictionary[]) => {
  const rowOfInterest = [...indicatorRows];
  const data = subcountyData[0] || {};
  indicatorRows.forEach((item: MDAIndicatorRowItem, idx: number) => {
    const rowValue = data[item.accessor] || 0;
    let percentage = '0%';
    if (!item.listDisplay) {
      percentage = IndicatorThresholdItemPercentage(data[item.accessor] || 0) || '0%';
    }
    rowOfInterest[idx] = {
      ...item,
      denominator: item.denominator ? data[item.denominator] : '0',
      numerator: item.numerator ? data[item.numerator] : '0',
      percentage: percentage.replace('%', ''),
      value: rowValue,
    };
  });
  return rowOfInterest;
};
