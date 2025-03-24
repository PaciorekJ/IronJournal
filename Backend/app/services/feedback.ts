import { IUser } from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import Feedback, { IFeedback } from "~/models/Feedback";
import NotificationModel from "~/models/Notification";
import { feedbackQueryConfig } from "~/queryConfig/feedback";
import { buildQueryFromSearchParams } from "~/queryConfig/utils";
import { handleError } from "~/utils/util.server";
import { IFeedbackCreateDTO, IFeedbackUpdateDTO } from "~/validation/feedback";

export const createFeedback = async (
    user: IUser,
    createData: IFeedbackCreateDTO,
): Promise<ServiceResult<IFeedback>> => {
    try {
        const feedbackData = {
            ...createData,
            user: user._id,
        };

        await NotificationModel.create({
            user: user._id,
            title: "We have your feedback!",
            message: `Thank you for your feedback! We will review it soon.${feedbackData.rating && feedbackData.rating < 5 ? ` We realize that your rating is ${feedbackData.rating}, but we are always looking to improve.` : ""}`,
            type: "info",
        });

        const newFeedback = await Feedback.create(feedbackData);
        return {
            message: "Feedback created successfully",
            data: newFeedback,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateFeedback = async (
    feedbackId: string,
    updateData: IFeedbackUpdateDTO,
): Promise<ServiceResult<IFeedback>> => {
    try {
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            updateData,
            { new: true, runValidators: true },
        );
        if (!updatedFeedback) {
            throw data({ error: "Feedback not found" }, { status: 404 });
        }
        return {
            message: "Feedback updated successfully",
            data: updatedFeedback,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteFeedback = async (
    feedbackId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const deletedFeedback =
            await Feedback.findByIdAndDelete(feedbackId).lean();
        if (!deletedFeedback) {
            throw data({ error: "Feedback not found" }, { status: 404 });
        }
        return { message: "Feedback deleted successfully" };
    } catch (error) {
        throw handleError(error);
    }
};

export const readFeedbacks = async (
    searchParams: URLSearchParams,
): Promise<ServiceResult<IFeedback[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams(searchParams, feedbackQueryConfig);
        const feedbacks = await Feedback.find(query)
            .skip(offset)
            .limit(limit)
            .sort(sortBy ? { [sortBy]: sortOrder } : undefined)
            .lean()
            .exec();

        const totalCount = await Feedback.countDocuments(query).exec();
        const hasMore = offset + feedbacks.length < totalCount;

        return { data: feedbacks, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readFeedbackById = async (
    feedbackId: string,
): Promise<ServiceResult<IFeedback>> => {
    try {
        const feedback = await Feedback.findById(feedbackId).lean().exec();
        if (!feedback) {
            throw json({ error: "Feedback not found" }, { status: 404 });
        }
        return { data: feedback };
    } catch (error) {
        throw handleError(error);
    }
};
