
import { json } from "@remix-run/node";
import admin from "firebase-admin";
import { RoleTypeValue } from "~/constants/role";
import { User } from "~/models/user";

import serviceAccount from "~/serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

/**
 * Verify the Firebase ID token in the Authorization header of the given request.
 *
 * If the token is invalid or missing, throw a 401 response with an appropriate error message.
 *
 * @param request The request object containing the Authorization header.
 * @throws {Response} A 401 response with an error message if the token is invalid or missing.
 * @returns The decoded Firebase ID token.
 */
export async function requireAuth(request: Request) {
    const authHeader = request.headers.get("Authorization");
  
    if (!authHeader) {
      throw json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const idToken = authHeader.split("Bearer ")[1];
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw json({ error: "Invalid token" }, { status: 401 });
    }
}

  /**
   * Verifies that the user is authenticated and has the required role
   * 
   * @param request The request object
   * @param requiredRole The role that the user must have
   * @returns The user document if the user is authenticated and has the required role
   * @throws {Response} A 401 response if the user is not authenticated
   * @throws {Response} A 403 response if the user does not have the required role
   * @throws {Response} A 404 response if the user document is not found
   */
export const requireRole = async (request: Request, requiredRole: RoleTypeValue) => {
    const { uid: firebaseId } = await requireAuth(request);
    const user = await User.findOne({ firebaseId }).lean(); 
  
    if (!user) {
      throw json({ error: "User not found" }, { status: 404 });
    }
  
    if (user.role !== requiredRole) {
      throw json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
  
    return user;
  };