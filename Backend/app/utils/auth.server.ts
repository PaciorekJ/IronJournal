import { IUser, User } from "@paciorekj/iron-journal-shared/models";
import { json } from "@remix-run/node";
import admin from "firebase-admin";

import serviceAccount from "~/serviceAccountKey.json";

const App =
    admin.apps.length === 0 || admin.apps[0] === undefined
        ? admin.initializeApp(
              {
                  credential: admin.credential.cert(
                      serviceAccount as admin.ServiceAccount,
                  ),
              },
              "Iron-Journal-API",
          )
        : admin.apps[0];

/**
 * Verifies the Firebase Authentication idToken in the Authorization header of the request.
 * If the token is invalid or missing, throws a 401 error.
 * @param request The request object.
 * @returns The decoded token if the token is valid.
 */
export async function isLoginValid(request: Request) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        throw json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await admin
            .auth(App as any)
            .verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw json({ error: "Invalid token" }, { status: 401 });
    }
}

/**
 * Verifies the Firebase Authentication idToken in the Authorization header of the request.
 * If the token is invalid or missing, throws a 401 error.
 * If the predicate is defined and fails, throws a 403 error.
 * If the user is required in the config but is not found, throws a 404 error.
 * @param request The request object.
 * @param config Optional configuration object.
 * @param config.predicate An optional predicate to check if the user has the required permissions.
 * @param config.firebaseToken If true, the firebaseToken is included in the result.
 * @param config.user If true, the user is included in the result.
 * @returns An object containing the user and/or the firebaseToken if required in the config.
 */
export const requirePredicate = async <
    U extends boolean | undefined = undefined,
    F extends boolean | undefined = undefined,
>(
    request: Request,
    config?: {
        predicate?: (user: IUser) => boolean;
        firebaseToken?: F;
        user?: U;
    },
): Promise<
    (U extends true ? { user: IUser } : {}) &
        (F extends true ? { firebaseToken: admin.auth.DecodedIdToken } : {}) & {
            isBot: boolean;
        }
> => {
    let user: IUser | null = null;
    let firebaseToken: admin.auth.DecodedIdToken | null = null;
    let isBot = false;

    try {
        await authenticateDiscordBot(request);
        isBot = true;
    } catch {
        if (process.env.NODE_ENV === "development") {
            user = await User.findOneAndUpdate(
                { firebaseId: "test" },
                {
                    $set: {
                        firebaseId: "test",
                        username: "test",
                        languagePreference: "en",
                        measurementSystemPreference: "METRIC",
                        timezone: "America/Chicago",
                    },
                },
                { upsert: true },
            );
            firebaseToken = "test" as any;
        } else {
            // Get the Firebase token info
            firebaseToken = await isLoginValid(request);

            // Find the user in your database
            user = await User.findOne({
                firebaseId: firebaseToken.uid,
            }).lean();
        }
    }

    // Handle the case where a predicate is defined but fails
    if (
        config?.predicate &&
        user &&
        !config.predicate(user as IUser) &&
        !isBot
    ) {
        throw json(
            { error: "Forbidden: Insufficient permissions" },
            { status: 403 },
        );
    }

    // Initialize the result object
    const result: Partial<{
        firebaseToken: admin.auth.DecodedIdToken;
        user: IUser;
        isBot: boolean;
    }> = {
        isBot,
    };

    // Handle the case where user is required in the config
    if (config?.user) {
        if (!user) {
            throw json(
                { error: "User doesn't have an account yet" },
                { status: 404 },
            );
        }
        result.user = user as IUser;
    }

    // Assign the firebaseToken if required in the config
    if (config?.firebaseToken) {
        result.firebaseToken = firebaseToken as admin.auth.DecodedIdToken;
    }

    return result as (U extends true ? { user: IUser } : {}) &
        (F extends true ? { firebaseToken: admin.auth.DecodedIdToken } : {}) & {
            isBot: boolean;
        };
};

/**
 * Ensures that the incoming request is from your Discord bot,
 * by validating the Authorization: Bearer <SERVER_AUTH_TOKEN> header.
 */

export async function authenticateDiscordBot(request: Request) {
    const auth = request.headers.get("Authorization") || "";
    const [scheme, token] = auth.split(" ");

    if (scheme !== "Bearer" || token !== process.env.SERVER_AUTH_TOKEN) {
        throw json({ error: "Unauthorized" }, { status: 401 });
    }
}
