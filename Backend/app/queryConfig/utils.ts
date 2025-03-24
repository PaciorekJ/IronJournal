import { LanguageKey } from "@paciorekj/iron-journal-shared";
import { data } from "@remix-run/node";
import { z } from "node_modules/zod/lib/external";
import { handleError } from "~/utils/util.server";

type AllCombinations<T> = T extends object
    ?
          | Record<string, any>
          | ({
                [K in keyof T]: T[K];
            } & {
                [K in keyof T]?: AllCombinations<Omit<T, K>>;
            })
    : never;
type IFieldConfigBase = {
    isArray: boolean;
    constructor: (value: string) => any;
    regex: (value: string) => RegExp;
    schema?: z.ZodType<any>;
    getFieldPath?: (language: LanguageKey) => string;
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
    language?: LanguageKey,
) => {
    const query: IQuery<T> = {};
    let limit = 10; // default limit
    let offset = 0; // default offset
    let sortBy: string | null = null;
    let sortOrder: 1 | -1 = 1; // default to ascending order

    for (const [key, fieldConfig] of Object.entries(config)) {
        const {
            isArray = false,
            constructor = (value: string) => value,
            regex = null,
            schema,
            getFieldPath,
        } = fieldConfig || {};

        const paramValue = searchParams.get(key);

        // If the parameter is provided and not empty, process it
        if (paramValue !== null && paramValue.trim() !== "") {
            let parsedValue: any;

            // Convert param value to the correct type
            try {
                if (isArray) {
                    parsedValue = paramValue
                        .split(",")
                        .map((value) => constructor(value.trim()));
                } else {
                    parsedValue = constructor(paramValue.trim());
                }
            } catch (error) {
                throw data(
                    { error: `Invalid value for ${key}` },
                    { status: 400 },
                );
            }

            // Validate using Zod if schema exists
            if (schema && parsedValue) {
                try {
                    if (isArray) {
                        parsedValue = schema.array().parse(parsedValue);
                    } else {
                        parsedValue = schema.parse(parsedValue);
                    }
                } catch (error) {
                    throw handleError(error); // Handles Zod validation errors
                }
            }

            // Determine the field path for the query, based on language or key
            const fieldPath = getFieldPath ? getFieldPath(language) : key;

            // Handle pagination, sorting, and filtering
            if (key === "limit") {
                limit = parsedValue || 10;
            } else if (key === "offset") {
                offset = parsedValue || 0;
            } else if (key === "sortBy") {
                sortBy = parsedValue || null;
            } else if (key === "sortOrder") {
                sortOrder = parsedValue === "desc" ? -1 : 1;
            } else if (isArray && parsedValue.length > 0) {
                query[fieldPath as keyof T] = {
                    $in: parsedValue,
                } as IQueryField<T[keyof T]>;
            } else if (regex && typeof parsedValue === "string") {
                query[fieldPath as keyof T] = {
                    $regex: regex(parsedValue),
                    $options: "i", // Ensure case-insensitivity
                } as IQueryField<T[keyof T]>;
            } else if (parsedValue) {
                query[fieldPath as keyof T] = parsedValue as IQueryField<
                    T[keyof T]
                >;
            }
        }
    }

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

        let select;

        if (selectFields) {
            // Split selectFields into an array
            let fields = selectFields.split(",").map((f) => f.trim());

            if (path.trim() === "userId") {
                // Remove 'firebaseId' from fields if present
                fields = fields.filter((f) => f !== "firebaseId");
                if (fields.length > 0) {
                    select = fields.join(" ");
                } else {
                    select = "-firebaseId";
                }
            } else {
                select = fields.join(" ");
            }
        } else if (path.trim() === "userId") {
            // No selectFields specified, exclude 'firebaseId' using exclusion projection
            select = "-firebaseId";
        }

        return {
            path: path.trim(),
            select: select || undefined,
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
            schema: z.number().positive().default(10),
        },
        offset: {
            isArray: false,
            constructor: Number,
            schema: z.number().nonnegative().default(0),
        },
        sortBy: {
            isArray: false,
            constructor: String,
            schema: z.enum(Object.keys(config) as any),
        },
        sortOrder: {
            isArray: false,
            constructor: String,
            schema: z.enum(["asc", "desc"]).default("asc"),
        },
    };

    return { ...config, ...paginationAndSortingConfig };
}
export type { AllCombinations, IBuildQueryConfig, IQuery, IQueryField };
