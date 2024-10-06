import { json } from "@remix-run/node";
import { RootFilterQuery } from "mongoose";
import { LanguageKey } from "~/constants/language";
import { ServiceResult } from "~/interfaces/service-result";
import {
    ILocalizedExercise,
    localizeExerciseConstants,
} from "~/localization/exercise.server";
import { getLocalizedField } from "~/localization/utils.server";
import { Exercise, IExercise } from "~/models/exercise";
import { IUser } from "~/models/user";
import {
    buildQueryFromSearchParams,
    exerciseQueryConfig,
} from "~/utils/query.server";
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
            .select({
                [`name.${language}`]: 1,
                [`name.en`]: 1,
                instructions: 1,
                level: 1,
                force: 1,
                mechanic: 1,
                equipment: 1,
                category: 1,
                primaryMuscles: 1,
                secondaryMuscles: 1,
                images: 1,
                id: 1,
            })
            .sort(sortOption)
            .skip(offset)
            .limit(limit)
            .lean()
            .exec();

        // Type assertion to help TypeScript understand the structure
        const exercisesTyped = exercises;

        const localizedExercises: ILocalizedExercise[] = exercisesTyped.map(
            (exercise) => {
                // Localize fields
                const localizedName = getLocalizedField(
                    exercise.name,
                    language,
                );

                const localizedInstructions = exercise.instructions
                    ? exercise.instructions.map((instruction) =>
                          getLocalizedField(instruction, language),
                      )
                    : [];

                // Update the exercise with localized fields
                const localizedExercise: ILocalizedExercise = {
                    ...exercise,
                    name: localizedName,
                    instructions: localizedInstructions,
                };

                // Localize enum constants
                return localizeExerciseConstants(
                    localizedExercise as unknown as IExercise,
                    language,
                );
            },
        );

        const totalCount = await Exercise.countDocuments(
            query as RootFilterQuery<IExercise>,
        ).exec();
        const hasMore = offset + exercises.length < totalCount;

        return { data: localizedExercises, hasMore };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};

export const readExerciseById = async (
    user: IUser,
    exerciseId: string,
): Promise<ServiceResult<ILocalizedExercise>> => {
    try {
        const language = user.languagePreference as LanguageKey;

        const exercise = await Exercise.findById(exerciseId)
            .select({
                [`name.${language}`]: 1,
                [`name.en`]: 1,
                instructions: 1,
                level: 1,
                force: 1,
                mechanic: 1,
                equipment: 1,
                category: 1,
                primaryMuscles: 1,
                secondaryMuscles: 1,
                images: 1,
                id: 1,
            })
            .lean()
            .exec();

        if (!exercise) {
            throw json({ error: "Exercise not found" }, { status: 404 });
        }

        // Type assertion
        const exerciseTyped = exercise;

        // Localize fields
        const localizedName = getLocalizedField(exerciseTyped.name, language);

        const localizedInstructions = exerciseTyped.instructions
            ? exerciseTyped.instructions.map((instruction) =>
                  getLocalizedField(instruction, language),
              )
            : [];

        // Update the exercise with localized fields
        const localizedExercise: ILocalizedExercise = {
            ...exerciseTyped,
            name: localizedName,
            instructions: localizedInstructions,
        };

        // Localize enum constants
        const finalExercise = localizeExerciseConstants(
            localizedExercise as unknown as IExercise,
            language,
        );

        return { data: finalExercise };
    } catch (error) {
        throw json({ status: 500, error: "An unexpected error occurred" });
    }
};
