import mongoose, { Connection } from "mongoose";

class Database {
    private static uri: string = process.env.MONGODB_URI!;
    private static connection: Connection | null = null;

    public static async connect(): Promise<Connection> {
        if (!this.uri) {
            console.error(
                "Database connection MONGODB_URI is not defined in the environment variables.",
            );
            throw new Error("Database connection MONGODB_URI is missing.");
        }

        if (this.connection) {
            console.log("Using existing database connection");
            return this.connection;
        }

        try {
            await mongoose.connect(this.uri);

            this.connection = mongoose.connection;
            console.log("Successfully connected to MongoDB");

            return this.connection;
        } catch (error) {
            console.error("Error connecting to MongoDB with Mongoose:", error);
            throw new Error(`Database connection failed: ${error}`);
        }
    }

    public static async disconnect(): Promise<void> {
        if (!this.connection) {
            console.log("No existing connection to disconnect");
            return;
        }

        try {
            await mongoose.disconnect();
            this.connection = null;
            console.log("Disconnected from MongoDB");
        } catch (error) {
            console.error("Error disconnecting from MongoDB:", error);
            throw new Error(`Failed to disconnect from the database: ${error}`);
        }
    }
}

export default Database;
