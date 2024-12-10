# TODO

## Important Steps

- Add Models for tracking workouts of the users
- Add Mechanism for committing to programs, or think of an alternative approach


## Planning

* All values will be normalized to the metric system. If a users preference measurementPreference is set to Imperial, then we convert the values to metric. (Functions already add)

```

ProgressPhoto Stored in local storage

IDailyData

{
    userId: IUser["_id"];
    subjectiveMood?: {
        mentally?: Number;
        muscleSoreness?: Number;
        energyLevel?: Number;
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