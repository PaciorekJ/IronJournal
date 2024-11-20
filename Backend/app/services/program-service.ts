import {
    ILocalizedProgram,
    IProgram,
    IUser,
    IWorkoutSchedule,
    LanguageKey,
    localizeProgramConstants,
    Program,
    TranslationTask,
    WorkoutPrototype,
} from "@paciorekj/iron-journal-shared";
import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import { localizeDataInput } from "~/utils/localization.server";
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

        const validWorkouts = await WorkoutPrototype.find({
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
            { $set: localizedUpdateData },
            { new: true },
        );

        if (!updatedProgram) {
            throw json({ error: "Failed to update program" }, { status: 500 });
        }

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
            throw json({ error: "Program not found" }, { status: 404 });
        }

        if (program.userId.toString() !== user._id.toString()) {
            throw json(
                {
                    error: "You are not authorized to delete this program",
                },
                { status: 403 },
            );
        }

        await Program.deleteOne({ _id: programId });

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

        const language = user.languagePreference as LanguageKey;

        let queryObj = Program.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const programs = (await queryObj.lean().exec()) as IProgram[];

        const localizedPrograms: ILocalizedProgram[] = programs.map((program) =>
            localizeProgramConstants(program, language),
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
        const language = user.languagePreference as LanguageKey;

        let queryObj = Program.findById(programId);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const program = (await queryObj.lean().exec()) as IProgram;

        if (!program) {
            throw json({ error: "Program not found" }, { status: 404 });
        }

        if (
            !program.isPublic &&
            program.userId.toString() !== user._id.toString()
        ) {
            throw json(
                {
                    error: "Forbidden: You do not have access to this program",
                },
                { status: 403 },
            );
        }

        const localizedProgram = localizeProgramConstants(program, language);

        return { data: localizedProgram };
    } catch (error) {
        throw handleError(error);
    }
};
