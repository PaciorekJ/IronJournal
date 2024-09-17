
import { json } from "@remix-run/node";
import admin from "firebase-admin";
import { IUser, User } from "~/models/user";

import serviceAccount from "~/serviceAccountKey.json";

const App =
    admin.apps.length === 0 || admin.apps[0] === undefined
    ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    }, "Iron-Journal-API")
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
      const decodedToken = await admin.auth(App as any).verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw json({ error: "Invalid token" }, { status: 401 });
    }
}


/**
 * Verifies that the user is authenticated and optionally checks a predicate.
 * Optionally returns the Firebase token info, the user info, or both.
 *
 * @param request The request object.
 * @param config Optional configuration object:
 *  - predicate: A function that takes a user and returns a boolean.
 *               If it returns false, access is denied with a 403 error.
 *  - firebaseToken: Whether to include the Firebase token info in the return value.
 *  - user: Whether to include the user info in the return value.
 * @returns An object containing the requested information based on the config.
 * @throws {Response} A 401 response if the user is not authenticated.
 * @throws {Response} A 403 response if the predicate check fails.
 * @throws {Response} A 404 response if the user document is not found.
 */
export const requirePredicate = async (
    request: Request,
    config?: {
      predicate?: (user: IUser) => boolean;
      firebaseToken?: boolean;
      user?: boolean;
    }
  ): Promise<{ firebaseToken?: admin.auth.DecodedIdToken; user?: IUser }> => {
    // Get the Firebase token info
    const firebaseToken = await isLoginValid(request);
  
    // Find the user in your database
    const user = await User.findOne({ firebaseId: firebaseToken.uid }).lean();

    if (config?.predicate && user && !config.predicate(user)) {
      throw json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }
  
    const result: { firebaseToken?: admin.auth.DecodedIdToken; user?: IUser } = {};
  
    if (config?.firebaseToken) {
      result.firebaseToken = firebaseToken;
    }
  
    if (!user) {
      throw json({ error: 'User doesn\'t have an account yet' }, { status: 404 });
    }

    if (config?.user) {
      result.user = user;
    }
  
    return result;
  };