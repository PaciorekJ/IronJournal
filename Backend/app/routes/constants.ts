import { json } from "@remix-run/node";
import { CATEGORY } from "~/constants/category";
import { EQUIPMENT } from "~/constants/equipment";
import { FOCUS_AREAS } from "~/constants/focus-area";
import { FORCE } from "~/constants/force";
import { INTENSITY_LEVEL } from "~/constants/intensity-levels";
import { LEVEL } from "~/constants/level";
import { MECHANIC } from "~/constants/mechanic";
import { MUSCLE_GROUPS } from "~/constants/muscle-groups";
import { SCHEDULE_TYPE } from "~/constants/schedule-types";
import { TARGET_AUDIENCE } from "~/constants/target-audiences";
import { convertKeysToCamelCase } from "~/utils/util.server";

export type ProgramConstantId = // slugs to access program constants on the route level
  | 'focus-areas'
  | 'schedule-types'
  | 'target-audiences';
export const PROGRAM_CONSTANTS_MAP: Record<ProgramConstantId, any> = {
    'focus-areas': Object.values(FOCUS_AREAS),
    'schedule-types': Object.values(SCHEDULE_TYPE),
    'target-audiences': Object.values(TARGET_AUDIENCE),
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

export const loader = () => {
	return json({
		...convertKeysToCamelCase(EXERCISE_CONSTANTS_MAP),
		...convertKeysToCamelCase(PROGRAM_CONSTANTS_MAP),
		...convertKeysToCamelCase(WORKOUT_CONSTANTS_MAP),
	});
};
