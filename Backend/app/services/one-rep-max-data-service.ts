import { IUser } from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import OneRepMaxData, { IOneRepMaxData } from "~/models/OneRepMaxData";
import { normalizeWeight } from "~/utils/noramlizeUnits.server";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    oneRepMaxQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";

export const createOneRepMaxData = async (
    user: IUser,
    exerciseId: string,
    weight: number,
): Promise<ServiceResult<IOneRepMaxData>> => {
    try {
        const existingRecord = await OneRepMaxData.findOne({
            userId: user._id,
            exercise: exerciseId,
        });

        if (existingRecord) {
            throw json(
                { error: "A record for this exercise already exists." },
                { status: 400 },
            );
        }

        const normalizedWeight = normalizeWeight(
            { kg: weight, lb: weight },
            user.measurementSystemPreference,
        );

        const newRecord = await OneRepMaxData.findOneAndUpdate(
            { userId: user._id, exercise: exerciseId },
            { weight: normalizedWeight, updatedAt: new Date() },
            { upsert: true, new: true },
        );

        return {
            message: "One-rep max data created successfully.",
            data: newRecord,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readOneRepMaxData = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IOneRepMaxData[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IOneRepMaxData>(
                searchParams,
                oneRepMaxQueryConfig,
            ) as any;

        query.userId = user._id;

        let queryObj = OneRepMaxData.find(query)
            .sort({ [sortBy || "updatedAt"]: sortOrder })
            .skip(offset)
            .limit(limit);

        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const data = await queryObj.exec();
        const totalCount = await OneRepMaxData.countDocuments(query).exec();

        return {
            data,
            hasMore: offset + data.length < totalCount,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteOneRepMaxData = async (
    user: IUser,
    oneRepMaxDataId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const record = await OneRepMaxData.findOne({
            _id: oneRepMaxDataId,
            userId: user._id,
        });

        if (!record) {
            throw data(
                { error: "Record not found or unauthorized." },
                { status: 404 },
            );
        }

        await OneRepMaxData.deleteOne({ _id: oneRepMaxDataId });

        return {
            message: "One-rep max data deleted successfully.",
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readOneRepMaxDataById = async (
    user: IUser,
    oneRepMaxDataId: string,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IOneRepMaxData>> => {
    try {
        let queryObj = OneRepMaxData.findById(oneRepMaxDataId);

        // Populate options (e.g., exercise details)
        const populateOptions = buildPopulateOptions(searchParams, "populate");
        populateOptions.forEach((option) => {
            queryObj = queryObj.populate(option);
        });

        const oneRepMaxData = (await queryObj.lean().exec()) as IOneRepMaxData;

        if (!oneRepMaxData) {
            throw data(
                { error: "One-rep max data not found" },
                { status: 404 },
            );
        }

        // Ensure the user has access to the data
        if (oneRepMaxData.userId.toString() !== user._id.toString()) {
            throw data(
                { error: "Forbidden: You do not have access to this data" },
                { status: 403 },
            );
        }

        return { data: oneRepMaxData };
    } catch (error) {
        throw handleError(error);
    }
};
