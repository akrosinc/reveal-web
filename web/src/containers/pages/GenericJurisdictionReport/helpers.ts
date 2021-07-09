import { DrillDownColumn, DrillDownTableProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import { Cell } from 'react-table';
import {
  ADMINISTERED_LABEL,
  ADVERSE_REACTION,
  DAMAGED_LABEL,
  ELIGIBLE_TARGETED_SPRAY_AREAS,
  ELIGIBLE_TARGETED_SPRAY_AREAS_TIP,
  FEMALE_LABEL,
  FIFTEEN_YEARS_AND_ABOVE,
  FIVE_TO_FOURTEEN_YEARS,
  FOUND_COVERAGE,
  FOUND_COVERAGE_TIP,
  IRS_RED_THRESHOLD,
  MALE_LABEL,
  NAME,
  NAME_TIP,
  OFFICIAL_CENSUS_POP_TARGET,
  ONE_TO_FOUR_YEARS,
  OTHER_POP_COVERAGE,
  OTHER_POP_TARGET,
  PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED,
  PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED_TIP,
  RECEIVED_BY_CDD,
  REMAINING_WITH_CDD,
  RETURNED_TO_SUPERVISOR,
  REVIEW_WITH_DECISION,
  REVIEW_WITH_DECISION_TIP,
  ROOMS_COVERAGE_OF_STRUCTURES_SPRAYED,
  ROOMS_COVERAGE_OF_STRUCTURES_SPRAYED_TIP,
  ROOMS_FOUND,
  ROOMS_FOUND_TIP,
  ROOMS_ON_THE_GROUND,
  ROOMS_ON_THE_GROUND_TIP,
  ROOMS_SPRAYED,
  ROOMS_SPRAYED_TIP,
  SPRAY_COVERAGE_EFFECTIVENESS,
  SPRAY_COVERAGE_EFFECTIVENESS_TIP,
  SPRAY_COVERAGE_OF_TARGETED,
  SPRAY_COVERAGE_OF_TARGETED_TIP,
  SPRAY_SUCCESS_RATE_PMI_SC,
  SPRAY_SUCCESS_RATE_PMI_SC_TIP,
  STRUCTURES_FOUND,
  STRUCTURES_FOUND_TIP,
  STRUCTURES_ON_GROUND,
  STRUCTURES_ON_GROUND_TIP,
  STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE,
  STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE_TIP,
  STRUCTURES_SPRAYED,
  STRUCTURES_SPRAYED_TIP,
  SUCCESS_RATE,
  SUCCESS_RATE_TIP,
  SUPERVISOR_DISTRIBUTED,
  TOTAL_FEMALE,
  TOTAL_MALE,
  TOTAL_SPRAY_AREAS,
  TOTAL_SPRAY_AREAS_TIP,
  TOTAL_SPRAY_AREAS_VISITED,
  TOTAL_SPRAY_AREAS_VISITED_TIP,
  TOTAL_TARGETED_ROOMS,
  TOTAL_TARGETED_ROOMS_TIP,
  TOTAL_TARGETED_STRUCTURES,
  TOTAL_TARGETED_STRUCTURES_TIP,
  TOTAL_TREATED,
  TREATMENT_COVERAGE_CENSUS,
} from '../../../configs/lang';
import { indicatorThresholdsMDALite } from '../../../configs/settings';
import {
  getIRSLiteThresholdAdherenceIndicator,
  getIRSThresholdAdherenceIndicator,
  MDALiteGenderComparison,
  renderCellWithNumberRounded,
  renderHeaderWithTooltip,
  renderPercentage,
  returnedToSupervicerCol,
} from '../../../helpers/indicators';
import { GenericJurisdiction } from '../../../store/ducks/generic/jurisdictions';

/** columns for Namibia IRS jurisdictions */
export const NamibiaColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Structures Targeted',
    accessor: 'jurisdiction_target',
  },
  {
    Header: 'Structures Found',
    accessor: 'structuresfound',
  },
  {
    Header: 'Structures Sprayed',
    accessor: 'structuressprayed',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Target Coverage',
    accessor: 'targetcoverage',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
    sortType: 'basic',
  },
  {
    Header: 'Refusals',
    columns: [
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'refusalsfirst',
        id: 'refusalsfirst',
        sortType: 'basic',
      },
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following mop-up',
        accessor: 'refusalsmopup',
        id: 'refusalsmopup',
        sortType: 'basic',
      },
    ],
  },
  {
    Header: 'Locked',
    columns: [
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following first visit',
        accessor: 'lockedfirst',
        id: 'lockedfirst',
        sortType: 'basic',
      },
      {
        Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, null),
        Header: 'Following mop-up',
        accessor: 'lockedmopup',
        id: 'lockedmopup',
        sortType: 'basic',
      },
    ],
  },
];

/** columns for Zambia IRS jurisdictions */
export const ZambiaJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 360,
  },
  {
    Header: 'Total Spray Areas',
    accessor: 'totareas',
  },
  {
    Header: 'Targeted Spray Areas',
    accessor: 'targareas',
  },
  {
    Header: 'Spray areas visited',
    accessor: 'visitedareas',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: '% visited Spray Areas Effectively sprayed',
    accessor: 'perctvisareaseffect',
    sortType: 'basic',
  },
  {
    Header: 'Total Structures',
    accessor: 'totstruct',
  },
  {
    Header: 'Targeted Structures',
    accessor: 'targstruct',
  },
  {
    Header: 'Sprayed Structures',
    accessor: 'sprayedstruct',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray coverage of targeted (Progress)',
    accessor: 'spraycovtarg',
    sortType: 'basic',
  },
  {
    Header: 'Structures Found',
    accessor: 'foundstruct',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Success Rate',
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
];
export const SenegalJurisdictionsColumns = [
  {
    Header: renderHeaderWithTooltip(NAME, NAME_TIP),
    accessor: 'jurisdiction_name',
    minWidth: 360,
  },
  {
    Header: renderHeaderWithTooltip(TOTAL_SPRAY_AREAS, TOTAL_SPRAY_AREAS_TIP),
    accessor: 'totareas',
  },
  {
    Header: renderHeaderWithTooltip(
      ELIGIBLE_TARGETED_SPRAY_AREAS,
      ELIGIBLE_TARGETED_SPRAY_AREAS_TIP
    ),
    accessor: 'targareas',
  },
  {
    Header: renderHeaderWithTooltip(TOTAL_SPRAY_AREAS_VISITED, TOTAL_SPRAY_AREAS_VISITED_TIP),
    accessor: 'visitedareas',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: renderHeaderWithTooltip(
      PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED,
      PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED_TIP
    ),
    accessor: 'perctvisareaseffect',
    sortType: 'basic',
  },
  {
    Header: renderHeaderWithTooltip(STRUCTURES_ON_GROUND, STRUCTURES_ON_GROUND_TIP),
    accessor: 'totstruct',
  },
  {
    Header: renderHeaderWithTooltip(TOTAL_TARGETED_STRUCTURES, TOTAL_TARGETED_STRUCTURES_TIP),
    accessor: 'targstruct',
  },
  {
    Header: renderHeaderWithTooltip(STRUCTURES_SPRAYED, STRUCTURES_SPRAYED_TIP),
    accessor: 'sprayedstruct',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: renderHeaderWithTooltip(SPRAY_COVERAGE_OF_TARGETED, SPRAY_COVERAGE_OF_TARGETED_TIP),
    accessor: 'spraycovtarg',
    sortType: 'basic',
  },
  {
    Header: renderHeaderWithTooltip(STRUCTURES_FOUND, STRUCTURES_FOUND_TIP),
    accessor: 'foundstruct',
  },
  {
    Cell: (cell: Cell) => renderCellWithNumberRounded(cell),
    Header: renderHeaderWithTooltip(ROOMS_ON_THE_GROUND, ROOMS_ON_THE_GROUND_TIP),
    accessor: 'rooms_on_ground',
  },
  {
    Header: renderHeaderWithTooltip(TOTAL_TARGETED_ROOMS, TOTAL_TARGETED_ROOMS_TIP),
    accessor: 'rooms_eligible',
  },
  {
    Header: renderHeaderWithTooltip(ROOMS_FOUND, ROOMS_FOUND_TIP),
    accessor: 'rooms_found',
  },
  {
    Header: renderHeaderWithTooltip(ROOMS_SPRAYED, ROOMS_SPRAYED_TIP),
    accessor: 'rooms_sprayed',
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: renderHeaderWithTooltip(
      ROOMS_COVERAGE_OF_STRUCTURES_SPRAYED,
      ROOMS_COVERAGE_OF_STRUCTURES_SPRAYED_TIP
    ),
    accessor: 'roomcov',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: renderHeaderWithTooltip(FOUND_COVERAGE, FOUND_COVERAGE_TIP),
    accessor: 'foundcoverage',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: renderHeaderWithTooltip(SUCCESS_RATE, SUCCESS_RATE_TIP),
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
];

/** columns for Zambia IRS Lite jurisdictions */
export const IRSLiteZambiaJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 360,
  },
  {
    Header: 'Total Spray Areas',
    accessor: 'totareas',
  },
  {
    Header: 'Spray Areas Targeted',
    accessor: 'targareas',
  },
  {
    Header: 'Spray Areas Visited',
    accessor: 'visitedareas',
  },
  {
    Header: 'Total Structures',
    accessor: 'totstruct',
  },
  {
    Header: 'Targeted Structures',
    accessor: 'targstruct',
  },
  {
    Header: 'Structures Sprayed',
    accessor: 'sprayed',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: '% Total Structures Sprayed',
    accessor: 'spraycov',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: '% Targeted Structures Sprayed',
    accessor: 'spraycovtarg',
    sortType: 'basic',
  },
  {
    Header: 'Structures Found',
    accessor: 'found',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'foundcoverage',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSLiteThresholdAdherenceIndicator(cell),
    Header: 'Success Rate',
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
];

/** columns for  mda point jurisdictions */
export const mdaJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Total SACs Registered',
    accessor: 'sacregistered',
  },
  {
    Header: 'MMA Coverage',
    accessor: 'mmacov',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'MMA Coverage (%)',
    accessor: 'mmacovper',
    sortType: 'basic',
  },
  {
    Header: 'SACs Refused',
    accessor: 'sacrefused',
  },
  {
    Header: 'SACs Sick/Pregnant/Contraindicated',
    accessor: 'sacrefmedreason',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'ADR Reported (%)',
    accessor: 'mmaadr',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'ADR Severe (%)',
    accessor: 'mmaadrsev',
    sortType: 'basic',
  },
  {
    Header: 'Alb Tablets Distributed',
    accessor: 'albdist',
  },
];

/** columns for Namibia IRS focus (spray) areas */
export const ZambiaFocusAreasColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 360,
  },
  {
    Header: 'Structures on the ground',
    accessor: 'totstruct',
  },
  {
    Header: 'Found',
    accessor: 'foundstruct',
  },
  {
    Header: 'Sprayed',
    accessor: 'sprayedstruct',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray Coverage (Effectiveness)',
    accessor: 'spraycov',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage',
    accessor: 'spraytarg',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Spray Success Rate (PMI SC)',
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderCellWithNumberRounded(cell),
    Header: 'Structures remaining to spray to reach 90% SE',
    accessor: 'structures_remaining_to_90_se',
    sortType: 'basic',
  },
  {
    Header: 'Reviewed with decision',
    accessor: 'reviewed_with_decision',
  },
];

export const SenegalFocusAreasColumns = [
  {
    Header: renderHeaderWithTooltip(NAME, NAME_TIP),
    accessor: 'jurisdiction_name',
    minWidth: 360,
  },
  {
    Header: renderHeaderWithTooltip(TOTAL_SPRAY_AREAS_VISITED, TOTAL_SPRAY_AREAS_VISITED_TIP),
    accessor: 'visitedareas',
  },
  {
    Header: renderHeaderWithTooltip(STRUCTURES_ON_GROUND, STRUCTURES_ON_GROUND_TIP),
    accessor: 'totstruct',
  },
  {
    Header: renderHeaderWithTooltip(STRUCTURES_FOUND, STRUCTURES_FOUND_TIP),
    accessor: 'foundstruct',
  },
  {
    Header: renderHeaderWithTooltip(STRUCTURES_SPRAYED, STRUCTURES_SPRAYED_TIP),
    accessor: 'sprayedstruct',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: renderHeaderWithTooltip(SPRAY_COVERAGE_EFFECTIVENESS, SPRAY_COVERAGE_EFFECTIVENESS_TIP),
    accessor: 'spraycov',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: renderHeaderWithTooltip(FOUND_COVERAGE, FOUND_COVERAGE_TIP),
    accessor: 'spraytarg',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderCellWithNumberRounded(cell),
    Header: renderHeaderWithTooltip(ROOMS_ON_THE_GROUND, ROOMS_ON_THE_GROUND_TIP),
    accessor: 'rooms_on_ground',
  },
  {
    Header: renderHeaderWithTooltip(TOTAL_TARGETED_ROOMS, TOTAL_TARGETED_ROOMS_TIP),
    accessor: 'rooms_eligible',
  },
  {
    Header: renderHeaderWithTooltip(ROOMS_FOUND, ROOMS_FOUND_TIP),
    accessor: 'rooms_found',
  },
  {
    Header: renderHeaderWithTooltip(ROOMS_SPRAYED, ROOMS_SPRAYED_TIP),
    accessor: 'rooms_sprayed',
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: renderHeaderWithTooltip(
      ROOMS_COVERAGE_OF_STRUCTURES_SPRAYED,
      ROOMS_COVERAGE_OF_STRUCTURES_SPRAYED_TIP
    ),
    accessor: 'roomcov',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: renderHeaderWithTooltip(SPRAY_SUCCESS_RATE_PMI_SC, SPRAY_SUCCESS_RATE_PMI_SC_TIP),
    accessor: 'spraysuccess',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderCellWithNumberRounded(cell),
    Header: renderHeaderWithTooltip(
      STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE,
      STRUCTURES_REMAINING_TO_SPRAY_TO_REACH_90_SE_TIP
    ),
    accessor: 'structures_remaining_to_90_se',
    sortType: 'basic',
  },
  {
    Header: renderHeaderWithTooltip(REVIEW_WITH_DECISION, REVIEW_WITH_DECISION_TIP),
    accessor: 'reviewed_with_decision',
  },
];

/** columns for Namibia IRS focus (spray) areas */
export const zambiaMDALowerJurisdictions = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Registered Children Treated (%)',
    accessor: 'registeredchildrentreated_per',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Structures Visited (%)',
    accessor: 'structures_visited_per',
    sortType: 'basic',
  },
  {
    Header: '# Of Children Treated',
    accessor: 'n_events_where_pzqdistributed',
  },
  {
    Header: 'PZQ Tablets Distributed',
    accessor: 'total_pzqdistributed',
  },
];

export const zambiaMDAUpperJurisdictions = zambiaMDALowerJurisdictions.slice();
// add two columns after the first element in the array
zambiaMDAUpperJurisdictions.splice(
  1,
  0,
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Expected Children Found (%)',
    accessor: 'expectedchildren_found',
    sortType: 'basic',
  },
  {
    Cell: (cell: Cell) => renderPercentage(cell),
    Header: 'Expected Children Treated (%)',
    accessor: 'expectedchildren_treated',
    sortType: 'basic',
  }
);
/** columns for  smc point jurisdictions */
export const smcJurisdictionsColumns = [
  {
    Header: 'Name',
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  {
    Header: 'Operational Areas Visited',
    accessor: 'operational_areas_visited',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Distribution Effectiveness (%)',
    accessor: 'distribution_effectivness',
  },
  {
    Header: 'Total Structures',
    accessor: 'total_structures',
  },
  {
    Header: 'Total Found Structures',
    accessor: 'total_found_structures',
  },
  {
    Header: 'Total structures received SPAQ',
    accessor: 'total_structures_recieved_spaq',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Found Coverage %',
    accessor: 'found_coverage',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Distribution Coverage %',
    accessor: 'distribution_coverage',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Treatment Coverage %',
    accessor: 'treatment_coverage',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell),
    Header: 'Referral Treatment Rate %',
    accessor: 'referral_treatment_rate',
  },
];

/** columns for mda Lite jurisdictions */
export const genderReportColumns = [
  {
    Header: MALE_LABEL,
    columns: [
      {
        Header: ONE_TO_FOUR_YEARS,
        accessor: 'treated_male_1_4',
        id: 'maleOneToFour',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS,
        accessor: 'treated_male_5_14',
        id: 'maleOneToFourteen',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE,
        accessor: 'treated_male_above_15',
        id: 'maleGreaterThanFifteen',
        width: '100',
      },
    ],
  },
  {
    Header: FEMALE_LABEL,
    columns: [
      {
        Header: ONE_TO_FOUR_YEARS,
        accessor: 'treated_female_1_4',
        id: 'femaleOneToFour',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS,
        accessor: 'treated_female_5_14',
        id: 'femaleOneToFourteen',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE,
        accessor: 'treated_female_above_15',
        id: 'femaleGreaterThanFifteen',
        width: '100',
      },
    ],
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'total_females', IRS_RED_THRESHOLD),
    Header: TOTAL_MALE,
    accessor: 'total_males',
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'total_males', IRS_RED_THRESHOLD),
    Header: TOTAL_FEMALE,
    accessor: 'total_females',
  },
  {
    Header: TOTAL_TREATED,
    accessor: 'total_all_genders',
  },
];
export const drugDistributionColumns = [
  {
    Header: SUPERVISOR_DISTRIBUTED,
    accessor: 'supervisor_distributed',
  },
  {
    Header: RECEIVED_BY_CDD,
    accessor: 'received_number',
  },
  {
    Header: ADMINISTERED_LABEL,
    accessor: 'adminstered',
  },
  {
    Header: DAMAGED_LABEL,
    accessor: 'damaged',
  },
  {
    Header: REMAINING_WITH_CDD,
    accessor: 'remaining_with_cdd',
  },
  {
    Cell: (cell: Cell) => returnedToSupervicerCol(cell, 'remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: RETURNED_TO_SUPERVISOR,
    accessor: 'returned_to_supervisor',
  },
  {
    Header: ADVERSE_REACTION,
    accessor: 'adverse',
  },
];
export const censusPopColumns = [
  {
    Header: OFFICIAL_CENSUS_POP_TARGET,
    accessor: 'official_population',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALite),
    Header: TREATMENT_COVERAGE_CENSUS,
    accessor: 'treatment_coverage',
  },
  {
    Header: OTHER_POP_TARGET,
    accessor: 'other_pop_target',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALite),
    Header: OTHER_POP_COVERAGE,
    accessor: 'other_pop_coverage',
  },
];
export const mdaLiteJurisdictionsColumns = [
  {
    Header: NAME,
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  ...genderReportColumns,
  ...censusPopColumns,
  ...drugDistributionColumns,
];

/** IRS Table Columns
 * These are all the table columns for IRS that we know about.
 */
export const plansTableColumns: { [key: string]: Array<DrillDownColumn<Dictionary>> } = {
  irsLiteZambiaFocusArea2020: IRSLiteZambiaJurisdictionsColumns,
  irsLiteZambiaJurisdictions2020: IRSLiteZambiaJurisdictionsColumns,
  mdaJurisdictionsColumns,
  mdaLiteJurisdictionsColumns,
  namibia2019: NamibiaColumns,
  senegalFocusArea2021: SenegalFocusAreasColumns,
  senegalJurisdictions2021: SenegalJurisdictionsColumns,
  smcJurisdictionsColumns,
  zambiaFocusArea2019: ZambiaFocusAreasColumns,
  zambiaJurisdictions2019: ZambiaJurisdictionsColumns,
  zambiaMDALower2020: zambiaMDALowerJurisdictions,
  zambiaMDAUpper2020: zambiaMDAUpperJurisdictions,
};

export type TableProps = Pick<
  DrillDownTableProps<Dictionary>,
  | 'columns'
  | 'CellComponent'
  | 'data'
  | 'extraCellProps'
  | 'getTdProps'
  | 'identifierField'
  | 'linkerField'
  | 'paginate'
  | 'parentIdentifierField'
  | 'resize'
  | 'rootParentId'
  | 'useDrillDown'
  | 'renderNullDataComponent'
  | 'hasChildren'
>;

export type GetColumnsToUse = (
  jurisdiction: GenericJurisdiction[],
  jurisdictionColumn: string,
  focusAreaColumn: string,
  focusAreaLevel: string,
  jurisdictionId: string | null
) => Array<DrillDownColumn<Dictionary<{}>>> | null;

/**
 * gets columns to be used
 * @param {GenericJurisdiction[]} jurisdiction - jurisdiction data
 * @param {string} jurisdictionColumn  - The reporting jurisdiction columns
 * @param {string} focusAreaColumn  - Reporting focus area column
 * @param {string} focusAreaLevel - Jurisdiction depth of the lowest level jurisdictions
 * @param {string} jurisdictionId - jurisdiction identifier
 */
export const getColumnsToUse: GetColumnsToUse = (
  jurisdiction: GenericJurisdiction[],
  jurisdictionColumn: string,
  focusAreaColumn: string,
  focusAreaLevel: string,
  jurisdictionId: string | null
) => {
  // we are finding the array of children jurisdictions that are not virtual
  const currLevelData = jurisdiction.filter(el => {
    if (el.jurisdiction_parent_id !== jurisdictionId) {
      return false;
    }
    if (el.hasOwnProperty('is_virtual_jurisdiction') && el.is_virtual_jurisdiction === true) {
      return false;
    }
    return true;
  });

  // Determine if this is a focus area level by checking if "is_leaf_node" exists and is true
  // Otherwise use the focusAreaLevel
  // TODO: remove focusAreaLevel once we fully transition to using "is_leaf_node"
  let isFocusArea: boolean = false;

  if (currLevelData.length > 0) {
    if (currLevelData[0].hasOwnProperty('is_leaf_node')) {
      isFocusArea = currLevelData[0].is_leaf_node;
    } else {
      isFocusArea = currLevelData[0].jurisdiction_depth >= +focusAreaLevel;
    }
  }

  return currLevelData && currLevelData.length > 0 && isFocusArea
    ? get(plansTableColumns, focusAreaColumn, null)
    : get(plansTableColumns, jurisdictionColumn, null);
};
