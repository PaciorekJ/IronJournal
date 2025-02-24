import {
    ILocalizedProgram,
    IProgram,
    IUser,
    IWorkout,
    IWorkoutSchedule,
    LANGUAGE,
    LanguageKey,
    Program,
    resolveLocalizedProgram,
    TranslationTask,
    Workout,
} from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import { localizeDataInput } from "~/utils/localization.server";
import {
    batchDeleteCachedCensoredText,
    censorText,
    setCensorTiers,
} from "~/utils/profanityFilter.server";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    IQueryField,
    programQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import {
    IProgramCreateDTO,
    IProgramUpdateDTO,
} from "~/validation/program.server";
import { censorWorkout } from "./workout";

export const censorProgram = async (
    user: IUser,
    program: IProgram,
): Promise<IProgram> => {
    setCensorTiers(user.profanityAcceptedTiers);
    const locales = [user.languagePreference, program.originalLanguage];

    for (const locale of locales) {
        // *** Censor Name ***
        program.name[locale] = await censorText(
            program.name[locale],
            `program-${program._id}-name-${locale}`,
            locale,
        );

        // *** Censor Description (if it exists) ***
        if (program.description?.[locale]) {
            program.description[locale] = await censorText(
                program.description[locale],
                `program-${program._id}-description-${locale}`,
                locale,
            );
        }
    }

    // *** Censor Workouts inside Workout Schedule (if populated) ***
    if (program.workoutSchedule) {
        for (const schedule of program.workoutSchedule) {
            if (
                schedule.workoutIds?.length &&
                typeof schedule.workoutIds[0] === "object"
            ) {
                schedule.workoutIds = (await Promise.all(
                    (schedule.workoutIds as unknown as IWorkout[]).map(
                        (workout) => censorWorkout(user, workout),
                    ),
                )) as unknown as mongoose.Schema.Types.ObjectId[];
            }
        }
    }

    return program;
};

const deleteCachedCensoredWorkouts = async (program: IProgram) => {
    const locales = Object.keys(LANGUAGE);

    await batchDeleteCachedCensoredText(
        locales.map((key) => `program-${program._id}-name-${key}`),
    );

    const description = program.description as Record<string, string>;

    if (description) {
        await batchDeleteCachedCensoredText(
            locales.map((key) => `program-${program._id}-description-${key}`),
        );
    }

    return program;
};

export const createProgram = async (
    user: IUser,
    createData: IProgramCreateDTO,
): Promise<ServiceResult<IProgram>> => {
    try {
        const { workoutSchedule } = createData;

        const workoutIds: mongoose.Schema.Types.ObjectId[] = (
            (workoutSchedule || []) as IWorkoutSchedule[]
        )
            .flatMap((item) => item.workoutIds || [])
            .filter((id): id is mongoose.Schema.Types.ObjectId => !!id);

        const validWorkouts = await Workout.find({
            _id: { $in: workoutIds },
            userId: user._id,
        })
            .select("_id")
            .lean();

        const validWorkoutIds = validWorkouts.map((workout) =>
            workout._id.toString(),
        );

        const invalidWorkouts = workoutIds
            .map((id) => id.toString())
            .filter((id) => !validWorkoutIds.includes(id));

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

        const { data: localizedCreateData, queueTranslationTask } =
            localizeDataInput(
                createData,
                user.languagePreference as LanguageKey,
                ["name", "description"],
                "PROGRAM" as unknown as DocumentType, // Include documentType
            );

        const newProgram = await Program.create({
            ...localizedCreateData,
            originalLanguage: user.languagePreference as LanguageKey,
            userId: user._id,
        });

        // Await the queueTranslationTask
        await queueTranslationTask(newProgram._id);

        return {
            message: "Program created successfully",
            data: newProgram,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateProgram = async (
    user: IUser,
    programId: string,
    updateData: IProgramUpdateDTO,
): Promise<ServiceResult<IProgram>> => {
    try {
        const program = await Program.findOne({ _id: programId });

        if (!program) {
            throw json({ error: "Program not found" }, { status: 404 });
        }

        if (program.userId.toString() !== user._id.toString()) {
            throw json(
                { error: "You are not authorized to update this program" },
                { status: 403 },
            );
        }

        const { data: localizedUpdateData, queueTranslationTask } =
            localizeDataInput(
                updateData,
                user.languagePreference as LanguageKey,
                ["name", "description"],
                "PROGRAM" as unknown as DocumentType,
            );

        // Use findByIdAndUpdate for atomic update
        const updatedProgram = await Program.findByIdAndUpdate(
            programId,
            {
                $set: {
                    originalLanguage: user.languagePreference,
                    ...localizedUpdateData,
                },
            },
            { new: true },
        );

        if (!updatedProgram) {
            throw json({ error: "Failed to update program" }, { status: 500 });
        }

        await deleteCachedCensoredWorkouts(updatedProgram);

        await TranslationTask.updateMany(
            {
                documentId: updatedProgram._id,
                documentType: "PROGRAM",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        await queueTranslationTask(updatedProgram._id);

        return {
            status: 200,
            message: "Program updated successfully",
            data: updatedProgram,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteProgram = async (
    user: IUser,
    programId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const program = await Program.findOne({ _id: programId }).lean();

        if (!program) {
            throw data({ error: "Program not found" }, { status: 404 });
        }

        if (program.userId.toString() !== user._id.toString()) {
            throw data(
                {
                    error: "You are not authorized to delete this program",
                },
                { status: 403 },
            );
        }

        await Program.deleteOne({ _id: programId });

        await deleteCachedCensoredWorkouts(program);

        await TranslationTask.updateMany(
            {
                documentId: program._id,
                documentType: "PROGRAM",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        return {
            message: "Program deleted successfully",
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readPrograms = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedProgram[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IProgram>(
                searchParams,
                programQueryConfig,
                user.languagePreference as LanguageKey,
            ) as any;

        const mine = searchParams.get("mine") === "true";
        const userId = searchParams.get("userId");

        if (mine) {
            query.userId = user._id;
        } else if (userId) {
            query.userId = userId as IQueryField<string>;
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
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const programs = (await queryObj.lean().exec()) as IProgram[];

        const censoredPrograms = await Promise.all(
            programs.map((program) => censorProgram(user, program)),
        );

        const localizedPrograms: ILocalizedProgram[] = censoredPrograms.map(
            (program) => resolveLocalizedProgram(program, user),
        );

        const totalCount = await Program.countDocuments(query).exec();

        const hasMore = offset + programs.length < totalCount;

        return { data: localizedPrograms, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readProgramById = async (
    user: IUser,
    programId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedProgram>> => {
    try {
        let queryObj = Program.findById(programId);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const program = (await queryObj.lean().exec()) as IProgram;

        if (!program) {
            throw data({ error: "Program not found" }, { status: 404 });
        }

        if (
            !program.isPublic &&
            program.userId.toString() !== user._id.toString()
        ) {
            throw data(
                {
                    error: "Forbidden: You do not have access to this program",
                },
                { status: 403 },
            );
        }

        const censoredProgram = await censorProgram(user, program);

        const localizedProgram = resolveLocalizedProgram(censoredProgram, user);

        return { data: localizedProgram };
    } catch (error) {
        throw handleError(error);
    }
};
