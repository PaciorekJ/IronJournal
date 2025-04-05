import { IUser } from "@paciorekj/iron-journal-shared";
import { ServiceResult } from "~/interfaces/service-result";
import NotificationModel from "~/models/Notification";
import { handleError } from "~/utils/util.server";
import { IFeedbackCreateDTO } from "~/validation/feedback";

export const createFeedback = async (
    user: IUser,
    createData: IFeedbackCreateDTO,
): Promise<ServiceResult<undefined>> => {
    try {
        const feedbackData = {
            ...createData,
            user: user._id,
        };

        // send feedback to a specific discord channel

        await NotificationModel.create({
            user: user._id,
            title: "We have your feedback!",
            message: `Thank you for your feedback! We will review it soon.${feedbackData.rating && feedbackData.rating < 5 ? ` We realize that your rating is ${feedbackData.rating}, but we are always looking to improve.` : ""}`,
            type: "info",
        });

        // const newFeedback = await Feedback.create(feedbackData);

        return {
            message: "Feedback created successfully",
        };
    } catch (error) {
        throw handleError(error);
    }
};
