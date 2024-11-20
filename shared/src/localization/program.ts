import { LanguageKey } from "../constants/language";
import { IProgram, IWorkoutSchedule } from "../models/program";
import { localizeEnumField } from "./utils";

interface ILocalizedWorkoutSchedule extends Omit<IWorkoutSchedule, "day"> {
    day: string | number; // 'number' for 'CYCLE', 'string' for localized day
}

export interface ILocalizedProgram
    extends Omit<
        IProgram,
        | "name"
        | "description"
        | "scheduleType"
        | "focusAreas"
        | "targetAudience"
        | "workoutSchedule"
    > {
    name: string;
    description?: string;
    scheduleType: string;
    focusAreas?: string[];
    targetAudience?: string;
    workoutSchedule?: ILocalizedWorkoutSchedule[];
}

export function localizeProgramConstants(
    program: IProgram,
    language: LanguageKey,
): ILocalizedProgram {
    const localizedProgram = { ...program } as any;

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
    localizedProgram.scheduleType = localizeEnumField(
        "SCHEDULE_TYPE",
        program.scheduleType,
        language,
    );
    localizedProgram.targetAudience = program.targetAudience
        ? localizeEnumField("TARGET_AUDIENCE", program.targetAudience, language)
        : undefined;

    // Localize 'focusAreas' array
    localizedProgram.focusAreas = program.focusAreas
        ? program.focusAreas.map((focusArea) =>
              localizeEnumField("FOCUS_AREA", focusArea, language),
          )
        : undefined;

    // Localize 'workoutSchedule.day'
    if (program.workoutSchedule) {
        localizedProgram.workoutSchedule = program.workoutSchedule.map(
            (schedule) => {
                const localizedSchedule = {
                    ...schedule,
                } as ILocalizedWorkoutSchedule;
                if (
                    program.scheduleType === "WEEKLY" &&
                    typeof schedule.day === "string"
                ) {
                    localizedSchedule.day = localizeEnumField(
                        "DAYS_OF_WEEK",
                        schedule.day,
                        language,
                    );
                }
                // If 'day' is a number (for 'CYCLE'), keep it as is
                return localizedSchedule;
            },
        );
    }

    return localizedProgram as ILocalizedProgram;
}
