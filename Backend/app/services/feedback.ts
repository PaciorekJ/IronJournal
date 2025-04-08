import { IUser } from "@paciorekj/iron-journal-shared";
import { ServiceResult } from "~/interfaces/service-result";
import { postFeedbackToDiscord } from "~/utils/discord";
import { handleError } from "~/utils/util.server";
import { IFeedbackCreateDTO } from "~/validation/feedback";
import { createNotification } from "./notification";

export const createFeedback = async (
    user: IUser,
    feedbackData: IFeedbackCreateDTO,
): Promise<ServiceResult<undefined>> => {
    try {
        await createNotification({
            title: "We have your feedback!",
            message: `Thank you for your feedback! We will review it soon.`,
            userId: user._id.toString(),
            read: false,
        });

        await postFeedbackToDiscord(user, feedbackData);

        return {
            message: "Feedback created successfully",
        };
    } catch (error) {
        throw handleError(error);
    }
};
