import { IUser } from "@paciorekj/iron-journal-shared";
import { data, json } from "@remix-run/node";
import { ServiceResult } from "~/interfaces/service-result";
import OneRepMaxAttemptData, {
    IOneRepMaxAttemptData,
} from "~/models/OneRepMaxAttemptData";
import OneRepMaxData, { IOneRepMaxData } from "~/models/OneRepMaxData";
import {
    deNormalizeWeight,
    IUnitsWeight,
    normalizeWeight,
} from "~/utils/noramlizeUnits.server";
import {
    buildPopulateOptions,
    buildQueryFromSearchParams,
    oneRepMaxQueryConfig,
} from "~/utils/query.server";
import { handleError } from "~/utils/util.server";
import {
    IOneRepMaxCreateDTO,
    IOneRepMaxUpdateDTO,
} from "~/validation/one-rep-max-data.server";
import { awardXp } from "./awardXp";

export interface IOneRepMaxDataDenormalized
    extends Omit<IOneRepMaxData, "weight"> {
    weight: IUnitsWeight;
}

const normalizeOneRepMaxData = (
    data: (IOneRepMaxCreateDTO | IOneRepMaxUpdateDTO) & {
        userId: IOneRepMaxData["userId"];
    },
    measurementSystem: IUser["measurementSystemPreference"],
): IOneRepMaxData =>
    ({
        ...data,
        weight: data.weight
            ? normalizeWeight(data.weight, measurementSystem)
            : undefined,
    }) as unknown as IOneRepMaxData;

const deNormalizeOneRepMaxData = (
    data: IOneRepMaxData,
    measurementSystem: IUser["measurementSystemPreference"],
): IOneRepMaxDataDenormalized =>
    ({
        ...data,
        weight: data.weight
            ? deNormalizeWeight(data.weight, measurementSystem)
            : ({ kg: 0, lb: 0 } as IUnitsWeight),
    }) as unknown as IOneRepMaxDataDenormalized;

export const createOneRepMaxData = async (
    user: IUser,
    oneRepMax: IOneRepMaxCreateDTO,
): Promise<ServiceResult<IOneRepMaxData | IOneRepMaxAttemptData>> => {
    try {
        const normalizedOneRepMaxData = normalizeOneRepMaxData(
            {
                ...oneRepMax,
                userId: user._id as unknown as IOneRepMaxData["userId"],
            },
            user.measurementSystemPreference,
        );

        const existingRecord = await OneRepMaxData.findOne({
            userId: normalizedOneRepMaxData.userId,
            exercise: normalizedOneRepMaxData.exercise,
        }).lean();

        if (
            existingRecord &&
            existingRecord?.weight >= normalizedOneRepMaxData.weight
        ) {
            const attempt = await OneRepMaxAttemptData.create({
                ...normalizedOneRepMaxData,
                userId: user._id as unknown as IOneRepMaxAttemptData["userId"],
            });

            if (!attempt) {
                return json(
                    {
                        message: "Error creating one-rep max attempt data.",
                    },
                    { status: 500 },
                );
            }

            const leveling = await awardXp(
                user._id.toString(),
                "completeOneRepMaxAttempt",
            );

            return json(
                {
                    message: "One Rep Max has not improved.",
                    data: attempt.toJSON(),
                    leveling,
                },
                { status: 201 },
            );
        }

        const newRecord = await OneRepMaxData.create({
            userId: normalizedOneRepMaxData.userId,
            exercise: normalizedOneRepMaxData.exercise,
            weight: normalizedOneRepMaxData.weight,
        });

        if (!newRecord) {
            return json(
                {
                    message: "Error updating one-rep max data.",
                },
                { status: 500 },
            );
        }
        if (existingRecord) {
            const historicalRecordData = {
                userId: existingRecord.userId,
                exercise: existingRecord.exercise,
                weight: existingRecord.weight,
                notes: existingRecord.notes,
                createdAt: existingRecord.createdAt,
            };
            await OneRepMaxAttemptData.create(historicalRecordData);
        }

        const leveling = await awardXp(
            user._id.toString(),
            "completeOneRepMax",
        );

        return json(
            {
                message: "One-rep max data created/updated successfully.",
                data: newRecord,
                leveling,
            },
            { status: 201 },
        );
    } catch (error) {
        throw handleError(error);
    }
};

export const readOneRepMaxData = async (
    user: IUser,
    searchParams: URLSearchParams,
): Promise<ServiceResult<IOneRepMaxDataDenormalized[]>> => {
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

        const deNormalizedData = data.map((record) =>
            deNormalizeOneRepMaxData(record, user.measurementSystemPreference),
        );

        return {
            data: deNormalizedData,
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
): Promise<ServiceResult<IOneRepMaxDataDenormalized>> => {
    try {
        let queryObj = OneRepMaxData.findById(oneRepMaxDataId);

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

        const deNormalizedOneRepMaxData = deNormalizeOneRepMaxData(
            oneRepMaxData,
            user.measurementSystemPreference,
        );

        return { data: deNormalizedOneRepMaxData };
    } catch (error) {
        throw handleError(error);
    }
};
