import mongoose, { Schema } from "mongoose";

export interface IUserXpLog {
    userId: string;
    action: string;
    xpAwarded: number;
    timestamp: Date;
}

const UserXpLogSchema = new Schema<IUserXpLog>({
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    xpAwarded: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

const UserXpLog = mongoose.model("UserXpLog", UserXpLogSchema);

export default UserXpLog;
