import {
    FOCUS_AREA,
    FocusAreasKey,
    LanguageKey,
    SCHEDULE_TYPE,
    ScheduleTypeKey,
    TARGET_AUDIENCE,
    TargetAudienceKey,
} from "@paciorekj/iron-journal-shared";
import { z } from "node_modules/zod/lib/external";
import { IBuildQueryConfig, addPaginationAndSorting } from "./utils";

// Program Query Configuration

export const programQueryConfig: IBuildQueryConfig = addPaginationAndSorting({
    name: {
        isArray: false,
        constructor: String,
        regex: (value: string) => new RegExp(value, "i"),
        schema: z.string().min(1),
        getFieldPath: (language: LanguageKey) => `name.${language}`,
    },
    userId: {
        isArray: false,
        constructor: String,
        schema: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
    },
    scheduleType: {
        isArray: false,
        constructor: String,
        schema: z.enum(
            Object.keys(SCHEDULE_TYPE) as [
                ScheduleTypeKey,
                ...ScheduleTypeKey[],
            ],
        ),
    },
    focusAreas: {
        isArray: true,
        constructor: String,
        schema: z.enum(
            Object.keys(FOCUS_AREA) as [FocusAreasKey, ...FocusAreasKey[]],
        ),
    },
    targetAudience: {
        isArray: false,
        constructor: String,
        schema: z.enum(
            Object.keys(TARGET_AUDIENCE) as [
                TargetAudienceKey,
                ...TargetAudienceKey[],
            ],
        ),
    },
});
