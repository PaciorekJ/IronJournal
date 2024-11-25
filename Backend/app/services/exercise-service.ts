import {
    Exercise,
    IExercise,
    ILocalizedExercise,
    IUser,
    LanguageKey,
    resolveLocalizedExercise,
    TranslationTask,
} from "@paciorekj/iron-journal-shared";
import { json } from "@remix-run/node";
import { RootFilterQuery } from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import { localizeDataInput } from "~/utils/localization.server";
import {
    buildQueryFromSearchParams,
    exerciseQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import {
    IExerciseCreateDTO,
    IExerciseUpdateDTO,
} from "~/validation/exercise.server";

export const createExercise = async (
    user: IUser,
    data: IExerciseCreateDTO,
): Promise<ServiceResult<IExercise>> => {
    try {
        const { data: localizedCreateData, queueTranslationTask } =
            localizeDataInput(
                data,
                user.languagePreference as LanguageKey,
                ["name", "instructions"],
                "EXERCISE" as any,
            );

        const newExercise = await Exercise.create({
            ...localizedCreateData,
            originalLanguage: user.languagePreference as LanguageKey,
            userId: user._id,
        });

        await queueTranslationTask(newExercise._id);

        return {
            message: "Exercise created successfully",
            data: newExercise,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateExercise = async (
    user: IUser,
    exerciseId: string,
    updateData: IExerciseUpdateDTO,
): Promise<ServiceResult<IExercise>> => {
    try {
        const exercise = await Exercise.findOne({
            _id: exerciseId,
            userId: user._id,
        });

        if (!exercise) {
            throw json({ error: "Exercise not found" }, { status: 404 });
        }

        const { data: localizedUpdateData, queueTranslationTask } =
            localizeDataInput(
                updateData,
                user.languagePreference as LanguageKey,
                ["name", "instructions"],
                "EXERCISE" as any,
            );

        // Use findByIdAndUpdate for atomic update
        const updatedExercise = await Exercise.findByIdAndUpdate(
            exerciseId,
            {
                $set: {
                    ...localizedUpdateData,
                    originalLanguage: user.languagePreference as LanguageKey,
                },
            },
            { new: true },
        );

        if (!updatedExercise) {
            throw json({ error: "Failed to update Exercise" }, { status: 500 });
        }

        // Cancel any pending translation tasks before queuing a new one
        await TranslationTask.updateMany(
            {
                documentId: updatedExercise._id,
                documentType: "EXERCISE",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        // Await the queueTranslationTask
        await queueTranslationTask(updatedExercise._id);

        return {
            message: "Exercise updated successfully",
            data: updatedExercise,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteExercise = async (
    user: IUser,
    exerciseId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const exercise = await Exercise.findOne({ _id: exerciseId }).lean();

        if (!exercise) {
            throw json({ error: "Exercise not found" }, { status: 404 });
        }

        await Exercise.deleteOne({ _id: exerciseId });

        await TranslationTask.updateMany(
            {
                documentId: exercise._id,
                documentType: "EXERCISE",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        return {
            message: "Exercise deleted successfully",
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readExercises = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedExercise[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IExercise>(
                searchParams,
                exerciseQueryConfig,
                user.languagePreference as LanguageKey,
            );

        const sortOption: Record<string, 1 | -1> | undefined = sortBy
            ? { [sortBy]: sortOrder as 1 | -1 }
            : undefined;

        const language = user.languagePreference as LanguageKey;

        const exercises = await Exercise.find(
            query as RootFilterQuery<IExercise>,
        )
            .sort(sortOption)
            .skip(offset)
            .limit(limit)
            .lean()
            .exec();

        const localizedExercises: ILocalizedExercise[] = exercises.map(
            (exercise) =>
                resolveLocalizedExercise(exercise as IExercise, language),
        );

        const totalCount = await Exercise.countDocuments(
            query as RootFilterQuery<IExercise>,
        ).exec();
        const hasMore = offset + exercises.length < totalCount;

        return { data: localizedExercises, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readExerciseById = async (
    user: IUser,
    exerciseId: string,
): Promise<ServiceResult<ILocalizedExercise>> => {
    try {
        const language = user.languagePreference as LanguageKey;

        const exercise = await Exercise.findById(exerciseId).lean().exec();

        if (!exercise) {
            throw json({ error: "Exercise not found" }, { status: 404 });
        }

        const finalExercise = resolveLocalizedExercise(
            exercise as IExercise,
            language,
        );

        return { data: finalExercise };
    } catch (error) {
        throw handleError(error);
    }
};
