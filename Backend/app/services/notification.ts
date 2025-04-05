import { IUser } from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import NotificationModel, { INotification } from "~/models/Notification";
import { notificationQueryConfig } from "~/queryConfig/notification";
import { buildQueryFromSearchParams } from "~/queryConfig/utils";
import { handleError } from "~/utils/util.server";
import {
    INotificationCreateDTO,
    INotificationUpdateDTO,
} from "~/validation/notifications";

export const createNotification = async (
    _user: IUser,
    createData: INotificationCreateDTO,
): Promise<ServiceResult<INotification>> => {
    try {
        const newNotification = await NotificationModel.create(createData);
        return {
            message: "Notification created successfully",
            data: newNotification.toJSON(),
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateNotification = async (
    user: IUser,
    notificationId: string,
    updateData: INotificationUpdateDTO,
): Promise<ServiceResult<INotification>> => {
    try {
        const updatedNotification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, userId: user._id },
            updateData,
            {
                new: true,
                runValidators: true,
            },
        ).lean();
        if (!updatedNotification) {
            throw data({ error: "Notification not found" }, { status: 404 });
        }
        return {
            message: "Notification updated successfully",
            data: updatedNotification,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteNotification = async (
    user: IUser,
    notificationId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const deletedNotification = await NotificationModel.findOneAndDelete({
            _id: notificationId,
            userId: user._id,
        }).lean();
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
): Promise<ServiceResult<INotification[]>> => {
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

        const totalCount =
            await NotificationModel.countDocuments(newQuery).exec();
        const hasMore = offset + notifications.length < totalCount;

        return { data: notifications, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readNotificationById = async (
    _user: IUser,
    notificationId: string,
): Promise<ServiceResult<INotification>> => {
    try {
        const notification = await NotificationModel.findById(notificationId)
            .lean()
            .exec();

        if (!notification) {
            throw json({ error: "Notification not found" }, { status: 404 });
        }

        if (notification.userId.toString() !== _user._id.toString()) {
            throw json(
                {
                    error: "You are not authorized to read this notification",
                },
                { status: 403 },
            );
        }

        return { data: notification };
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
