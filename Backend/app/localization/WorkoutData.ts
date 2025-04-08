import { LanguageKey } from "@paciorekj/iron-journal-shared";
import { IWorkoutData } from "~/models/WorkoutData";

/**
 * Localize the given WorkoutData object.
 *
 * The function will return a new object with all properties from the given
 * WorkoutData object, but with the 'status' field translated to the given
 * locale.
 *
 * @param data - The WorkoutData to localize.
 * @param locale - The locale to localize for.
 * @returns A localized WorkoutData object with the 'status' field translated.
 */
export const resolveLocalizedWorkoutData = (
    data: IWorkoutData,
    locale: LanguageKey,
) => {
    return {
        ...data,
        status: LOCALIZATION_MAP_WORKOUT_STATUS[locale][data.status],
    };
};

const LOCALIZATION_MAP_WORKOUT_STATUS: Record<
    LanguageKey,
    Record<string, string>
> = {
    en: {
        ACTIVE: "Active",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Completed",
    },
    es: {
        ACTIVE: "Activo",
        IN_PROGRESS: "En Progreso",
        COMPLETED: "Completado",
    },
};
