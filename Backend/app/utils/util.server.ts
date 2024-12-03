import { LanguageKey } from "@paciorekj/iron-journal-shared/constants";
import { data } from "@remix-run/node";
import mongoose, { MongooseError } from "mongoose";
import { z } from "zod";
import { languagePreferenceSchema } from "~/validation/user.server";

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
        throw data(
            { error: "Invalid content type. Expecting application/json" },
            { status: 400 },
        );
    }

    // Check for Content-Length or empty body
    const contentLength = request.headers.get("content-length");
    if (!contentLength || parseInt(contentLength, 10) === 0) {
        throw data(
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
        throw data(
            { error: "Failed to read the request body." },
            { status: 400 },
        );
    }

    // Try to convert the text into JSON
    let requestData;
    try {
        requestData = JSON.parse(rawBody); // Convert the raw text into JSON
    } catch (e) {
        throw data(
            { error: "Invalid JSON body. Please provide valid JSON." },
            { status: 400 },
        );
    }

    // Ensure the parsed body is a non-null object
    if (typeof requestData !== "object" || requestData === null) {
        throw data(
            {
                error: "Invalid JSON body. Please provide a non-empty JSON object.",
            },
            { status: 400 },
        );
    }

    // Ensure the parsed body is not empty
    if (Object.keys(requestData).length === 0) {
        throw data(
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
        throw data(
            { error: "No id provided, or an invalid Id has been provided." },
            { status: 400 },
        );
    }
    return id;
}

export function validateLanguagePreference(language: LanguageKey) {
    const { success: isValidLangPreference, error } =
        languagePreferenceSchema.safeParse(language);

    if (!isValidLangPreference) {
        handleError(error);
    }

    return language;
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
        return data(
            { error: "Validation failed", details: error.errors },
            { status: 400 },
        );
    }

    if (error instanceof MongooseError) {
        console.error(error);
        throw data({
            status: 500,
            error: "An unexpected error occurred with the database.",
        });
    }

    if (error instanceof Error) {
        console.error(error);
        return data({ error: error.message }, { status: 500 });
    }

    if (error instanceof Response) {
        return error;
    }

    console.error(error);

    return data({ error: "An unexpected error occurred" }, { status: 500 });
}
