# TODO

## Important Steps

- Add Models for tracking workouts of the users
- Add Mechanism for committing to programs, or think of an alternative approach
- Add Accessory-Equipment to both the Iset and the incoming ISetData,


## Planning (For Additional Sets)

- Make so sets can have rest periods specified in a workout plan.

interface IDurationSetEntry {
  durationInSeconds: NumberOrRange;
  intensityLevel?: IntensityLevelKey;
  weightSelection?: IWeightSelection;
}

interface IDurationSet {
  exercise: IExercise["_id"];
  sets: IDurationSetEntry[];
}

## Planning (For Data)

* All values will be normalized to the metric system. If a users preference measurementPreference is set to Imperial, then we convert the values to metric. (Functions already add)

```

ProgressPhoto Stored in local storage

IDailyData

{
    userId: IUser["_id"];
    subjectiveMood?: {
        mentalState?: number; // 1 (Very Poor) to 10 (Excellent)
        muscleSoreness?: number; // 1 (No Soreness) to 10 (Very Sore)
        energyLevel?: number; // 1 (Very Low) to 10 (Very High)
    }
    waterIntakeInLiters?: Number;
    bodyWeight?: Number;
    bodyFatPercentage?: Number;
    bodyMeasurements?: IBodyMeasurement;
    createdAt: Date; // This should be force to be the beginning of the day according to the user's time zone, unless there's a better way of doing this like just setting it to a Date without time as it's a dailyData entry then we simply grab the one at the beginning of the day if it exists and update it
}

Should rest periods be a set or should they be attached an exercise?

IBodyMeasurement 

{
    neck: Number;
    bicepLeft: Number;
    bicepRight: Number;
    forearmLeft: Number;
    forearmRight: Number;
    chest: Number;
    stomach: Number;
    waist: Number;
    tightLeft: Number;
    tightRight: Number;
    calfLeft: Number;
    calfRight: Number;
}

ISetDataEntry

{
    userId: IUser["_id"]
    reps?: Number;
    units?: WeightUnitKey;
    isAssisted?: boolean;
    durationInSeconds?: Number; // For Time based sets like isometric sets, but also for duration/distance based sets later on
    weight?: Number;
}, indexed by userID

ISetData {
    userId: IUser["_id"]
    type: SetTypeKey;
    exercise: mongoose.Schema.Types.ObjectId;
    tempo?: ITempo; // Tempo used for set
    setData: ISetDataEntry["_id"][];
}

const SetDataSchema = new Schema({
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
    set: { type: mongoose.Schema.Types.ObjectId, ref: 'Set', required: true },
    type: { type: String, enum: Object.values(SET_TYPE), required: true },
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    tempo: { type: TempoSchema },
    completedAt: { type: Date, default: Date.now },
});

const SetDataSchema = new Schema({
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
    set: { type: mongoose.Schema.Types.ObjectId, ref: 'Set', required: true },
    type: { type: String, enum: Object.values(SET_TYPE), required: true },
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    tempo: { type: TempoSchema },
    completedAt: { type: Date, default: Date.now },
});

IOneRepMax
IWorkoutData {
    setsData: ISetData["_id"][]
    workout?: IWorkoutSnapShot; // embed workout here?
    program?: IProgram["_id"]   // This will only be used for reviewing a program, if the program is deleted then this should be deleted as well
}

IOneRepMax, Maybe make this a set so that people can put a OneRepMax attempt into there workouts or just leave it like this so after they do it they can write it down

{
    exercise: mongoose.Schema.Types.ObjectId;
    weight: Number;
}

```


## NOTES

* Ensure in app that user's can make a superset of a superset
* Use date-fns to localize times returned based on the user's preference for timezone

```
import { format, utcToZonedTime } from 'date-fns-tz';

const date = new Date();
const timeZone = 'America/New_York';
const zonedDate = utcToZonedTime(date, timeZone);
const formattedDate = format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });
console.log(formattedDate); // Time in New York
```