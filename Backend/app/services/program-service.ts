import { json } from "@remix-run/node";
import { MongooseError } from "mongoose";
import { z } from "zod";
import { FOCUS_AREAS, FocusAreasValue } from "~/constants/focus-area";
import { SCHEDULE_TYPE, ScheduleTypeValue } from "~/constants/schedule-types";
import {
    TARGET_AUDIENCE,
    TargetAudienceValue,
} from "~/constants/target-audiences";
import { ServiceResult } from "~/interfaces/service-result";
import { IProgram, Program } from "~/models/program";
import { IUser } from "~/models/user";
import { WorkoutPrototype } from "~/models/workout-prototype";
import {
    IBuildQueryConfig,
    addPaginationAndSorting,
    buildPopulateOptions,
    buildQueryFromSearchParams,
} from "~/utils/util.server";
import {
    CreateProgramInput,
    UpdateProgramInput,
} from "~/validation/program.server";

// Defined search Params usable by Program Services + Populate Options where applicable
const queryConfig: IBuildQueryConfig = addPaginationAndSorting({
    name: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.string().min(1),
    },
    userId: {
        isArray: false,
        constructor: String,
        schema: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    },
    scheduleType: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.enum(
            Object.values(SCHEDULE_TYPE) as [
                ScheduleTypeValue,
                ...ScheduleTypeValue[],
            ],
        ),
    },
    focusAreas: {
        isArray: true,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.enum(
            Object.values(FOCUS_AREAS) as [
                FocusAreasValue,
                ...FocusAreasValue[],
            ],
        ),
    },
    targetAudience: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value),
        schema: z.enum(
            Object.values(TARGET_AUDIENCE) as [
                TargetAudienceValue,
                ...TargetAudienceValue[],
            ],
        ),
    },
});

export const createProgram = async (
    user: IUser,
    createData: CreateProgramInput,
): Promise<ServiceResult<IProgram>> => {
    try {
        const { workoutSchedule } = createData;

        const workoutIds: string[] = (workoutSchedule || [])
            .map((item) => item.workoutId?.toString())
            .filter((id): id is string => !!id);

        const validWorkouts = await WorkoutPrototype.find({
            _id: { $in: workoutIds },
            userId: user._id,
        })
            .select("_id")
            .lean();

        const validWorkoutIds = validWorkouts.map((workout) =>
            workout._id.toString(),
        );

        const invalidWorkouts = workoutIds.filter(
            (id) => !validWorkoutIds.includes(id),
        );

        if (invalidWorkouts.length > 0) {
            throw json(
                {
                    error: "Invalid workout IDs provided",
                    invalidWorkouts,
                },
                {
                    status: 400,
                },
            );
        }

        const newProgram: IProgram = await Program.create({
            ...createData,
            userId: user._id,
        });

        return {
            message: "Program created successfully",
            data: newProgram,
        };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const updateProgram = async (
    user: IUser,
    programId: string,
    updateData: UpdateProgramInput,
): Promise<ServiceResult<IProgram>> => {
    try {
        const program = await Program.findOne({ _id: programId });

        if (!program) {
            throw json(
                { error: "Program not found" },
                {
                    status: 404,
                },
            );
        }

        if (program.userId.toString() !== user._id.toString()) {
            throw json(
                {
                    error: "You are not authorized to update this program",
                },
                {
                    status: 403,
                },
            );
        }

        Object.assign(program, updateData);
        await program.save();

        return {
            status: 200,
            message: "Program updated successfully",
            data: program,
        };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const deleteProgram = async (
    user: IUser,
    programId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const program = await Program.findOne({ _id: programId }).lean();

        if (!program) {
            throw json({ error: "Program not found" }, { status: 404 });
        }

        if (program.userId.toString() !== user._id.toString()) {
            throw json({
                status: 403,
                error: "You are not authorized to delete this program",
            });
        }

        await Program.deleteOne({ _id: programId });

        return {
            message: "Program deleted successfully",
        };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const readPrograms = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IProgram[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams(searchParams, queryConfig) as any;

        const mine = searchParams.get("mine") === "true";
        const userId = searchParams.get("userId");

        if (mine) {
            query.userId = user._id;
        } else if (userId) {
            query.userId = userId;
            query.isPublic = true;
        } else {
            query.isPublic = true;
        }

        const sortOption: Record<string, 1 | -1> | null = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : null;

        let queryObj = Program.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option: string | string[]) => {
            queryObj = queryObj.populate(option);
        });

        const programs = await queryObj.lean();

        const totalCount = await Program.countDocuments(query).exec();

        const hasMore = offset + programs.length < totalCount;

        return { status: 200, data: programs, hasMore };
    } catch (error) {
        if (error instanceof MongooseError) {
            throw json({
                status: 400,
                error: "Bad request, ensure that the query is valid",
            });
        }
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const readProgramById = async (
    user: IUser,
    programId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IProgram>> => {
    try {
        let query = Program.findById(programId);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            query = query.populate(option);
        });

        const program = await query.lean();

        if (!program) {
            throw json(
                { error: "Program not found" },
                {
                    status: 404,
                },
            );
        }

        if (
            !program.isPublic &&
            program.userId.toString() !== user._id.toString()
        ) {
            throw json({
                status: 403,
                error: "Forbidden: You do not have access to this program",
            });
        }

        return { data: program };
    } catch (error) {
        if (error instanceof MongooseError) {
            throw json({
                status: 400,
                error: "Bad request, ensure that the query is valid",
            });
        }
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};
