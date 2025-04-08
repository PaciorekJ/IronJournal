import {
    IUser,
    LanguageKey,
    TranslationTask,
} from "@paciorekj/iron-journal-shared";
import NotificationModel, {
    INotification,
} from "@paciorekj/iron-journal-shared/models/Notification";
import { data, json } from "@remix-run/node";
import { Schema } from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import {
    ILocalizedNotification,
    resolveLocalizedNotification,
} from "~/localization/Notifications";
import { notificationQueryConfig } from "~/queryConfig/notification";
import { buildQueryFromSearchParams } from "~/queryConfig/utils";
import { localizeDataInput } from "~/utils/localization.server";
import { handleError } from "~/utils/util.server";
import {
    INotificationCreateDTO,
    INotificationUpdateDTO,
} from "~/validation/notifications";

export const createNotification = async (
    createData: INotificationCreateDTO,
): Promise<ServiceResult<INotification>> => {
    try {
        const { data: localizedCreateData, queueTranslationTask } =
            localizeDataInput(
                createData,
                "en",
                ["title", "message"],
                "NOTIFICATION" as any,
            );

        const newNotification =
            await NotificationModel.create(localizedCreateData);

        await queueTranslationTask(
            newNotification._id as Schema.Types.ObjectId,
        );

        return {
            message: "Notification created successfully",
            data: newNotification,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateNotification = async (
    notificationId: string,
    updateData: INotificationUpdateDTO,
): Promise<ServiceResult<ILocalizedNotification>> => {
    try {
        const { data: localizedUpdateData, queueTranslationTask } =
            localizeDataInput(
                updateData,
                "en",
                ["title", "message"],
                "NOTIFICATION" as any,
            );

        const updatedNotification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId },
            localizedUpdateData,
            {
                new: true,
                runValidators: true,
            },
        ).lean();

        if (!updatedNotification) {
            throw data({ error: "Notification not found" }, { status: 404 });
        }

        await TranslationTask.updateMany(
            {
                documentId: updatedNotification._id,
                documentType: "NOTIFICATION",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        await queueTranslationTask(
            updatedNotification._id as Schema.Types.ObjectId,
        );

        return {
            message: "Notification updated successfully",
            data: resolveLocalizedNotification(updatedNotification, "en"),
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteNotification = async (
    user: IUser | null,
    notificationId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        let deletedNotification = null;

        if (user) {
            deletedNotification = await NotificationModel.findOneAndDelete({
                _id: notificationId,
                userId: user._id,
            }).lean();
        } else {
            // Allows bot to remove notifications
            deletedNotification = await NotificationModel.findOneAndDelete({
                _id: notificationId,
            }).lean();
        }
        if (!deletedNotification) {
            throw data({ error: "Notification not found" }, { status: 404 });
        }
        return { message: "Notification deleted successfully" };
    } catch (error) {
        throw handleError(error);
    }
};

export const readNotifications = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<ILocalizedNotification[]>> => {
    try {
        const { query, limit, offset } = buildQueryFromSearchParams(
            searchParams,
            notificationQueryConfig,
        );

        // Get only the logged in users notifications.
        const newQuery = {
            ...query,
            userId: user._id,
        };

        const notifications = await NotificationModel.find(newQuery)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const localizedNotifications = notifications.map((notification) => {
            return resolveLocalizedNotification(
                notification,
                user.languagePreference as LanguageKey,
            );
        });

        const totalCount =
            await NotificationModel.countDocuments(newQuery).exec();
        const hasMore = offset + notifications.length < totalCount;

        return { data: localizedNotifications, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readNotificationById = async (
    user: IUser,
    notificationId: string,
): Promise<ServiceResult<ILocalizedNotification>> => {
    try {
        const notification = await NotificationModel.findById(notificationId)
            .lean()
            .exec();

        if (!notification) {
            throw json({ error: "Notification not found" }, { status: 404 });
        }

        if (notification.userId.toString() !== user._id.toString()) {
            throw json(
                {
                    error: "You are not authorized to read this notification",
                },
                { status: 403 },
            );
        }

        return {
            data: resolveLocalizedNotification(
                notification,
                user.languagePreference as LanguageKey,
            ),
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const markNotificationsAsReadBulk = async (
    user: IUser,
    ids: string[],
): Promise<ServiceResult<undefined>> => {
    try {
        await NotificationModel.updateMany(
            { _id: { $in: ids }, userId: user._id },
            { $set: { read: true } },
        );
        return { message: "Notifications marked as read" };
    } catch (err) {
        throw handleError(err);
    }
};
