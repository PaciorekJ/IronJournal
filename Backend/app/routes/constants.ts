import { json, LoaderFunctionArgs } from "@remix-run/node";
import { CATEGORY } from "~/constants/category";
import { DAYS_OF_WEEK } from "~/constants/days-of-week";
import { EQUIPMENT } from "~/constants/equipment";
import { FOCUS_AREAS } from "~/constants/focus-area";
import { FORCE } from "~/constants/force";
import { INTENSITY_LEVEL } from "~/constants/intensity-levels";
import { LEVEL } from "~/constants/level";
import { MECHANIC } from "~/constants/mechanic";
import { MUSCLE_GROUPS } from "~/constants/muscle-groups";
import { SCHEDULE_TYPE } from "~/constants/schedule-types";
import { SET_TYPES } from "~/constants/set-types";
import { TARGET_AUDIENCE } from "~/constants/target-audiences";
import { WEIGHT_SELECTION_METHOD } from "~/constants/weight-selection";
import { requireAuth } from "~/utils/auth.server";
import { convertKeysToCamelCase } from "~/utils/util.server";

export type ProgramConstantId = // slugs to access program constants on the route level
  | 'focus-areas'
  | 'schedule-types'
  | 'target-audiences'
  | 'days-of-week';
export const PROGRAM_CONSTANTS_MAP: Record<ProgramConstantId, any> = {
    'focus-areas': Object.values(FOCUS_AREAS),
    'schedule-types': Object.values(SCHEDULE_TYPE),
    'target-audiences': Object.values(TARGET_AUDIENCE),
    'days-of-week': Object.values(DAYS_OF_WEEK),
};

export type ExerciseConstantId = // slugs to access exercise constants on the route level
  | 'forces' 
  | 'levels' 
  | 'mechanics' 
  | 'equipment' 
  | 'categories' 
  | 'muscle-groups'; 
export const EXERCISE_CONSTANTS_MAP: Record<ExerciseConstantId, any> = {
  'forces': Object.values(FORCE),
  'levels': Object.values(LEVEL),
  'mechanics': Object.values(MECHANIC),
  'equipment': Object.values(EQUIPMENT),
  'categories': Object.values(CATEGORY),
  'muscle-groups': Object.values(MUSCLE_GROUPS),
};

export type WorkoutConstantId = // slugs to access workout constants on the route level
	| 'intensity-levels';
export const WORKOUT_CONSTANTS_MAP: Record<WorkoutConstantId, any> = {
	'intensity-levels': Object.values(INTENSITY_LEVEL),
}

export type SetConstantId = 
  | 'set-types' 
  | 'weight-selection-methods';
export const SET_CONSTANTS_MAP: Record<SetConstantId, any> = {
  'set-types': Object.values(SET_TYPES),
  'weight-selection-methods': Object.values(WEIGHT_SELECTION_METHOD),
};

export const loader = async ({request}: LoaderFunctionArgs) => {
  await requireAuth(request);
  
	return json({
		...convertKeysToCamelCase(EXERCISE_CONSTANTS_MAP),
		...convertKeysToCamelCase(PROGRAM_CONSTANTS_MAP),
		...convertKeysToCamelCase(WORKOUT_CONSTANTS_MAP),
		...convertKeysToCamelCase(SET_CONSTANTS_MAP),
	});
};