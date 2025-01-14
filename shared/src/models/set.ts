import mongoose, { Schema } from "mongoose";
import { SET_TYPE } from "../constants/set-type";
import { WEIGHT_SELECTION_METHOD } from "../constants/weight-selection";
import { ISet, SET_VALIDATION_MAP, SetSchema } from "../validation/sets";

const mongooseSetSchema = new Schema<ISet>(
    {
        type: { type: String, enum: Object.values(SET_TYPE), required: true },
        restDurationInSeconds: { type: Number, min: 0 },
        initialWeightSelection: {
            method: {
                type: String,
                enum: Object.values(WEIGHT_SELECTION_METHOD),
                required: true,
            },
            value: { type: Number, min: 0 },
        },
        tempo: {
            eccentric: { type: Number, min: 0 },
            bottomPause: { type: Number, min: 0 },
            concentric: { type: Number, min: 0 },
            topPause: { type: Number, min: 0 },
        },
        sets: { type: [Schema], required: true },
    },
    { _id: false },
);

mongooseSetSchema.pre("validate", function (this, next) {
    try {
        // *** Apply Parent Schema ***
        SetSchema.parse(this);

        const type = this.type as string;

        // *** Apply Child Schema (The Specific Set Schema) ***
        const schema = SET_VALIDATION_MAP[type];
        const parsed = schema.parse(this);
        Object.assign(this, parsed);
        next();
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return next(error);
        }
        if (error instanceof Error) {
            return next(error);
        }
        next(
            new Error(
                "An Unexpected Error Occurred In the Mongoose Set Schema",
            ),
        );
    }
});

export const SetModel = mongoose.model("Set", mongooseSetSchema);
export default mongooseSetSchema;
