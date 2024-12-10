# TODO

## Important Steps

- Add Models for tracking workouts of the users
- Add Mechanism for committing to programs, or think of an alternative approach
- Add Accessory-Equipment to both the Iset and the incoming ISetData,

## Back Burner


## Sides

Spin up docker image for RabbitMQ: `docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
Spin up docker image for libreTranslate: `docker run -d --hostname libretranslate --name libretranslate -p 3000:3000 libretranslate/libretranslate:latest`

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

```
IWorkoutData

{
    userId: mongoose.Schema.Types.ObjectId;
    setsData: ISetData[]
}

ProgressPhoto Stored in local storage

IDailyData

{
    userId: mongoose.Schema.Types.ObjectId;
    subjectiveMood?: {
        mentalState?: number; // 1 (Very Poor) to 10 (Excellent)
        muscleSoreness?: number; // 1 (No Soreness) to 10 (Very Sore)
        energyLevel?: number; // 1 (Very Low) to 10 (Very High)
    }
    waterIntakeInLiters: Number;
    bodyWeight?: Number;
    bodyFatPercentage?: Number;
    bodyMeasurements?: IBodyMeasurement;
}

IBodyMeasurement 

{
    units: DistanceUnitKey;
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
    reps?: Number;
    units?: WeightUnitKey;
    isAssisted?: boolean;
    durationInSeconds?: Number; // For Time based sets like isometric sets, but also for duration/distance based sets later on
    weight?: Number;
}

ISetData {
    type: SetTypeKey;
    exercise: mongoose.Schema.Types.ObjectId;
    tempo?: ITempo; // Tempo used for set
    setData: ISetDataEntry[];
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

{
    exercise: mongoose.Schema.Types.ObjectId;
    weight: Number;
    units: WeightUnitKey;
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