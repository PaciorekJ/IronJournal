import {
    LanguageKey,
    resolveLocalizedField,
} from "@paciorekj/iron-journal-shared";
import { IAnnouncement } from "@paciorekj/iron-journal-shared/models/Announcement";

export interface ILocalizedAnnouncement
    extends Omit<IAnnouncement, "title" | "description"> {
    title: string;
    description: string;
}

export function resolveLocalizedAnnouncement(
    announcement: IAnnouncement,
    languagePreference: LanguageKey,
): ILocalizedAnnouncement {
    const localizedAnnouncement = { ...announcement } as any;

    if (announcement.title) {
        localizedAnnouncement.title = resolveLocalizedField(
            announcement.title,
            "en",
            languagePreference,
        );
    }

    if (announcement.description) {
        localizedAnnouncement.description = resolveLocalizedField(
            announcement.description,
            "en",
            languagePreference,
        );
    }

    return localizedAnnouncement;
}
