import { IUser } from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import NotificationModel from "~/models/Notification";
import ReportModel, { IReport } from "~/models/Report";
import { reportQueryConfig } from "~/queryConfig/report";
import { buildQueryFromSearchParams } from "~/queryConfig/utils";
import { handleError } from "~/utils/util.server";
import { IReportCreateDTO, IReportUpdateDTO } from "~/validation/report";

export const createReport = async (
    user: IUser,
    createData: IReportCreateDTO,
): Promise<ServiceResult<IReport>> => {
    try {
        const reportData = { ...createData, reporter: user._id };

        const reportExisting = await ReportModel.findOne({
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
            user: user._id,
            title: "We have your report!",
            message: `Thank you for your report! We will review it soon, and if we find any issues, we will take appropriate action.`,
            type: "info",
        });

        return {
            message: "Report created successfully",
            data: newReport,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const updateReport = async (
    reportId: string,
    updateData: IReportUpdateDTO,
): Promise<ServiceResult<IReport>> => {
    try {
        const updatedReport = await ReportModel.findByIdAndUpdate(
            reportId,
            updateData,
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedReport) {
            throw data({ error: "Report not found" }, { status: 404 });
        }
        return {
            message: "Report updated successfully",
            data: updatedReport,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteReport = async (
    reportId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const deletedReport =
            await ReportModel.findByIdAndDelete(reportId).lean();
        if (!deletedReport) {
            throw data({ error: "Report not found" }, { status: 404 });
        }
        return { message: "Report deleted successfully" };
    } catch (error) {
        throw handleError(error);
    }
};

export const readReports = async (
    searchParams: URLSearchParams,
): Promise<ServiceResult<IReport[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams(searchParams, reportQueryConfig);

        const reports = await ReportModel.find(query)
            .skip(offset)
            .limit(limit)
            .sort(sortBy ? { [sortBy]: sortOrder } : undefined)
            .lean()
            .exec();

        const totalCount = await ReportModel.countDocuments(query).exec();
        const hasMore = offset + reports.length < totalCount;

        return { data: reports, hasMore };
    } catch (error) {
        throw handleError(error);
    }
};

export const readReportById = async (
    reportId: string,
): Promise<ServiceResult<IReport>> => {
    try {
        const report = await ReportModel.findById(reportId).lean().exec();
        if (!report) {
            throw json({ error: "Report not found" }, { status: 404 });
        }
        return { data: report };
    } catch (error) {
        throw handleError(error);
    }
};
