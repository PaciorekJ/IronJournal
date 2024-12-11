import mongoose, { Schema } from "mongoose";
import { SET_TYPE } from "../constants/set-type";
import { ISet, SET_VALIDATION_MAP, SetSchema } from "../validation/sets";

const mongooseSetSchema = new Schema<ISet>(
    {
        type: { type: String, enum: Object.values(SET_TYPE), required: true },
        restDurationInSeconds: { type: Schema.Types.Mixed },
        tempo: {
            eccentric: { type: Number, min: 0 },
            bottomPause: { type: Number, min: 0 },
            concentric: { type: Number, min: 0 },
            topPause: { type: Number, min: 0 },
        },
        sets: { type: Array, required: true },
    },
    { _id: false },
);

mongooseSetSchema.pre("validate", function (next) {
    try {
        // *** Apply Parent Schema ***
        SetSchema.parse(this);

        // *** Apply Child Schema (The Specific Set Schema) ***
        const schema = SET_VALIDATION_MAP[this.type];
        const parsed = schema.parse(this);
        Object.assign(this, parsed);
        next();
    } catch (error) {
        next(new mongoose.Error.ValidationError(error));
    }
});

export const SetModel = mongoose.model("Set", mongooseSetSchema);
export default mongooseSetSchema;
