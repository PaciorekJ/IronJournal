# TODO

## Important Steps

- Add Models for tracking workouts of the users
- Add Mechanism for committing to programs, or think of an alternative approach

## Back Burner


## Sides

Spin up docker image for RabbitMQ: `docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
Spin up docker image for libreTranslate: `docker run -d --hostname libretranslate --name libretranslate -p 3000:3000 libretranslate/libretranslate:latest`

## Planning

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
        mentally?: Number;
        muscleSoreness?: Number;
        energyLevel?: Number;
    }
    waterIntakeInLiters: Number;
    bodyWeight?: Number;
    bodyFatPercentage?: Number;
    bodyMeasurements?: IBodyMeasurement;
    units?: WeightUnitKey;
}

IBodyMeasurement 

{
    units: DistanceUnitKey;
    neck: Number;
    bicepLeft: Number;
    bicepRight: Number;
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

IOneRepMax

{
    exercise: mongoose.Schema.Types.ObjectId;
    weight: Number;
    units: WeightUnitKey;
}

export const WEIGHT_UNITS = {
    "KILOGRAMS": "KILOGRAMS",
    "POUNDS": "POUNDS"
} as const
export type WeightUnitKey = keyof typeof WEIGHT_UNITS

export const DISTANCE_UNITS = {
    "INCHES": "INCHES",
    "CENTIMETER": "CENTIMETER"
} as const
export type DistanceUnitKey = keyof typeof DISTANCE_UNITS

```


## NOTES

* Ensure in app that user's can make a superset of a superset