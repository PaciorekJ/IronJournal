import { IUser } from "@paciorekj/iron-journal-shared/models/user";
import { data } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import { DailyData, IBodyMeasurement, IDailyData } from "~/models/DailyData";
import {
    IUnitsDistance,
    IUnitsVolume,
    IUnitsWeight,
    normalizeDistance,
    normalizeVolume,
    normalizeWeight,
} from "~/utils/noramlizeUnits.server";
import {
    buildQueryFromSearchParams,
    dailyDataQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import { IDailyDataCreateDTO } from "~/validation/daily-data.server";

const stripTime = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const incrementWaterIntake = async (
    user: IUser,
    dailyData: IDailyDataCreateDTO,
): Promise<ServiceResult<undefined>> => {
    try {
        const createdAt = stripTime(new Date(dailyData.createdAt));

        const incrementValue = normalizeVolume(
            dailyData.waterIntake as IUnitsVolume,
            user.measurementSystemPreference,
        );

        if (!dailyData.waterIntake) {
            throw data({ error: "Water intake is required" }, { status: 400 });
        }

        const result = await DailyData.updateOne(
            { userId: user._id, createdAt },
            { $inc: { waterIntakeInLiters: incrementValue } },
            { upsert: true, runValidators: true },
        );

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
            throw new Error("Failed to update water intake");
        }

        return {
            message: "Water intake incremented successfully",
        };
    } catch (error) {
        throw error;
    }
};

export const createOrUpdateDailyData = async (
    user: IUser,
    dailyData: IDailyDataCreateDTO,
): Promise<ServiceResult<IDailyData>> => {
    try {
        // Normalize the createdAt field to the start of the day
        const normalizedDate = stripTime(new Date(dailyData.createdAt));

        // Start building normalizedData
        const normalizedData: Partial<IDailyData> = {
            ...dailyData,
            createdAt: normalizedDate,
        } as unknown as Partial<IDailyData>; // Temporary type mismatch, resolved in the steps below.

        // Check and normalize bodyWeight
        if (dailyData.bodyWeight) {
            normalizedData.bodyWeight = normalizeWeight(
                dailyData.bodyWeight as IUnitsWeight,
                user.measurementSystemPreference,
            );
        }

        // Check and normalize waterIntake
        if (dailyData.waterIntake) {
            normalizedData.waterIntake = normalizeVolume(
                dailyData.waterIntake as IUnitsVolume,
                user.measurementSystemPreference,
            );
        }

        // Check and normalize bodyMeasurements
        if (dailyData.bodyMeasurements) {
            normalizedData.bodyMeasurements = (
                Object.keys(
                    dailyData.bodyMeasurements,
                ) as (keyof IBodyMeasurement)[]
            ).reduce(
                (acc, key) => {
                    const measurement = dailyData.bodyMeasurements![key];
                    if (measurement) {
                        acc[key] = normalizeDistance(
                            measurement as IUnitsDistance,
                            user.measurementSystemPreference,
                        );
                    }
                    return acc;
                },
                {} as Record<keyof IBodyMeasurement, number | undefined>,
            );
        }

        const dailyDataEntry = (await DailyData.findOneAndUpdate(
            { userId: user._id, createdAt: normalizedDate },
            { $set: normalizedData },
            { upsert: true, new: true, runValidators: true },
        ).lean()) as IDailyData;

        if (!dailyDataEntry) {
            throw new Error("DailyData not found or failed to update");
        }

        return {
            message: "DailyData updated successfully",
            data: dailyDataEntry,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readDailyData = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IDailyData[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IDailyData>(
                searchParams,
                dailyDataQueryConfig,
            ) as any;

        const startDateString = searchParams.get("startDate") || null;
        const endDateString = searchParams.get("endDate") || null;

        if (startDateString) {
            const startDate = stripTime(new Date(startDateString));
            query.createdAt = {
                $gte: startDate,
            };
        }

        if (endDateString) {
            const endDate = stripTime(new Date(endDateString));
            query.createdAt = {
                ...query.createdAt,
                $lte: endDate,
            };
        }

        query.userId = user._id;

        const sortOption: Record<string, 1 | -1> = sortBy
            ? { [sortBy]: sortOrder }
            : { createdAt: -1 };

        const dailyDataEntries = (await DailyData.find(query)
            .sort(sortOption)
            .skip(offset)
            .limit(limit)
            .lean()) as IDailyData[];

        const totalCount = await DailyData.countDocuments(query);

        const hasMore = offset + dailyDataEntries.length < totalCount;

        return {
            message: "DailyData retrieved successfully",
            data: dailyDataEntries,
            hasMore,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readDailyDataById = async (
    user: IUser,
    dailyDataId: string,
): Promise<ServiceResult<IDailyData>> => {
    try {
        const dailyData = (await DailyData.findOne({
            _id: dailyDataId,
            userId: user._id,
        }).lean()) as IDailyData;

        if (!dailyData) {
            throw new Error("DailyData not found");
        }

        return {
            message: "DailyData retrieved successfully",
            data: dailyData,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteDailyData = async (
    user: IUser,
    dailyDataId: string,
): Promise<ServiceResult<undefined>> => {
    try {
        const dailyData = await DailyData.findOne({
            _id: dailyDataId,
            userId: user._id,
        });

        if (!dailyData) {
            throw new Error("DailyData not found");
        }

        await dailyData.deleteOne();

        return {
            message: "DailyData deleted successfully",
        };
    } catch (error) {
        throw handleError(error);
    }
};
