import { localizeEnumField } from './utils.js';

function localizeProgramConstants(program, language) {
    const localizedProgram = { ...program };
    // Localize 'name' field
    if (program.name) {
        localizedProgram.name =
            program.name[language] || program.name["en"] || "";
    }
    // Localize 'description' field
    if (program.description) {
        localizedProgram.description =
            program.description[language] || program.description["en"] || "";
    }
    // Localize enum fields
    localizedProgram.scheduleType = localizeEnumField("SCHEDULE_TYPE", program.scheduleType, language);
    localizedProgram.targetAudience = program.targetAudience
        ? localizeEnumField("TARGET_AUDIENCE", program.targetAudience, language)
        : undefined;
    // Localize 'focusAreas' array
    localizedProgram.focusAreas = program.focusAreas
        ? program.focusAreas.map((focusArea) => localizeEnumField("FOCUS_AREA", focusArea, language))
        : undefined;
    // Localize 'workoutSchedule.day'
    if (program.workoutSchedule) {
        localizedProgram.workoutSchedule = program.workoutSchedule.map((schedule) => {
            const localizedSchedule = {
                ...schedule,
            };
            if (program.scheduleType === "WEEKLY" &&
                typeof schedule.day === "string") {
                localizedSchedule.day = localizeEnumField("DAYS_OF_WEEK", schedule.day, language);
            }
            // If 'day' is a number (for 'CYCLE'), keep it as is
            return localizedSchedule;
        });
    }
    return localizedProgram;
}

export { localizeProgramConstants };
//# sourceMappingURL=program.js.map
