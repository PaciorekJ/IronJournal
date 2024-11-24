import { resolveLocalizedField, resolveLocalizedEnum } from './utils.js';

/**
 * Localizes fields of an `IProgram` object to a specific language and returns
 * a localized version as `ILocalizedProgram`.
 *
 * The function resolves and translates fields such as `name`, `description`,
 * `scheduleType`, `targetAudience`, `focusAreas`, and elements within
 * `workoutSchedule` based on the provided target `language`.
 *
 * - `name` and `description` are translated using `resolveLocalizedField`.
 * - Enum fields like `scheduleType` and `targetAudience` are translated
 *   using `resolveLocalizedEnum`.
 * - `focusAreas` is an array of enums that are individually translated.
 * - `workoutSchedule.day` is translated if the schedule type is "WEEKLY".
 *
 * @param program - The program object to localize.
 * @param language - The target language for localization.
 * @returns A localized version of the program.
 */
function resolveLocalizedProgram(program, language) {
    const localizedProgram = { ...program };
    // Localize 'name' field
    if (program.name) {
        localizedProgram.name = resolveLocalizedField(localizedProgram.name, program.originalLanguage, language);
    }
    // Localize 'description' field
    if (program.description) {
        localizedProgram.description = resolveLocalizedField(localizedProgram.description, program.originalLanguage, language);
    }
    // Localize enum fields
    localizedProgram.scheduleType = resolveLocalizedEnum("SCHEDULE_TYPE", program.scheduleType, language);
    localizedProgram.targetAudience = program.targetAudience
        ? resolveLocalizedEnum("TARGET_AUDIENCE", program.targetAudience, language)
        : undefined;
    // Localize 'focusAreas' array
    localizedProgram.focusAreas = program.focusAreas
        ? program.focusAreas.map((focusArea) => resolveLocalizedEnum("FOCUS_AREA", focusArea, language))
        : undefined;
    // Localize 'workoutSchedule.day'
    if (program.workoutSchedule) {
        localizedProgram.workoutSchedule = program.workoutSchedule.map((schedule) => {
            const localizedSchedule = {
                ...schedule,
            };
            if (program.scheduleType === "WEEKLY" &&
                typeof schedule.day === "string") {
                localizedSchedule.day = resolveLocalizedEnum("DAYS_OF_WEEK", schedule.day, language);
            }
            // If 'day' is a number (for 'CYCLE'), keep it as is
            return localizedSchedule;
        });
    }
    return localizedProgram;
}

export { resolveLocalizedProgram };
//# sourceMappingURL=program.js.map
