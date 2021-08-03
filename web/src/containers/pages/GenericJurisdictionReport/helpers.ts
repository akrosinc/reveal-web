import { DrillDownColumn, DrillDownTableProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import { Cell } from 'react-table';
import {
  ALB,
  ALB_ADMINISTERED,
  ALB_ADVERSE_REACTION,
  ALB_DAMAGED,
  ALB_RECEIVED_BY_CDD,
  ALB_RETURNED_TO_SUPERVISOR,
  ALB_SUPERVISOR_DISTRIBUTED,
  ELIGIBLE_TARGETED_SPRAY_AREAS,
  ELIGIBLE_TARGETED_SPRAY_AREAS_TIP,
  FEMALE_LABEL,
  FIFTEEN_YEARS_AND_ABOVE_ALB,
  FIFTEEN_YEARS_AND_ABOVE_MBZ,
  FIFTEEN_YEARS_AND_ABOVE_PZQ,
  FIVE_TO_FOURTEEN_YEARS_ALB,
  FIVE_TO_FOURTEEN_YEARS_MBZ,
  FIVE_TO_FOURTEEN_YEARS_PZQ,
  FOUND_COVERAGE,
  FOUND_COVERAGE_TIP,
  IRS_RED_THRESHOLD,
  MALE_LABEL,
  MBZ,
  MBZ_ADMINISTERED,
  MBZ_ADVERSE_REACTION,
  MBZ_DAMAGED,
  MBZ_RECEIVED_BY_CDD,
  MBZ_RETURNED_TO_SUPERVISOR,
  MBZ_SUPERVISOR_DISTRIBUTED,
  NAME,
  NAME_TIP,
  OFFICIAL_CENSUS_POP_TARGET,
  ONE_TO_FOUR_YEARS_ALB,
  ONE_TO_FOUR_YEARS_MBZ,
  OTHER_POP_COVERAGE,
  OTHER_POP_TARGET,
  PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED,
  PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED_TIP,
  PZQ,
  PZQ_ADMINISTERED,
  PZQ_ADVERSE_REACTION,
  PZQ_DAMAGED,
  PZQ_RECEIVED_BY_CDD,
  PZQ_RETURNED_TO_SUPERVISOR,
  PZQ_SUPERVISOR_DISTRIBUTED,
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
  SIXTEEN_YEARS_AND_ABOVE_PZQ,
  SIXTEN_YEARS_AND_ABOVE_ALB,
  SIXTEN_YEARS_AND_ABOVE_MEB,
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
  TOTAL_ADVERSE_REACTION,
  TOTAL_FEMALE_ALB,
  TOTAL_FEMALE_MBZ,
  TOTAL_FEMALE_PZQ,
  TOTAL_MALE_ALB,
  TOTAL_MALE_MBZ,
  TOTAL_MALE_PZQ,
  TOTAL_SPRAY_AREAS,
  TOTAL_SPRAY_AREAS_TIP,
  TOTAL_SPRAY_AREAS_VISITED,
  TOTAL_SPRAY_AREAS_VISITED_TIP,
  TOTAL_TARGETED_ROOMS,
  TOTAL_TARGETED_ROOMS_TIP,
  TOTAL_TARGETED_STRUCTURES,
  TOTAL_TARGETED_STRUCTURES_TIP,
  TOTAL_TREATED_ALB,
  TOTAL_TREATED_MBZ,
  TOTAL_TREATED_PZQ,
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
        Header: ONE_TO_FOUR_YEARS_ALB,
        accessor: 'alb_treated_male_1_4',
        drug: ALB,
        id: 'maleOneToFourALB',
        width: '100',
      },
      {
        Header: ONE_TO_FOUR_YEARS_MBZ,
        accessor: 'mbz_treated_male_1_4',
        drug: MBZ,
        id: 'maleOneToFourMBZ',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_PZQ,
        accessor: 'pzq_treated_male_5_14',
        drug: PZQ,
        id: 'maleFiveToFourteenPZQ',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_ALB,
        accessor: 'alb_treated_male_5_14',
        drug: ALB,
        id: 'maleFiveToFourteenALB',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_MBZ,
        accessor: 'mbz_treated_male_5_14',
        drug: MBZ,
        id: 'maleFiveToFourteenMBZ',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_PZQ,
        accessor: 'pzq_treated_male_above_15',
        drug: PZQ,
        id: 'maleGreaterThanFifteenPZQ',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_ALB,
        accessor: 'alb_treated_male_above_15',
        drug: ALB,
        id: 'maleGreaterThanFifteenALB',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_MBZ,
        accessor: 'mbz_treated_male_above_15',
        drug: MBZ,
        id: 'maleGreaterThanFifteenMBZ',
        width: '100',
      },
    ],
  },
  {
    Header: FEMALE_LABEL,
    columns: [
      {
        Header: ONE_TO_FOUR_YEARS_ALB,
        accessor: 'alb_treated_female_1_4',
        drug: ALB,
        id: 'femaleOneToFourALB',
        width: '100',
      },
      {
        Header: ONE_TO_FOUR_YEARS_MBZ,
        accessor: 'mbz_treated_female_1_4',
        drug: MBZ,
        id: 'femaleOneToFourMBZ',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_PZQ,
        accessor: 'pzq_treated_female_5_14',
        drug: PZQ,
        id: 'femaleOneToFourteenPZQ',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_ALB,
        accessor: 'alb_treated_female_5_14',
        drug: ALB,
        id: 'femaleOneToFourteenALB',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_MBZ,
        accessor: 'mbz_treated_female_5_14',
        drug: MBZ,
        id: 'femaleOneToFourteenMBZ',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_PZQ,
        accessor: 'pzq_treated_female_above_15',
        drug: PZQ,
        id: 'femaleGreaterThanFifteenPZQ',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_ALB,
        accessor: 'alb_treated_female_above_15',
        drug: ALB,
        id: 'femaleGreaterThanFifteenALB',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_MBZ,
        accessor: 'mbz_treated_female_above_15',
        drug: MBZ,
        id: 'femaleGreaterThanFifteenMBZ',
        width: '100',
      },
    ],
  },
];
export const genderReportColumnsRwanda = [
  {
    Header: MALE_LABEL,
    columns: [
      {
        Header: SIXTEEN_YEARS_AND_ABOVE_PZQ,
        accessor: 'pzq_treated_male_above_16',
        drug: PZQ,
        id: 'maleGreaterThanSixteenPZQ',
        width: '100',
      },
      {
        Header: SIXTEN_YEARS_AND_ABOVE_ALB,
        accessor: 'alb_treated_male_above_16',
        drug: ALB,
        id: 'maleGreaterThanSixteenALB',
        width: '100',
      },
      {
        Header: SIXTEN_YEARS_AND_ABOVE_MEB,
        accessor: 'meb_treated_male_above_16',
        drug: ALB,
        id: 'maleGreaterThanSixteenMEB',
        width: '100',
      },
    ],
  },
  {
    Header: FEMALE_LABEL,
    columns: [
      {
        Header: SIXTEEN_YEARS_AND_ABOVE_PZQ,
        accessor: 'pzq_treated_female_above_16',
        drug: PZQ,
        id: 'femaleGreaterThanSixteenPZQ',
        width: '100',
      },
      {
        Header: SIXTEN_YEARS_AND_ABOVE_ALB,
        accessor: 'alb_treated_female_above_16',
        drug: ALB,
        id: 'femaleGreaterThanSixteenALB',
        width: '100',
      },
      {
        Header: SIXTEN_YEARS_AND_ABOVE_MEB,
        accessor: 'meb_treated_female_above_16',
        drug: ALB,
        id: 'femaleGreaterThanSixteenMEB',
        width: '100',
      },
    ],
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'pzq_total_females', IRS_RED_THRESHOLD),
    Header: TOTAL_MALE_PZQ,
    accessor: 'pqz_total_males',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'alb_total_females', IRS_RED_THRESHOLD),
    Header: TOTAL_MALE_ALB,
    accessor: 'alb_total_males',
    drug: ALB,
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'mbz_total_females', IRS_RED_THRESHOLD),
    Header: TOTAL_MALE_MBZ,
    accessor: 'mbz_total_males',
    drug: MBZ,
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'pzq_total_males', IRS_RED_THRESHOLD),
    Header: TOTAL_FEMALE_PZQ,
    accessor: 'pzq_total_females',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'alb_total_males', IRS_RED_THRESHOLD),
    Header: TOTAL_FEMALE_ALB,
    accessor: 'alb_total_females',
    drug: ALB,
  },
  {
    Cell: (cell: Cell) => MDALiteGenderComparison(cell, 'mbz_total_males', IRS_RED_THRESHOLD),
    Header: TOTAL_FEMALE_MBZ,
    accessor: 'mbz_total_females',
    drug: MBZ,
  },
  {
    Header: TOTAL_TREATED_PZQ,
    accessor: 'pzq_total_all_genders',
    drug: PZQ,
  },
  {
    Header: TOTAL_TREATED_ALB,
    accessor: 'alb_total_all_genders',
    drug: ALB,
  },
  {
    Header: TOTAL_TREATED_MBZ,
    accessor: 'mbz_total_all_genders',
    drug: MBZ,
  },
];

export const drugDistributionColumns = [
  {
    Header: PZQ_SUPERVISOR_DISTRIBUTED,
    accessor: 'pzq_supervisor_distributed',
    drug: PZQ,
  },
  {
    Header: ALB_SUPERVISOR_DISTRIBUTED,
    accessor: 'alb_supervisor_distributed',
    drug: ALB,
  },
  {
    Header: MBZ_SUPERVISOR_DISTRIBUTED,
    accessor: 'mbz_supervisor_distributed',
    drug: MBZ,
  },
  {
    Header: PZQ_RECEIVED_BY_CDD,
    accessor: 'pzq_received',
    drug: PZQ,
  },
  {
    Header: ALB_RECEIVED_BY_CDD,
    accessor: 'alb_received',
    drug: ALB,
  },
  {
    Header: MBZ_RECEIVED_BY_CDD,
    accessor: 'mbz_received',
    drug: MBZ,
  },
  {
    Header: PZQ_ADMINISTERED,
    accessor: 'pzq_administered',
    drug: PZQ,
  },
  {
    Header: ALB_ADMINISTERED,
    accessor: 'alb_administered',
    drug: ALB,
  },
  {
    Header: MBZ_ADMINISTERED,
    accessor: 'mbz_administered',
    drug: MBZ,
  },
  {
    Header: PZQ_DAMAGED,
    accessor: 'pzq_damaged',
    drug: PZQ,
  },
  {
    Header: ALB_DAMAGED,
    accessor: 'alb_damaged',
    drug: ALB,
  },
  {
    Header: MBZ_DAMAGED,
    accessor: 'mbz_damaged',
    drug: MBZ,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'pzq_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: PZQ_RETURNED_TO_SUPERVISOR,
    accessor: 'pzq_returned_to_supervisor',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'alb_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: ALB_RETURNED_TO_SUPERVISOR,
    accessor: 'alb_returned_to_supervisor',
    drug: ALB,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'mbz_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: MBZ_RETURNED_TO_SUPERVISOR,
    accessor: 'mbz_returned_to_supervisor',
    drug: MBZ,
  },
  {
    Header: PZQ_ADVERSE_REACTION,
    accessor: 'pzq_adverse',
    drug: PZQ,
  },
  {
    Header: ALB_ADVERSE_REACTION,
    accessor: 'alb_adverse',
    drug: ALB,
  },
  {
    Header: MBZ_ADVERSE_REACTION,
    accessor: 'mbz_adverse',
    drug: MBZ,
  },
  {
    Header: TOTAL_ADVERSE_REACTION,
    accessor: 'adverse',
    drug: 'totals',
  },
];
export const drugDistributionColumnsRwanda = [...genderReportColumns];

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

export const mdaLiteJurisdictionsColumnsRwanda = [
  {
    Header: NAME,
    accessor: 'jurisdiction_name',
    minWidth: 180,
  },
  ...genderReportColumnsRwanda,
  ...censusPopColumns,
  ...drugDistributionColumnsRwanda,
];

/** IRS Table Columns
 * These are all the table columns for IRS that we know about.
 */
export const plansTableColumns: { [key: string]: Array<DrillDownColumn<Dictionary>> } = {
  irsLiteZambiaFocusArea2020: IRSLiteZambiaJurisdictionsColumns,
  irsLiteZambiaJurisdictions2020: IRSLiteZambiaJurisdictionsColumns,
  mdaJurisdictionsColumns,
  mdaLiteJurisdictionsColumns,
  mdaLiteJurisdictionsColumnsRwanda,
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
  | 'renderInTopFilterBar'
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
