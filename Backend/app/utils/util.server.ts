import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { z } from "zod";

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
    validationSchema?: z.ZodType<any>;
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
    config: IBuildQueryConfig,
) => {
    const query: IQuery<T> = {};
    let limit = 10;
    let offset = 0;
    let sortBy: string | null = null;
    let sortOrder = 1;

    Object.entries(config).forEach(([key, fieldConfig]) => {
        const {
            isArray = false,
            constructor = (value: string) => value,
            regex = null,
            validationSchema, // Optional Zod validation schema
        } = fieldConfig || {};

        const paramValue = searchParams.get(key);

        if (paramValue) {
            let parsedValue: any;

            // Apply constructor function to convert the paramValue to the correct type
            try {
                if (isArray) {
                    parsedValue = paramValue
                        .split(",")
                        .map((value) => constructor(value.trim()));
                } else {
                    parsedValue = constructor(paramValue.trim());
                }
            } catch (error) {
                throw json(
                    { error: `Invalid value for ${key}` },
                    { status: 400 },
                );
            }

            // Validate the parsed value using Zod if a validation schema exists
            try {
                if (validationSchema) {
                    if (isArray) {
                        parsedValue = validationSchema
                            .array()
                            .parse(parsedValue);
                    } else {
                        parsedValue = validationSchema.parse(parsedValue);
                    }
                }
            } catch (error) {
                throw handleError(error); // Handles Zod errors
            }

            // Handle pagination, sorting, and filtering
            if (key === "limit") {
                limit = parsedValue;
            } else if (key === "offset") {
                offset = parsedValue;
            } else if (key === "sortBy") {
                sortBy = parsedValue;
            } else if (key === "sortOrder") {
                sortOrder = parsedValue === "desc" ? -1 : 1;
            } else if (isArray && parsedValue.length > 0) {
                query[key as keyof T] = { $in: parsedValue } as IQueryField<
                    T[keyof T]
                >;
            } else if (regex && typeof parsedValue === "string") {
                query[key as keyof T] = {
                    $regex: regex(parsedValue),
                    $options: "i",
                } as IQueryField<T[keyof T]>;
            } else {
                query[key as keyof T] = parsedValue as IQueryField<T[keyof T]>;
            }
        }
    });

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
    );

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

export function addPaginationAndSorting<T extends IBuildQueryConfig>(
    config: T,
) {
    const paginationAndSortingConfig: IBuildQueryConfig = {
        limit: {
            isArray: false,
            constructor: Number,
            validationSchema: z.number().positive().default(10),
        },
        offset: {
            isArray: false,
            constructor: Number,
            validationSchema: z.number().nonnegative().default(0),
        },
        sortBy: {
            isArray: false,
            constructor: String,
            validationSchema: z.enum(Object.keys(config) as any),
        },
        sortOrder: {
            isArray: false,
            constructor: String,
            validationSchema: z.enum(["asc", "desc"]).default("asc"),
        },
    };

    return { ...config, ...paginationAndSortingConfig };
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
    // Check for content type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw json(
            { error: "Invalid content type. Expecting application/json" },
            { status: 400 },
        );
    }

    // Check for Content-Length or empty body
    const contentLength = request.headers.get("content-length");
    if (!contentLength || parseInt(contentLength, 10) === 0) {
        throw json(
            {
                error: "Request body is missing or empty. A valid JSON body is required.",
            },
            { status: 400 },
        );
    }

    // Parse the body as text
    let rawBody;
    try {
        rawBody = await request.text(); // Read body as plain text first
    } catch (e) {
        throw json(
            { error: "Failed to read the request body." },
            { status: 400 },
        );
    }

    // Try to convert the text into JSON
    let requestData;
    try {
        requestData = JSON.parse(rawBody); // Convert the raw text into JSON
    } catch (e) {
        throw json(
            { error: "Invalid JSON body. Please provide valid JSON." },
            { status: 400 },
        );
    }

    // Ensure the parsed body is a non-null object
    if (typeof requestData !== "object" || requestData === null) {
        throw json(
            {
                error: "Invalid JSON body. Please provide a non-empty JSON object.",
            },
            { status: 400 },
        );
    }

    // Ensure the parsed body is not empty
    if (Object.keys(requestData).length === 0) {
        throw json(
            {
                error: "Request body is empty. Request body is required to update a program.",
            },
            { status: 400 },
        );
    }

    return requestData;
}

export function validateDatabaseId(id: string) {
    if (!id || !mongoose.isValidObjectId(id)) {
        throw json(
            { error: "No id provided, or an invalid Id has been provided." },
            { status: 400 },
        );
    }
    return id;
}

/**
 * Handles errors that occur during request processing.
 * @param {unknown} error The error that occurred.
 * @returns {Response} A response object that should be returned to the client.
 * If the error is a ZodError, it will be converted into a 400 response with an
 * error and a details property containing the ZodError's errors property.
 * If the error is a Response object, it will be returned as is.
 * Otherwise, a 500 response will be returned with an error message.
 */
export function handleError(error: unknown) {
    if (error instanceof z.ZodError) {
        return json(
            { error: "Validation failed", details: error.errors },
            { status: 400 },
        );
    }

    if (error instanceof Response) {
        return error;
    }

    return json({ error: "An unexpected error occurred" }, { status: 500 });
}

export type { IBuildQueryConfig, IFieldConfig, IQuery, IQueryField };
