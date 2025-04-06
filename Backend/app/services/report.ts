import { IUser } from "@paciorekj/iron-journal-shared";
import { data } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import NotificationModel from "~/models/Notification";
import ReportModel, { IReport } from "~/models/Report";
import { postReportToDiscord } from "~/utils/discord";
import { handleError } from "~/utils/util.server";
import { IReportCreateDTO } from "~/validation/report";

export const createReport = async (
    user: IUser,
    createData: IReportCreateDTO,
): Promise<ServiceResult<IReport>> => {
    try {
        const reportData = { ...createData, reporter: user._id };

        const reportExisting = await ReportModel.findOne({
            // This allows users not to keep reporting the same thing.
            reporter: user._id,
            reported: createData.reported,
            type: createData.type,
        }).lean();

        if (reportExisting) {
            throw data(
                { error: "You have already reported this" },
                { status: 409 },
            );
        }

        const newReport = await ReportModel.create(reportData);

        await NotificationModel.create({
            userId: user._id,
            title: "We have received your report!",
            message: `Thank you for your report! We will review it soon, and if we find any issues, we will take appropriate action.`,
            type: "info",
        });

        await postReportToDiscord(user, createData);

        return {
            message: "Report created successfully",
            data: newReport,
        };
    } catch (error) {
        throw handleError(error);
    }
};
