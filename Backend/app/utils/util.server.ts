import { json } from "@remix-run/node";
import mongoose from "mongoose";

type AllCombinations<T> = T extends object
    ?
          | Record<string, any>
          | ({ [K in keyof T]: T[K] } & {
                [K in keyof T]?: AllCombinations<Omit<T, K>>;
            })
    : never;

type IFieldConfigBase = {
    isArray: boolean;
    constructor: (value: string) => any;
    regex: (value: string) => RegExp;
};

type IFieldConfig = AllCombinations<IFieldConfigBase>;

type IQueryField<T> =
    | T
    | { $in: T[] }
    | { $all: T[] }
    | { $regex: RegExp }
    | { $eq: T };

type IQuery<T> = {
    [K in keyof T]?: IQueryField<T[K]>;
};

type IBuildQueryConfig = Record<string, IFieldConfig>;

export const buildQueryFromSearchParams = <T>(
    searchParams: URLSearchParams,
    config: Record<string, IFieldConfig>,
) => {
    const query: IQuery<T> = {};

    Object.entries(config).forEach(([key, fieldConfig]) => {
        if (["limit", "offset", "sortBy", "sortOrder"].includes(key)) {
            return;
        }

        const {
            isArray = false,
            constructor = (value: string) => value,
            regex = null,
        } = fieldConfig || {};
        const paramValue = searchParams.get(key);

        if (paramValue) {
            if (isArray) {
                const arrayValue = paramValue
                    .split(",")
                    .map((value) => constructor(value.trim())) as unknown[];

                if (arrayValue.length > 0) {
                    query[key as keyof T] = { $in: arrayValue } as IQueryField<
                        T[keyof T]
                    >;
                }
            } else {
                const value = constructor(paramValue.trim());
                if (regex && typeof value === "string") {
                    // Ensure regex is applied correctly for substring matching
                    query[key as keyof T] = {
                        $regex: regex(value),
                        $options: "i",
                    } as IQueryField<T[keyof T]>;
                } else {
                    query[key as keyof T] = value as IQueryField<T[keyof T]>;
                }
            }
        }
    });

    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const sortBy = searchParams.get("sortBy") as string;
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;

    return { query, limit, offset, sortBy, sortOrder };
};

export function buildPopulateOptions(
    searchParams: URLSearchParams,
    key: string,
): any[] {
    const populate = searchParams.get(key);
    if (!populate) return [];

    const fieldsToPopulate = Array.from(
        new Set(populate.split(",").map((field) => field.trim())),
    ); // Remove duplicates

    return fieldsToPopulate.map((field) => {
        const [path, selectFields] = field.includes("(")
            ? [
                  field.split("(")[0],
                  field.match(/\((.*)\)/)?.[1].replace(")", ""),
              ]
            : [field, null];

        return {
            path: path.trim(),
            select: selectFields
                ? selectFields
                      .split(",")
                      .map((f) => f.trim())
                      .join(" ")
                : undefined,
        };
    });
}

export function convertKeysToCamelCase(
    obj: Record<string, any>,
): Record<string, any> {
    const newObj: Record<string, any> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const camelCaseKey = key.replace(/-([a-z])/g, (g) =>
                g[1].toUpperCase(),
            );
            newObj[camelCaseKey] = obj[key];
        }
    }

    return newObj;
}

/**
 * Validates that the request body is a non-empty JSON object.
 * @param {Request} request - The request object.
 * @returns {Promise<Object>} The validated request body.
 * @throws {Response} A 400 response if the request body is invalid.
 */
export async function validateRequestBody(request: Request) {
    const contentType = request.headers.get("content-type");
    if (!contentType || contentType !== "application/json") {
        throw json(
            { error: "Invalid content type. Expecting application/json" },
            { status: 400 },
        );
    }

    const requestData = await request.json();

    if (!requestData || Object.keys(requestData).length === 0) {
        throw json(
            {
                error: "Request body is empty. Request body is required to update a program",
            },
            { status: 400 },
        );
    }

    return requestData;
}

export function validateDatabaseId(id: string) {
    if (!id || !mongoose.isValidObjectId(id)) {
        throw json({ error: "No id provided" }, { status: 400 });
    }
    return id;
}

export type { IBuildQueryConfig, IFieldConfig, IQuery, IQueryField };
