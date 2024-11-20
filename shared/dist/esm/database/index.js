import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error("Missing environment variable: MONGODB_URI");
}
class Database {
    static uri = process.env.MONGODB_URI;
    static connection = null;
    static async connect() {
        if (!this.uri) {
            console.error("Database connection MONGODB_URI is not defined in the environment variables.");
            throw new Error("Database connection MONGODB_URI is missing.");
        }
        if (this.connection) {
            console.log("Using existing database connection");
            return this.connection;
        }
        try {
            await mongoose.connect(this.uri, {
                dbName: "iron-journal",
            });
            this.connection = mongoose.connection;
            console.log("Successfully connected to MongoDB");
            return this.connection;
        }
        catch (error) {
            console.error("Error connecting to MongoDB with Mongoose:", error);
            throw new Error(`Database connection failed: ${error}`);
        }
    }
    static async disconnect() {
        if (!this.connection) {
            console.log("No existing connection to disconnect");
            return;
        }
        try {
            await mongoose.disconnect();
            this.connection = null;
            console.log("Disconnected from MongoDB");
        }
        catch (error) {
            console.error("Error disconnecting from MongoDB:", error);
            throw new Error(`Failed to disconnect from the database: ${error}`);
        }
    }
}

export { Database as default };
//# sourceMappingURL=index.js.map
