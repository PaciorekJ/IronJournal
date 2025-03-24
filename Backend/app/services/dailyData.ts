import { IUser } from "@paciorekj/iron-journal-shared/models/user";
import { data } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import { DailyData, IBodyMeasurement, IDailyData } from "~/models/DailyData";
import { dailyDataQueryConfig } from "~/queryConfig/dailyData";
import { buildQueryFromSearchParams } from "~/queryConfig/utils";
import {
    deNormalizeDistance,
    deNormalizeVolume,
    deNormalizeWeight,
    IUnitsDistance,
    IUnitsVolume,
    IUnitsWeight,
    normalizeDistance,
    normalizeVolume,
    normalizeWeight,
} from "~/utils/noramlizeUnits.server";
import { handleError } from "~/utils/util.server";
import {
    bodyMeasurementSchema,
    IDailyDataCreateDTO,
    IDailyDataUpdateDTO,
} from "~/validation/daily-data.server";
import { awardXp } from "./awardXp";

export type DenormalizedBodyMeasurement = {
    [key in keyof IBodyMeasurement]: IUnitsDistance | undefined;
};

export interface IDailyDataDenormalized
    extends Omit<
        IDailyData,
        "bodyMeasurements" | "waterIntake" | "bodyWeight"
    > {
    bodyMeasurements: DenormalizedBodyMeasurement;
    waterIntake: IUnitsVolume | undefined;
    bodyWeight: IUnitsWeight | undefined;
}

const normalizeDailyData = (
    dailyData: IDailyDataCreateDTO | IDailyDataUpdateDTO,
    user: IUser,
): IDailyData => {
    const normalizedDailyData = { ...dailyData } as unknown as IDailyData;

    if ("bodyMeasurements" in dailyData) {
        const measurementsTaken = Object.keys(
            bodyMeasurementSchema.shape,
        ) as (keyof IBodyMeasurement)[];

        normalizedDailyData.bodyMeasurements = measurementsTaken.reduce(
            (acc, measurement) => {
                acc[measurement] = dailyData.bodyMeasurements?.[measurement]
                    ? normalizeDistance(
                          dailyData.bodyMeasurements[measurement],
                          user.measurementSystemPreference,
                      )
                    : undefined;
                return acc;
            },
            {} as IBodyMeasurement,
        );
    }

    if ("waterIntake" in dailyData) {
        normalizedDailyData.waterIntake = dailyData.waterIntake
            ? normalizeVolume(
                  dailyData.waterIntake,
                  user.measurementSystemPreference,
              )
            : undefined;
    }

    if ("bodyWeight" in dailyData) {
        normalizedDailyData.bodyWeight = dailyData.bodyWeight
            ? normalizeWeight(
                  dailyData.bodyWeight,
                  user.measurementSystemPreference,
              )
            : undefined;
    }

    return normalizedDailyData;
};

const deNormalizeDailyData = (
    dailyData: IDailyData,
    user: IUser,
): IDailyDataDenormalized => {
    const deNormalizedDailyData = { ...dailyData } as IDailyDataDenormalized;

    const measurementsTaken = Object.keys(
        bodyMeasurementSchema.shape,
    ) as (keyof DenormalizedBodyMeasurement)[];
    deNormalizedDailyData.bodyMeasurements = measurementsTaken.reduce(
        (acc, measurement) => {
            acc[measurement] = dailyData.bodyMeasurements?.[measurement]
                ? deNormalizeDistance(
                      dailyData.bodyMeasurements[measurement],
                      user.measurementSystemPreference,
                  )
                : undefined;
            return acc;
        },
        {} as DenormalizedBodyMeasurement,
    );

    // De-normalize water intake
    deNormalizedDailyData.waterIntake = dailyData.waterIntake
        ? deNormalizeVolume(
              dailyData.waterIntake,
              user.measurementSystemPreference,
          )
        : undefined;

    // De-normalize body weight
    deNormalizedDailyData.bodyWeight = dailyData.bodyWeight
        ? deNormalizeWeight(
              dailyData.bodyWeight,
              user.measurementSystemPreference,
          )
        : undefined;

    return deNormalizedDailyData;
};

const stripTime = (date: Date, timeZone: string): Date => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const [month, day, year] = formatter.format(date).split("/");
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
};

export const incrementWaterIntake = async (
    user: IUser,
    dailyData: IDailyDataCreateDTO,
): Promise<ServiceResult<undefined>> => {
    try {
        const createdAt = stripTime(
            new Date(dailyData.createdAt),
            user.timezone,
        );

        if (!dailyData.waterIntake) {
            throw data({ error: "Water intake is required" }, { status: 400 });
        }

        const incrementValue = normalizeVolume(
            dailyData.waterIntake,
            user.measurementSystemPreference,
        );

        const leveling = await awardXp(
            user._id.toString(),
            "completeDailyDataField",
        );

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
            leveling,
        };
    } catch (error) {
        throw error;
    }
};

export const createOrUpdateDailyData = async (
    user: IUser,
    dailyData: IDailyDataCreateDTO,
): Promise<ServiceResult<IDailyDataDenormalized>> => {
    try {
        const normalizedDate = stripTime(
            new Date(dailyData.createdAt),
            user.timezone,
        );

        const normalizedData = normalizeDailyData(dailyData, user);

        const dailyDataEntry = await DailyData.findOneAndUpdate(
            { userId: user._id, createdAt: normalizedDate },
            { $set: normalizedData },
            { upsert: true, new: true, runValidators: true },
        ).lean();

        const updatedFields = Object.keys(dailyData)
            .filter(
                (field) =>
                    !!dailyData[field as keyof IDailyDataCreateDTO] &&
                    field !== "createdAt",
            )
            .map((field) => field as keyof IDailyDataCreateDTO);

        const leveling = await awardXp(
            user._id.toString(),
            "completeDailyDataField",
            updatedFields.length,
        );

        if (!dailyDataEntry) {
            throw new Error("DailyData not found or failed to update");
        }

        return {
            message: "DailyData updated successfully",
            data: deNormalizeDailyData(dailyDataEntry, user),
            leveling,
        };
    } catch (error) {
        throw handleError(error);
    }
};

export const readDailyData = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IDailyDataDenormalized[]>> => {
    try {
        const { query, limit, offset, sortBy, sortOrder } =
            buildQueryFromSearchParams<IDailyData>(
                searchParams,
                dailyDataQueryConfig,
            ) as any;

        const startDateString = searchParams.get("startDate") || null;
        const endDateString = searchParams.get("endDate") || null;

        if (startDateString) {
            const startDate = stripTime(
                new Date(startDateString),
                user.timezone,
            );
            query.createdAt = {
                $gte: startDate,
            };
        }

        if (endDateString) {
            const endDate = stripTime(new Date(endDateString), user.timezone);
            query.createdAt = {
                ...query.createdAt,
                $lte: endDate,
            };
        }

        query.userId = user._id;

        const sortOption: Record<string, 1 | -1> = sortBy
            ? { [sortBy]: sortOrder }
            : { createdAt: -1 };

        const dailyDataEntries = (
            await DailyData.find(query)
                .sort(sortOption)
                .skip(offset)
                .limit(limit)
                .lean()
        ).map((dailyData) => deNormalizeDailyData(dailyData, user));

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
): Promise<ServiceResult<IDailyDataDenormalized>> => {
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
            data: deNormalizeDailyData(dailyData, user),
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
