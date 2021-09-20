import { DrillDownColumn, DrillDownTableProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import { Cell } from 'react-table';
import {
  ALB_ADMINISTERED,
  ALB_ADVERSE_REACTION,
  ALB_COORDINATOR_DISTRIBUTED,
  ALB_DAMAGED,
  ALB_MBZ_TOTAL_TREATED,
  ALB_MEB_12_TO_59_MOS_OTHER_POP_COVERAGE,
  ALB_MEB_12_TO_59_MOS_TREATMENT_COVERAGE,
  ALB_MEB_5_TO_15_YEARS_OTHER_POP_COVERAGE_TRUSTED,
  ALB_MEB_5_TO_15_YEARS_TREATMENT_COVERAGE,
  ALB_MEB_ABOVE_16_YEARS_OTHER_POP_COVERAGE,
  ALB_MEB_ABOVE_16_YEARS_TREATMENT_COVERAGE,
  ALB_MEB_TOTAL_TREATED,
  ALB_MEB_TOTAL_TREATED_12_TO_59_MOS,
  ALB_MEB_TOTAL_TREATED_16_YEARS_AND_ABOVE,
  ALB_MEB_TOTAL_TREATED_5_TO_15_YEARS,
  ALB_RECEIVED_BY_CDD,
  ALB_RECEIVED_BY_CHW,
  ALB_REMAINING_WITH_CDD,
  ALB_REMAINING_WITH_CHW,
  ALB_RETURNED_TO_COORDINATOR,
  ALB_RETURNED_TO_SUPERVISOR,
  ALB_SUPERVISOR_DISTRIBUTED,
  ALB_TOTAL_FEMALE,
  ALB_TOTAL_TREATED,
  CENSUS_POP_TARGET_12_TO_59_MOS_OFFICIAL,
  CENSUS_POP_TARGET_16_AND_ABOVE_OFFICIAL,
  CENSUS_POP_TARGET_5_TO_15_YEARS_OFFICIAL,
  CENSUS_POP_TARGET_5_YEARS_AND_ADULTS_ABOVE_16,
  CENSUS_POP_TARGET_6_TO_11_MOS_OFFICIAL,
  CENSUS_POP_TARGET_6_TO_59_MOS_OFFICIAL,
  ELIGIBLE_TARGETED_SPRAY_AREAS,
  ELIGIBLE_TARGETED_SPRAY_AREAS_TIP,
  FEMALE_LABEL,
  FIFTEEN_YEARS_AND_ABOVE_ALB,
  FIFTEEN_YEARS_AND_ABOVE_MBZ,
  FIFTEEN_YEARS_AND_ABOVE_PZQ,
  FIVE_TO_FIFTEEN_YEARS_ALB,
  FIVE_TO_FIFTEEN_YEARS_MEB,
  FIVE_TO_FIFTEEN_YEARS_PZQ,
  FIVE_TO_FOURTEEN_YEARS_ALB,
  FIVE_TO_FOURTEEN_YEARS_MBZ,
  FIVE_TO_FOURTEEN_YEARS_PZQ,
  FOUND_COVERAGE,
  FOUND_COVERAGE_TIP,
  HEALTH_EDUCATION_AGES_5_TO_15,
  HEALTH_EDUCATION_AGES_ABOVE_16,
  IRS_RED_THRESHOLD,
  MALE_LABEL,
  MBZ_ADMINISTERED,
  MBZ_ADVERSE_REACTION,
  MBZ_DAMAGED,
  MBZ_RECEIVED_BY_CDD,
  MBZ_REMAINING_WITH_CDD,
  MBZ_RETURNED_TO_SUPERVISOR,
  MBZ_SUPERVISOR_DISTRIBUTED,
  MEB_ADMINISTERED,
  MEB_ADVERSE_REACTION,
  MEB_COORDINATOR_DISTRIBUTED,
  MEB_DAMAGED,
  MEB_RECEIVED_BY_CHW,
  MEB_REMAINING_WITH_CHW,
  MEB_RETURNED_TO_COORDINATOR,
  MEB_TOTAL_FEMALE,
  MEB_TOTAL_MALE,
  MEB_TOTAL_TREATED,
  NAME,
  NAME_TIP,
  OFFICIAL_CENSUS_POP_TARGET,
  ONE_TO_FOUR_YEARS_ALB,
  ONE_TO_FOUR_YEARS_MBZ,
  ONE_TO_FOUR_YEARS_VITA,
  OTHER_POP_COVERAGE,
  OTHER_POP_TARGET,
  OTHER_POP_TARGET_12_TO_59_MOS_TRUSTED,
  OTHER_POP_TARGET_16_YEARS_ABOVE_TRUSTED,
  OTHER_POP_TARGET_5_TO_15_YEARES_TRUSTED,
  OTHER_POP_TARGET_6_TO_11_MOS_TRUSTED,
  OTHER_POP_TARGET_6_TO_59_MOS_TRUSTED,
  OTHER_POP_TARGET_FROM_5_YEARS_TO_ABOVE_16_TRUSTED,
  PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED,
  PERCENTAGE_VISITED_SPRAY_AREAS_EFFECTIVELY_SPRAYED_TIP,
  PZQ_16_YEARS_AND_ABOVE_OTHER_POP_COVERAGE,
  PZQ_16_YEARS_AND_ABOVE_TREATMENT_COVERAGE,
  PZQ_5_TO_15_YEARS_OTHER_POP_COVERAGE_TRUSTED,
  PZQ_5_TO_15_YEARS_TREATMENT_COVERAGE,
  PZQ_5_YEARS_ABOVE_16_OTHER_POP_COVERAGE,
  PZQ_5_YEARS_AND_ADULT_ABOVE_16_TREATMENT_COVERAGE,
  PZQ_ADMINISTERED,
  PZQ_ADVERSE_REACTION,
  PZQ_COORDINATOR_DISTRIBUTED,
  PZQ_DAMAGED,
  PZQ_RECEIVED_BY_CDD,
  PZQ_RECEIVED_BY_CHW,
  PZQ_REMAINING_WITH_CDD,
  PZQ_REMAINING_WITH_CHW,
  PZQ_RETURNED_TO_COORDINATOR,
  PZQ_RETURNED_TO_SUPERVISOR,
  PZQ_SUPERVISOR_DISTRIBUTED,
  PZQ_TOTAL_TREATED,
  PZQ_TOTAL_TREATED_16_YEARS_AND_ABOVE,
  PZQ_TOTAL_TREATED_5_15_YEARS,
  PZQ_TOTAL_TREATED_5_AND_16_PLUS,
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
  SIX_TO_ELEVEN_MONTHS_VITA,
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
  TOTAL_FEMALE_MBZ,
  TOTAL_FEMALE_PZQ,
  TOTAL_FEMALE_VITA,
  TOTAL_MALE_ALB,
  TOTAL_MALE_MBZ,
  TOTAL_MALE_PZQ,
  TOTAL_MALE_VITA,
  TOTAL_SPRAY_AREAS,
  TOTAL_SPRAY_AREAS_TIP,
  TOTAL_SPRAY_AREAS_VISITED,
  TOTAL_SPRAY_AREAS_VISITED_TIP,
  TOTAL_TARGETED_ROOMS,
  TOTAL_TARGETED_ROOMS_TIP,
  TOTAL_TARGETED_STRUCTURES,
  TOTAL_TARGETED_STRUCTURES_TIP,
  TREATMENT_COVERAGE_CENSUS,
  TWELVE_TO_FIFTY_NINE_MONTHS_ALB,
  TWELVE_TO_FIFTY_NINE_MONTHS_MEB,
  VITA_12_TO_59_MOS_OTHER_POP_COVERAGE,
  VITA_12_TO_59_TREATMENT_COVERAGE,
  VITA_6_TO_11_MOS_OTHER_POP_COVERAGE,
  VITA_6_TO_11_MOS_TREATMENT_COVERAGE_CENSUS,
  VITA_6_TO_59_MOS_TREATMENT_COVERAGE,
  VITA_6_TO_69_MOS_OTHER_POP_COVERAGE_TRUSTED,
  VITA_ADMINISTERED,
  VITA_ADVERSE_REACTION,
  VITA_COORDINATOR_DISTRIBUTED,
  VITA_DAMAGED,
  VITA_RECEIVED_BY_CHW,
  VITA_REMAINING_WITH_CHW,
  VITA_RETURNED_TO_COORDINATOR,
  VITA_TOTAL_TREATED,
  VITA_TOTAL_TREATED_12_TO_59_MOS,
  VITA_TOTAL_TREATED_6_TO_11_MOS,
} from '../../../configs/lang';
import {
  indicatorThresholdsMDALite,
  indicatorThresholdsMDALiteRwanda,
} from '../../../configs/settings';
import { ALB_MBZ, ALB_MEB, PZQ, VITA } from '../../../constants';
import {
  getIRSLiteThresholdAdherenceIndicator,
  getIRSThresholdAdherenceIndicator,
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
        drug: ALB_MBZ,
        id: 'maleOneToFourALB',
        width: '100',
      },
      {
        Header: ONE_TO_FOUR_YEARS_MBZ,
        accessor: 'mbz_treated_male_1_4',
        drug: ALB_MBZ,
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
        drug: ALB_MBZ,
        id: 'maleFiveToFourteenALB',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_MBZ,
        accessor: 'mbz_treated_male_5_14',
        drug: ALB_MBZ,
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
        drug: ALB_MBZ,
        id: 'maleGreaterThanFifteenALB',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_MBZ,
        accessor: 'mbz_treated_male_above_15',
        drug: ALB_MBZ,
        id: 'maleGreaterThanFifteenMBZ',
        width: '100',
      },
      {
        Header: TOTAL_MALE_PZQ,
        accessor: 'pzq_total_male',
        drug: PZQ,
        id: 'totalMalePZQ',
        width: '100',
      },
      {
        Header: TOTAL_MALE_ALB,
        accessor: 'alb_total_male',
        drug: ALB_MBZ,
        id: 'totalMaleALB',
        width: '100',
      },
      {
        Header: TOTAL_MALE_MBZ,
        accessor: 'meb_total_male',
        drug: ALB_MBZ,
        id: 'totalMaleMBZ',
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
        drug: ALB_MBZ,
        id: 'femaleOneToFourALB',
        width: '100',
      },
      {
        Header: ONE_TO_FOUR_YEARS_MBZ,
        accessor: 'mbz_treated_female_1_4',
        drug: ALB_MBZ,
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
        drug: ALB_MBZ,
        id: 'femaleOneToFourteenALB',
        width: '100',
      },
      {
        Header: FIVE_TO_FOURTEEN_YEARS_MBZ,
        accessor: 'mbz_treated_female_5_14',
        drug: ALB_MBZ,
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
        drug: ALB_MBZ,
        id: 'femaleGreaterThanFifteenALB',
        width: '100',
      },
      {
        Header: FIFTEEN_YEARS_AND_ABOVE_MBZ,
        accessor: 'mbz_treated_female_above_15',
        drug: ALB_MBZ,
        id: 'femaleGreaterThanFifteenMBZ',
        width: '100',
      },
      {
        Header: TOTAL_FEMALE_PZQ,
        accessor: 'pzq_total_female',
        drug: PZQ,
        id: 'totalFemalePZQ',
        width: '100',
      },
      {
        Header: ALB_TOTAL_FEMALE,
        accessor: 'alb_total_female',
        drug: ALB_MBZ,
        id: 'totalFemaleALB',
        width: '100',
      },
      {
        Header: TOTAL_FEMALE_MBZ,
        accessor: 'meb_total_female',
        drug: ALB_MBZ,
        id: 'totalFemaleMBZ',
        width: '100',
      },
    ],
  },
  {
    Header: PZQ_TOTAL_TREATED,
    accessor: 'pzq_total_treated',
    drug: PZQ,
    width: '100',
  },
  {
    Header: ALB_MBZ_TOTAL_TREATED,
    accessor: 'alb_mbz_total_treated',
    drug: ALB_MBZ,
    width: '100',
  },
];
export const genderReportColumnsRwanda = [
  {
    Header: HEALTH_EDUCATION_AGES_5_TO_15,
    accessor: 'health_education_5_to_15',
    id: 'healthEducationAges5To15',
    width: '100',
  },
  {
    Header: HEALTH_EDUCATION_AGES_ABOVE_16,
    accessor: 'health_education_above_16',
    id: 'healthEducationAgesAbove16',
    width: '100',
  },
  {
    Header: MALE_LABEL,
    columns: [
      {
        Header: SIX_TO_ELEVEN_MONTHS_VITA,
        accessor: 'vita_treated_male_6_to_11_mos',
        drug: VITA,
        id: 'maleSixToElevenMonthsVITA',
        width: '100',
      },
      {
        Header: ONE_TO_FOUR_YEARS_VITA,
        accessor: 'vita_treated_male_1_4',
        drug: VITA,
        id: 'maleOneToFourYearsVITA',
        width: '100',
      },
      {
        Header: TWELVE_TO_FIFTY_NINE_MONTHS_ALB,
        accessor: 'alb_treated_male_1_4',
        drug: ALB_MEB,
        id: 'maleOneToFourYearsALB',
        width: '100',
      },
      {
        Header: TWELVE_TO_FIFTY_NINE_MONTHS_MEB,
        accessor: 'meb_treated_male_1_4',
        drug: ALB_MEB,
        id: 'maleOneToFourYearsMEB',
        width: '100',
      },
      {
        Header: FIVE_TO_FIFTEEN_YEARS_PZQ,
        accessor: 'pzq_treated_male_5_15',
        drug: PZQ,
        id: 'maleFiveToFifteenPZQ',
        width: '100',
      },
      {
        Header: FIVE_TO_FIFTEEN_YEARS_ALB,
        accessor: 'alb_treated_male_5_15',
        drug: ALB_MEB,
        id: 'maleFiveToFifteenALB',
        width: '100',
      },
      {
        Header: FIVE_TO_FIFTEEN_YEARS_MEB,
        accessor: 'meb_treated_male_5_15',
        drug: ALB_MEB,
        id: 'maleFiveToFifteenMEB',
        width: '100',
      },
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
        drug: ALB_MEB,
        id: 'maleGreaterThanSixteenALB',
        width: '100',
      },
      {
        Header: SIXTEN_YEARS_AND_ABOVE_MEB,
        accessor: 'meb_treated_male_above_16',
        drug: ALB_MEB,
        id: 'maleGreaterThanSixteenMEB',
        width: '100',
      },
      {
        Header: TOTAL_MALE_VITA,
        accessor: 'vita_total_male',
        drug: VITA,
        id: 'totalMaleVITA',
        width: '100',
      },
      {
        Header: TOTAL_MALE_PZQ,
        accessor: 'pzq_total_male',
        drug: PZQ,
        id: 'totalMalePZQ',
        width: '100',
      },
      {
        Header: MEB_TOTAL_MALE,
        accessor: 'meb_total_male',
        drug: ALB_MEB,
        id: 'totalMaleMEB',
        width: '100',
      },
      {
        Header: TOTAL_MALE_ALB,
        accessor: 'alb_total_male',
        drug: ALB_MEB,
        id: 'totalMaleALB',
        width: '100',
      },
    ],
  },
  {
    Header: FEMALE_LABEL,
    columns: [
      {
        Header: SIX_TO_ELEVEN_MONTHS_VITA,
        accessor: 'vita_treated_female_6_to_11_mos',
        drug: VITA,
        id: 'femaleSixToElevenMonthsVITA',
        width: '100',
      },
      {
        Header: ONE_TO_FOUR_YEARS_VITA,
        accessor: 'vita_treated_female_1_4',
        drug: VITA,
        id: 'femaleOneToFourYearsVITA',
        width: '100',
      },
      {
        Header: TWELVE_TO_FIFTY_NINE_MONTHS_ALB,
        accessor: 'alb_treated_female_1_4',
        drug: ALB_MEB,
        id: 'femaleOneToFourYearsALB',
        width: '100',
      },
      {
        Header: TWELVE_TO_FIFTY_NINE_MONTHS_MEB,
        accessor: 'meb_treated_female_1_4',
        drug: ALB_MEB,
        id: 'femaleOneToFourYearsMEB',
        width: '100',
      },
      {
        Header: FIVE_TO_FIFTEEN_YEARS_PZQ,
        accessor: 'pzq_treated_female_5_15',
        drug: PZQ,
        id: 'femaleFiveToFifteenPZQ',
        width: '100',
      },
      {
        Header: FIVE_TO_FIFTEEN_YEARS_ALB,
        accessor: 'alb_treated_female_5_15',
        drug: ALB_MEB,
        id: 'femaleFiveToFifteenALB',
        width: '100',
      },
      {
        Header: FIVE_TO_FIFTEEN_YEARS_MEB,
        accessor: 'meb_treated_female_5_15',
        drug: ALB_MEB,
        id: 'femaleFiveToFifteenMEB',
        width: '100',
      },
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
        drug: ALB_MEB,
        id: 'femaleGreaterThanSixteenALB',
        width: '100',
      },
      {
        Header: SIXTEN_YEARS_AND_ABOVE_MEB,
        accessor: 'meb_treated_female_above_16',
        drug: ALB_MEB,
        id: 'femaleGreaterThanSixteenMEB',
        width: '100',
      },
      {
        Header: TOTAL_FEMALE_VITA,
        accessor: 'vita_total_female',
        drug: VITA,
        id: 'totalFemaleVITA',
        width: '100',
      },
      {
        Header: TOTAL_FEMALE_PZQ,
        accessor: 'pzq_total_female',
        drug: PZQ,
        id: 'totalFemalePZQ',
        width: '100',
      },
      {
        Header: ALB_TOTAL_FEMALE,
        accessor: 'alb_total_female',
        drug: ALB_MEB,
        id: 'totalFemaleALB',
        width: '100',
      },
      {
        Header: MEB_TOTAL_FEMALE,
        accessor: 'meb_total_female',
        drug: ALB_MEB,
        id: 'totalFemaleMEB',
        width: '100',
      },
    ],
  },
  {
    Header: VITA_TOTAL_TREATED,
    accessor: 'vita_total_treated',
    drug: VITA,
  },
  {
    Header: PZQ_TOTAL_TREATED_5_AND_16_PLUS,
    accessor: 'pzq_total_treated',
    drug: PZQ,
  },
  {
    Header: ALB_TOTAL_TREATED,
    accessor: 'alb_total_treated',
    drug: ALB_MEB,
  },
  {
    Header: MEB_TOTAL_TREATED,
    accessor: 'meb_total_treated',
    drug: ALB_MEB,
  },
  {
    Header: ALB_MEB_TOTAL_TREATED,
    accessor: 'alb_meb_total_treated',
    drug: ALB_MEB,
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
    drug: ALB_MBZ,
  },
  {
    Header: MBZ_SUPERVISOR_DISTRIBUTED,
    accessor: 'mbz_supervisor_distributed',
    drug: ALB_MBZ,
  },
  {
    Header: PZQ_RECEIVED_BY_CDD,
    accessor: 'pzq_received',
    drug: PZQ,
  },
  {
    Header: ALB_RECEIVED_BY_CDD,
    accessor: 'alb_received',
    drug: ALB_MBZ,
  },
  {
    Header: MBZ_RECEIVED_BY_CDD,
    accessor: 'mbz_received',
    drug: ALB_MBZ,
  },
  {
    Header: PZQ_ADMINISTERED,
    accessor: 'pzq_administered',
    drug: PZQ,
  },
  {
    Header: ALB_ADMINISTERED,
    accessor: 'alb_administered',
    drug: ALB_MBZ,
  },
  {
    Header: MBZ_ADMINISTERED,
    accessor: 'mbz_administered',
    drug: ALB_MBZ,
  },
  {
    Header: PZQ_DAMAGED,
    accessor: 'pzq_damaged',
    drug: PZQ,
  },
  {
    Header: PZQ_REMAINING_WITH_CDD,
    accessor: 'pzq_remaining_with_cdd',
    drug: PZQ,
  },
  {
    Header: ALB_DAMAGED,
    accessor: 'alb_damaged',
    drug: ALB_MBZ,
  },
  {
    Header: ALB_REMAINING_WITH_CDD,
    accessor: 'alb_remaining_with_cdd',
    drug: ALB_MBZ,
  },
  {
    Header: MBZ_DAMAGED,
    accessor: 'mbz_damaged',
    drug: ALB_MBZ,
  },
  {
    Header: MBZ_REMAINING_WITH_CDD,
    accessor: 'mbz_remaining_with_cdd',
    drug: ALB_MBZ,
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
    drug: ALB_MBZ,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'mbz_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: MBZ_RETURNED_TO_SUPERVISOR,
    accessor: 'mbz_returned_to_supervisor',
    drug: ALB_MBZ,
  },
  {
    Header: PZQ_ADVERSE_REACTION,
    accessor: 'pzq_adverse',
    drug: PZQ,
  },
  {
    Header: ALB_ADVERSE_REACTION,
    accessor: 'alb_adverse',
    drug: ALB_MBZ,
  },
  {
    Header: MBZ_ADVERSE_REACTION,
    accessor: 'mbz_adverse',
    drug: ALB_MBZ,
  },
];
export const drugDistributionColumnsRwanda = [
  {
    Header: PZQ_COORDINATOR_DISTRIBUTED,
    accessor: 'pzq_supervisor_distributed',
    drug: PZQ,
  },
  {
    Header: ALB_COORDINATOR_DISTRIBUTED,
    accessor: 'alb_supervisor_distributed',
    drug: ALB_MEB,
  },
  {
    Header: MEB_COORDINATOR_DISTRIBUTED,
    accessor: 'meb_supervisor_distributed',
    drug: ALB_MEB,
  },
  {
    Header: VITA_COORDINATOR_DISTRIBUTED,
    accessor: 'vita_supervisor_distributed',
    drug: VITA,
  },
  {
    Header: PZQ_RECEIVED_BY_CHW,
    accessor: 'pzq_received',
    drug: PZQ,
  },
  {
    Header: ALB_RECEIVED_BY_CHW,
    accessor: 'alb_received',
    drug: ALB_MEB,
  },
  {
    Header: MEB_RECEIVED_BY_CHW,
    accessor: 'meb_received',
    drug: ALB_MEB,
  },
  {
    Header: VITA_RECEIVED_BY_CHW,
    accessor: 'vita_received',
    drug: VITA,
  },
  {
    Header: PZQ_ADMINISTERED,
    accessor: 'pzq_administered',
    drug: PZQ,
  },
  {
    Header: ALB_ADMINISTERED,
    accessor: 'alb_administered',
    drug: ALB_MEB,
  },
  {
    Header: MEB_ADMINISTERED,
    accessor: 'meb_administered',
    drug: ALB_MEB,
  },
  {
    Header: VITA_ADMINISTERED,
    accessor: 'vita_administered',
    drug: VITA,
  },
  {
    Header: PZQ_DAMAGED,
    accessor: 'pzq_damaged',
    drug: PZQ,
  },
  {
    Header: ALB_DAMAGED,
    accessor: 'alb_damaged',
    drug: ALB_MEB,
  },
  {
    Header: MEB_DAMAGED,
    accessor: 'meb_damaged',
    drug: ALB_MEB,
  },
  {
    Header: VITA_DAMAGED,
    accessor: 'vita_damaged',
    drug: VITA,
  },
  {
    Header: PZQ_REMAINING_WITH_CHW,
    accessor: 'pzq_remaining_with_cdd',
    drug: PZQ,
  },
  {
    Header: MEB_REMAINING_WITH_CHW,
    accessor: 'meb_remaining_with_cdd',
    drug: ALB_MEB,
  },
  {
    Header: ALB_REMAINING_WITH_CHW,
    accessor: 'alb_remaining_with_cdd',
    drug: ALB_MEB,
  },
  {
    Header: VITA_REMAINING_WITH_CHW,
    accessor: 'vita_remaining_with_cdd',
    drug: VITA,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'pzq_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: PZQ_RETURNED_TO_COORDINATOR,
    accessor: 'pzq_returned_to_supervisor',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'alb_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: ALB_RETURNED_TO_COORDINATOR,
    accessor: 'alb_returned_to_supervisor',
    drug: ALB_MEB,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'meb_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: MEB_RETURNED_TO_COORDINATOR,
    accessor: 'mbz_returned_to_supervisor',
    drug: ALB_MEB,
  },
  {
    Cell: (cell: Cell) =>
      returnedToSupervicerCol(cell, 'vita_remaining_with_cdd', IRS_RED_THRESHOLD),
    Header: VITA_RETURNED_TO_COORDINATOR,
    accessor: 'vita_returned_to_supervisor',
    drug: VITA,
  },
  {
    Header: PZQ_ADVERSE_REACTION,
    accessor: 'pzq_adverse',
    drug: PZQ,
  },
  {
    Header: ALB_ADVERSE_REACTION,
    accessor: 'alb_adverse',
    drug: ALB_MEB,
  },
  {
    Header: MEB_ADVERSE_REACTION,
    accessor: 'meb_adverse',
    drug: ALB_MEB,
  },
  {
    Header: VITA_ADVERSE_REACTION,
    accessor: 'vita_adverse',
    drug: VITA,
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
export const censusPopColumnsRwanda = [
  {
    Header: CENSUS_POP_TARGET_6_TO_59_MOS_OFFICIAL,
    accessor: 'census_target_population_6_to_59_mos_official',
    drug: VITA,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: VITA_6_TO_59_MOS_TREATMENT_COVERAGE,
    accessor: 'vita_6_to_59_mos_treatment_coverage',
    drug: VITA,
  },
  {
    Header: OTHER_POP_TARGET_6_TO_59_MOS_TRUSTED,
    accessor: 'other_pop_target_6_to_59_mos_trusted',
    drug: VITA,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: VITA_6_TO_69_MOS_OTHER_POP_COVERAGE_TRUSTED,
    accessor: 'vita_6_to_59_mos_other_pop_coverage',
    drug: VITA,
  },
  {
    Header: VITA_TOTAL_TREATED_6_TO_11_MOS,
    accessor: 'vita_total_treated_6_to_11_mos',
    drug: VITA,
  },
  {
    Header: CENSUS_POP_TARGET_6_TO_11_MOS_OFFICIAL,
    accessor: 'census_target_population_6_to_11_mos_official',
    drug: VITA,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: VITA_6_TO_11_MOS_TREATMENT_COVERAGE_CENSUS,
    accessor: 'vita_6_to_11_mos_treatment_coverage',
    drug: VITA,
  },
  {
    Header: OTHER_POP_TARGET_6_TO_11_MOS_TRUSTED,
    accessor: 'other_pop_target_6_to_11_mos_trusted',
    drug: VITA,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: VITA_6_TO_11_MOS_OTHER_POP_COVERAGE,
    accessor: 'vita_6_to_11_mos_other_pop_coverage',
    drug: VITA,
  },
  {
    Header: VITA_TOTAL_TREATED_12_TO_59_MOS,
    accessor: 'vita_total_treated_1_4',
    drug: VITA,
  },
  {
    Header: CENSUS_POP_TARGET_12_TO_59_MOS_OFFICIAL,
    accessor: 'census_target_population_12_to_59_mos_official',
    drug: VITA,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: VITA_12_TO_59_TREATMENT_COVERAGE,
    accessor: 'vita_treatment_coverage_1_to_4',
    drug: VITA,
  },
  {
    Header: OTHER_POP_TARGET_12_TO_59_MOS_TRUSTED,
    accessor: 'other_pop_target_12_to_59_mos_trusted',
    drug: VITA,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: VITA_12_TO_59_MOS_OTHER_POP_COVERAGE,
    accessor: 'vita_1_to_4_years_other_pop_coverage',
    drug: VITA,
  },
  {
    Header: CENSUS_POP_TARGET_5_YEARS_AND_ADULTS_ABOVE_16,
    accessor: 'census_pop_target_5_to_15_and_above_16_official',
    drug: PZQ,
  },
  {
    Header: CENSUS_POP_TARGET_5_YEARS_AND_ADULTS_ABOVE_16,
    accessor: 'census_pop_target_5_to_15_and_above_16_official',
    drug: ALB_MEB,
    id: 'albMEBCensusPopTable5To15AndAbove16',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: PZQ_5_YEARS_AND_ADULT_ABOVE_16_TREATMENT_COVERAGE,
    accessor: 'pzq_5_years_and_above_16_treatment_coverage',
    drug: PZQ,
  },
  {
    Header: OTHER_POP_TARGET_FROM_5_YEARS_TO_ABOVE_16_TRUSTED,
    accessor: 'other_pop_target_5_to_15_and_above_16_trusted',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: PZQ_5_YEARS_ABOVE_16_OTHER_POP_COVERAGE,
    accessor: 'pzq_5_years_above_16_other_pop_coverage',
    drug: PZQ,
  },
  {
    Header: PZQ_TOTAL_TREATED_5_15_YEARS,
    accessor: 'pzq_total_treated_5_to_15',
    drug: PZQ,
  },
  {
    Header: CENSUS_POP_TARGET_5_TO_15_YEARS_OFFICIAL,
    accessor: 'census_pop_target_5_to_15_official',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: PZQ_5_TO_15_YEARS_TREATMENT_COVERAGE,
    accessor: 'pzq_5_to_15_years_treatment_coverage',
    drug: PZQ,
  },
  {
    Header: OTHER_POP_TARGET_5_TO_15_YEARES_TRUSTED,
    accessor: 'other_pop_target_5_to_15_trusted',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: PZQ_5_TO_15_YEARS_OTHER_POP_COVERAGE_TRUSTED,
    accessor: 'pzq_5_to_15_years_other_pop_coverage',
    drug: PZQ,
  },
  {
    Header: PZQ_TOTAL_TREATED_16_YEARS_AND_ABOVE,
    accessor: 'pzq_total_treated_above_16',
    drug: PZQ,
  },
  {
    Header: CENSUS_POP_TARGET_16_AND_ABOVE_OFFICIAL,
    accessor: 'census_pop_target_above_16_official',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: PZQ_16_YEARS_AND_ABOVE_TREATMENT_COVERAGE,
    accessor: 'pzq_above_16_years_treatment_coverage',
    drug: PZQ,
  },
  {
    Header: OTHER_POP_TARGET_16_YEARS_ABOVE_TRUSTED,
    accessor: 'other_pop_target_above_16_trusted',
    drug: PZQ,
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: PZQ_16_YEARS_AND_ABOVE_OTHER_POP_COVERAGE,
    accessor: 'pzq_above_16_years_other_pop_coverage',
    drug: PZQ,
  },
  {
    Header: ALB_MEB_TOTAL_TREATED_12_TO_59_MOS,
    accessor: 'alb_meb_total_treated_1_4',
    drug: ALB_MEB,
  },
  {
    Header: CENSUS_POP_TARGET_12_TO_59_MOS_OFFICIAL,
    accessor: 'census_target_population_12_to_59_mos_official',
    drug: ALB_MEB,
    id: 'albMEB12To59PopulationOfficial',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: ALB_MEB_12_TO_59_MOS_TREATMENT_COVERAGE,
    accessor: 'alb_meb_treatment_coverage_1_to_4',
    drug: ALB_MEB,
  },
  {
    Header: OTHER_POP_TARGET_12_TO_59_MOS_TRUSTED,
    accessor: 'other_pop_target_12_to_59_mos_trusted',
    drug: ALB_MEB,
    id: 'albMEBOtherPopTarget12To59MosTrusted',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: ALB_MEB_12_TO_59_MOS_OTHER_POP_COVERAGE,
    accessor: 'alb_meb_1_to_4_years_other_pop_coverage',
    drug: ALB_MEB,
  },
  {
    Header: ALB_MEB_TOTAL_TREATED_5_TO_15_YEARS,
    accessor: 'alb_meb_total_treated_5_15',
    drug: ALB_MEB,
  },
  {
    Header: CENSUS_POP_TARGET_5_TO_15_YEARS_OFFICIAL,
    accessor: 'census_pop_target_5_to_15_official',
    drug: ALB_MEB,
    id: 'albMEBCensusPopTarget5To15',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: ALB_MEB_5_TO_15_YEARS_TREATMENT_COVERAGE,
    accessor: 'alb_meb_5_to_15_years_treatment_coverage',
    drug: ALB_MEB,
  },
  {
    Header: OTHER_POP_TARGET_5_TO_15_YEARES_TRUSTED,
    accessor: 'other_pop_target_5_to_15_trusted',
    drug: ALB_MEB,
    id: 'albMEBOtherPopTarget5To15Trusted',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: ALB_MEB_5_TO_15_YEARS_OTHER_POP_COVERAGE_TRUSTED,
    accessor: 'alb_meb_5_to_15_years_other_pop_coverage',
    drug: ALB_MEB,
  },
  {
    Header: ALB_MEB_TOTAL_TREATED_16_YEARS_AND_ABOVE,
    accessor: 'alb_meb_total_treated_above_16',
    drug: ALB_MEB,
  },
  {
    Header: CENSUS_POP_TARGET_16_AND_ABOVE_OFFICIAL,
    accessor: 'census_pop_target_above_16_official',
    drug: ALB_MEB,
    id: 'albMEBCensusPopTargetAbove16',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: ALB_MEB_ABOVE_16_YEARS_TREATMENT_COVERAGE,
    accessor: 'alb_meb_above_16_treatment_coverage',
    drug: ALB_MEB,
  },
  {
    Header: OTHER_POP_TARGET_16_YEARS_ABOVE_TRUSTED,
    accessor: 'other_pop_target_above_16_trusted',
    drug: ALB_MEB,
    id: 'albMEBOtherPopTargetAbove16',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALiteRwanda),
    Header: ALB_MEB_ABOVE_16_YEARS_OTHER_POP_COVERAGE,
    accessor: 'alb_meb_above_16_pop_coverage',
    drug: ALB_MEB,
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
  ...censusPopColumnsRwanda,
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
