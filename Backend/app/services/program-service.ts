import { json } from "@remix-run/node";
import { MongooseError } from "mongoose";
import { LanguageKey } from "~/constants/language";
import { ServiceResult } from "~/interfaces/service-result";
import {
    ILocalizedProgram,
    localizeProgramConstants,
} from "~/localization/program.server";
import {
    getLocalizedField,
    localizeDataInput,
} from "~/localization/utils.server";
import { IProgram, IWorkoutSchedule, Program } from "~/models/program";
import { IUser } from "~/models/user";
import { WorkoutPrototype } from "~/models/workout-prototype";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    IQueryField,
    programQueryConfig,
} from "~/utils/query.server";
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

        const workoutIds: string[] = (
            (workoutSchedule || []) as IWorkoutSchedule[]
        )
            .flatMap(
                (item) => item.workoutIds?.map((id) => id.toString()) || [],
            )
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

        const { data: localizedCreateData, queueTranslationTask } =
            await localizeDataInput(createData, user.languagePreference, [
                "name",
                "description",
            ]);

        const newProgram: IProgram = await Program.create({
            ...localizedCreateData,
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
    updateData: IProgramUpdateDTO,
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

        const { data: localizedUpdateData, queueTranslationTask } =
            localizeDataInput(updateData, user.languagePreference, [
                "name",
                "description",
            ]);

        Object.assign(program, localizedUpdateData);
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
            .select({
                [`name.${language}`]: 1,
                [`name.en`]: 1,
                [`description.${language}`]: 1,
                [`description.en`]: 1,
                scheduleType: 1,
                focusAreas: 1,
                targetAudience: 1,
                workoutSchedule: 1,
                userId: 1,
                isPublic: 1,
                repetitions: 1,
                createdAt: 1,
                updatedAt: 1,
            })
            .sort(sortOption)
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const programs = (await queryObj.lean().exec()) as IProgram[];

        const localizedPrograms: ILocalizedProgram[] = programs.map(
            (program) => {
                // Localize fields
                const localizedName = getLocalizedField(program.name, language);
                const localizedDescription =
                    program.description &&
                    getLocalizedField(program.description, language);

                // Update the program with localized fields
                const localizedProgramData = {
                    ...program,
                    name: localizedName,
                    description: localizedDescription,
                };

                // Localize constants and nested structures
                const localizedProgram = localizeProgramConstants(
                    localizedProgramData as unknown as IProgram,
                    language,
                );

                return localizedProgram;
            },
        );

        const totalCount = await Program.countDocuments(query).exec();

        const hasMore = offset + programs.length < totalCount;

        return { data: localizedPrograms, hasMore };
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
): Promise<ServiceResult<ILocalizedProgram>> => {
    try {
        const language = user.languagePreference as LanguageKey;

        let queryObj = Program.findById(programId).select({
            [`name.${language}`]: 1,
            [`name.en`]: 1,
            [`description.${language}`]: 1,
            [`description.en`]: 1,
            scheduleType: 1,
            focusAreas: 1,
            targetAudience: 1,
            workoutSchedule: 1,
            userId: 1,
            isPublic: 1,
            repetitions: 1,
            createdAt: 1,
            updatedAt: 1,
        });

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
            throw json({
                status: 403,
                error: "Forbidden: You do not have access to this program",
            });
        }

        // Localize fields
        const localizedName = getLocalizedField(program.name, language);
        const localizedDescription =
            program.description &&
            getLocalizedField(program.description, language);

        // Update the program with localized fields
        const localizedProgramData = {
            ...program,
            name: localizedName,
            description: localizedDescription,
        };

        // Localize constants and nested structures
        const localizedProgram = localizeProgramConstants(
            localizedProgramData as unknown as IProgram,
            language,
        );

        return { data: localizedProgram };
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
