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
    createData: INotificationCreateDTO,
): Promise<ServiceResult<INotification>> => {
    try {
        const newNotification = await NotificationModel.create(createData);
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
): Promise<ServiceResult<INotification>> => {
    try {
        const updatedNotification = await NotificationModel.findByIdAndUpdate(
            notificationId,
            updateData,
            {
                new: true,
                runValidators: true,
            },
        );
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
    notificationId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const deletedNotification =
            await NotificationModel.findByIdAndDelete(notificationId).lean();
        if (!deletedNotification) {
            throw data({ error: "Notification not found" }, { status: 404 });
        }
        return { message: "Notification deleted successfully" };
    } catch (error) {
        throw handleError(error);
    }
};

export const readNotifications = async (
    searchParams: URLSearchParams,
): Promise<ServiceResult<INotification[]>> => {
    try {
        const { query, limit, offset } = buildQueryFromSearchParams(
            searchParams,
            notificationQueryConfig,
        );

        const notifications = await NotificationModel.find(query)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const totalCount = await NotificationModel.countDocuments(query).exec();
        const hasMore = offset + notifications.length < totalCount;

        return { data: notifications, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readNotificationById = async (
    notificationId: string,
): Promise<ServiceResult<INotification>> => {
    try {
        const notification = await NotificationModel.findById(notificationId)
            .lean()
            .exec();
        if (!notification) {
            throw json({ error: "Notification not found" }, { status: 404 });
        }
        return { data: notification };
    } catch (error) {
        throw handleError(error);
    }
};
