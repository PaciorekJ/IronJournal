import {
    LanguageKey,
    resolveLocalizedField,
} from "@paciorekj/iron-journal-shared";
import { INotification } from "@paciorekj/iron-journal-shared/models/Notification";

export interface ILocalizedNotification
    extends Omit<INotification, "title" | "message"> {
    title: string;
    message: string;
}

export function resolveLocalizedNotification(
    notification: INotification,
    language: LanguageKey,
) {
    const localizedNotification = { ...notification } as any;

    if (notification.title) {
        localizedNotification.title = resolveLocalizedField(
            notification.title,
            "en",
            language,
        );
    }

    if (notification.message) {
        localizedNotification.message = resolveLocalizedField(
            notification.message,
            "en",
            language,
        );
    }

    return localizedNotification as ILocalizedNotification;
}
