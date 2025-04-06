import { IUser } from "@paciorekj/iron-journal-shared";
import { ServiceResult } from "~/interfaces/service-result";
import NotificationModel from "~/models/Notification";
import { postFeedbackToDiscord } from "~/utils/discord";
import { handleError } from "~/utils/util.server";
import { IFeedbackCreateDTO } from "~/validation/feedback";

export const createFeedback = async (
    user: IUser,
    feedbackData: IFeedbackCreateDTO,
): Promise<ServiceResult<undefined>> => {
    try {
        await NotificationModel.create({
            user: user._id,
            title: "We have your feedback!",
            message: `Thank you for your feedback! We will review it soon.`,
            type: "info",
        });

        await postFeedbackToDiscord(user, feedbackData);

        return {
            message: "Feedback created successfully",
        };
    } catch (error) {
        throw handleError(error);
    }
};
