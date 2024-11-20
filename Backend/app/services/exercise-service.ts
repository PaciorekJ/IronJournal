import {
    Exercise,
    IExercise,
    ILocalizedExercise,
    IUser,
    LanguageKey,
    convertLocalizeExercise,
} from "@paciorekj/iron-journal-shared";
import { json } from "@remix-run/node";
import { RootFilterQuery } from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import {
    buildQueryFromSearchParams,
    exerciseQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
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
                convertLocalizeExercise(exercise as IExercise, language),
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

        const finalExercise = convertLocalizeExercise(
            exercise as IExercise,
            language,
        );

        return { data: finalExercise };
    } catch (error) {
        throw handleError(error);
    }
};
