import { json } from "@remix-run/node";
import { RootFilterQuery } from "mongoose";
import { z } from "zod";
import { CATEGORY, CategoryKey } from "~/constants/category";
import { EQUIPMENT, EquipmentKey } from "~/constants/equipment";
import { FORCE, ForceKey } from "~/constants/force";
import { LEVEL, LevelKey } from "~/constants/level";
import { MUSCLE_GROUP, MuscleGroupKey } from "~/constants/muscle-group";
import { ServiceResult } from "~/interfaces/service-result";
import { Exercise, IExercise } from "~/models/exercise";
import {
    addPaginationAndSorting,
    buildQueryFromSearchParams,
    IBuildQueryConfig,
} from "~/utils/util.server";

// Defined search Params usable by Exercise Services
const queryConfig: IBuildQueryConfig = addPaginationAndSorting({
    name: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.string().min(1),
    },
    level: {
        isArray: false,
        constructor: String,
        schema: z.enum(Object.keys(LEVEL) as [LevelKey, ...LevelKey[]]),
    },
    category: {
        isArray: false,
        constructor: String,
        schema: z.enum(
            Object.keys(CATEGORY) as [CategoryKey, ...CategoryKey[]],
        ),
    },
    force: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.enum(Object.keys(FORCE) as [ForceKey, ...ForceKey[]]),
    },
    equipment: {
        isArray: true,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.enum(
            Object.keys(EQUIPMENT) as [EquipmentKey, ...EquipmentKey[]],
        ),
    },
    primaryMuscles: {
        isArray: true,
        constructor: String,
        schema: z.enum(
            Object.keys(MUSCLE_GROUP) as [MuscleGroupKey, ...MuscleGroupKey[]],
        ),
    },
    secondaryMuscles: {
        isArray: true,
        constructor: String,
        schema: z.enum(
            Object.keys(MUSCLE_GROUP) as [MuscleGroupKey, ...MuscleGroupKey[]],
        ),
    },
});

export const readExercises = async (
    searchParams: URLSearchParams,
): Promise<ServiceResult<IExercise[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IExercise>(searchParams, queryConfig);

        const sortOption: Record<string, 1 | -1> | undefined = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : undefined;

        const exercises = await Exercise.find(
            query as RootFilterQuery<IExercise>,
        )
            .sort(sortOption)
            .skip(offset)
            .limit(limit)
            .lean()
            .exec();

        const totalCount = await Exercise.countDocuments(
            query as RootFilterQuery<IExercise>,
        ).exec();
        const hasMore = offset + exercises.length < totalCount;

        return { data: exercises, hasMore };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const readExerciseById = async (
    exerciseId: string,
): Promise<ServiceResult<IExercise>> => {
    try {
        const exercise = await Exercise.findById(exerciseId).lean().exec();

        if (!exercise) {
            throw json({ error: "Exercise not found" }, { status: 404 });
        }

        return { data: exercise };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};
