import { IUser } from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import Announcement, { IAnnouncement } from "~/models/Announcement";
import { announcementQueryConfig } from "~/queryConfig/announcement";
import { buildQueryFromSearchParams } from "~/queryConfig/utils";
import { handleError } from "~/utils/util.server";
import {
    IAnnouncementCreateDTO,
    IAnnouncementUpdateDTO,
} from "~/validation/announcement";

export const createAnnouncement = async (
    _user: IUser,
    createData: IAnnouncementCreateDTO,
): Promise<ServiceResult<IAnnouncement>> => {
    try {
        const newAnnouncement = await Announcement.create(createData);
        return {
            message: "Announcement created successfully",
            data: newAnnouncement,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateAnnouncement = async (
    _user: IUser,
    announcementId: string,
    updateData: IAnnouncementUpdateDTO,
): Promise<ServiceResult<IAnnouncement>> => {
    try {
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            announcementId,
            updateData,
            { new: true, runValidators: true },
        );
        if (!updatedAnnouncement) {
            throw data({ error: "Announcement not found" }, { status: 404 });
        }
        return {
            message: "Announcement updated successfully",
            data: updatedAnnouncement,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteAnnouncement = async (
    _user: IUser,
    announcementId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const deletedAnnouncement =
            await Announcement.findByIdAndDelete(announcementId).lean();
        if (!deletedAnnouncement) {
            throw data({ error: "Announcement not found" }, { status: 404 });
        }
        return { message: "Announcement deleted successfully" };
    } catch (error) {
        throw handleError(error);
    }
};

export const readAnnouncements = async (
    _user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IAnnouncement[]>> => {
    try {
        const { query, limit, offset } = buildQueryFromSearchParams(
            searchParams,
            announcementQueryConfig,
        );

        // Always sort by createdAt descending.
        const announcements = await Announcement.find(query)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const totalCount = await Announcement.countDocuments(query).exec();
        const hasMore = offset + announcements.length < totalCount;

        return { data: announcements, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readAnnouncementById = async (
    _user: IUser,
    announcementId: string,
): Promise<ServiceResult<IAnnouncement>> => {
    try {
        const announcement = await Announcement.findById(announcementId)
            .lean()
            .exec();
        if (!announcement) {
            throw json({ error: "Announcement not found" }, { status: 404 });
        }
        return { data: announcement };
    } catch (error) {
        throw handleError(error);
    }
};
