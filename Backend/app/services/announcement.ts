import {
    IUser,
    LanguageKey,
    TranslationTask,
} from "@paciorekj/iron-journal-shared";
import Announcement from "@paciorekj/iron-journal-shared/models/Announcement";
import { data, json } from "@remix-run/node";
import mongoose from "mongoose";
import { ServiceResult } from "~/interfaces/service-result";
import {
    ILocalizedAnnouncement,
    resolveLocalizedAnnouncement,
} from "~/localization/Announcements";
import { announcementQueryConfig } from "~/queryConfig/announcement";
import { buildQueryFromSearchParams } from "~/queryConfig/utils";
import { localizeDataInput } from "~/utils/localization.server";
import { handleError } from "~/utils/util.server";
import {
    IAnnouncementCreateDTO,
    IAnnouncementUpdateDTO,
} from "~/validation/announcement";

// NOTE: Admins can create, update, and delete announcements, so we just assume english

export const createAnnouncement = async (
    createData: IAnnouncementCreateDTO,
): Promise<ServiceResult<ILocalizedAnnouncement>> => {
    try {
        const { data: localizedCreateData, queueTranslationTask } =
            localizeDataInput(
                createData,
                "en",
                ["title", "description"],
                "ANNOUNCEMENT" as unknown as DocumentType,
            );
        const newAnnouncement = await Announcement.create(localizedCreateData);

        await queueTranslationTask(
            newAnnouncement._id as mongoose.Schema.Types.ObjectId,
        );

        return {
            message: "Announcement created successfully",
            data: resolveLocalizedAnnouncement(newAnnouncement, "en"),
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateAnnouncement = async (
    announcementId: string,
    updateData: IAnnouncementUpdateDTO,
): Promise<ServiceResult<ILocalizedAnnouncement>> => {
    try {
        const { data: localizedUpdateData, queueTranslationTask } =
            localizeDataInput(
                updateData,
                "en",
                ["title", "description"],
                "ANNOUNCEMENT" as any,
            );

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            announcementId,
            localizedUpdateData,
            { new: true, runValidators: true },
        ).lean();

        if (!updatedAnnouncement) {
            throw data({ error: "Announcement not found" }, { status: 404 });
        }

        await TranslationTask.updateMany(
            {
                documentId: updatedAnnouncement._id,
                documentType: "ANNOUNCEMENT",
                status: { $in: ["PENDING", "IN_PROGRESS"] },
            },
            { $set: { status: "CANCELED" } },
        );

        await queueTranslationTask(
            updatedAnnouncement._id as mongoose.Schema.Types.ObjectId,
        );

        return {
            message: "Announcement updated successfully",
            data: resolveLocalizedAnnouncement(updatedAnnouncement, "en"),
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteAnnouncement = async (
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
    searchParams: URLSearchParams,
    user?: IUser,
): Promise<ServiceResult<ILocalizedAnnouncement[]>> => {
    let languagePreference: LanguageKey = "en";

    if (user) {
        languagePreference = user.languagePreference as LanguageKey;
    }
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

        const localizedAnnouncements = announcements.map((announcement) => {
            return resolveLocalizedAnnouncement(
                announcement,
                languagePreference,
            );
        });

        const totalCount = await Announcement.countDocuments(query).exec();
        const hasMore = offset + localizedAnnouncements.length < totalCount;

        return { data: localizedAnnouncements, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readAnnouncementById = async (
    announcementId: string,
    user?: IUser,
): Promise<ServiceResult<ILocalizedAnnouncement>> => {
    let languagePreference: LanguageKey = "en";

    if (user) {
        languagePreference = user.languagePreference as LanguageKey;
    }
    try {
        const announcement = await Announcement.findById(announcementId)
            .lean()
            .exec();

        if (!announcement) {
            throw json({ error: "Announcement not found" }, { status: 404 });
        }
        return {
            data: resolveLocalizedAnnouncement(
                announcement,
                languagePreference,
            ),
        };
    } catch (error) {
        throw handleError(error);
    }
};
