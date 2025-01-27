# TODO

## Important Steps

- Use date-fns to localize times returned based on the user's preference for timezone (Probably during app development)
- Handle conversion of times returned in mobile app, convert seconds to nice times, hours, minutes, seconds
- Add Conversions upon return for weights, volumes, and distance for set templates, and set data!
- Consider making Sets independent from workouts, as sets could be reusable by user's
- Add regression model with neo4j, To predict the optimal weight for exercises, a common algorithm approach would be to use a regression model based on historical training data, incorporating factors like previous weight lifted, sets and reps performed, rest periods, muscle group targeted, and overall fitness level
- ML algorithm for, A prediction algorithm for adjusting a workout program would typically use machine learning techniques to analyze data like past workout performance, heart rate, sleep patterns, nutrition, and other relevant metrics to predict when and how to adjust training variables like intensity, volume, exercise selection, or rest days

## LOW PRIORITY

- Each User have one active program.
- Make so assisted sets are accounted for, using assisted equipment for example
- Add Accessory-Equipment to both the Iset, ISetDataEntry, and IOneRepMaxData

## Planning (For Additional Sets)

- Users have essentially 2 choices, Pick a Set Variation or add Rest time
- Rest Time's easy to Add
- If a Sets added A sheet is created where sets can be added for a specific exercise or whatever the variation calls for.

## Planning Server

- User's should have specific goals
- MyFitnessPal integration, to obtains additional data for neo4j
- Ensure that all references to delete documents are removed, find an efficient approach for this

- create Endpoint that Creates IOneRepMaxData, (MAX 1 per exercise per user)
  - Create Database Model for IOneRepMaxData
  - GET     (oneRepMaxData/?exerciseId=value)   gets all IoneRepMaxData or get a IOneRepMaxData by exerciseId for a specific user
  - POST    (oneRepMaxData/)                    route that will updateOne with upsert search by exerciseID, userID and update weight
  - DELETE  (oneRepMaxData/:oneRepMaxDataId)    delete a IoneRepMaxData by ID

```typescript
    interface IOneRepMaxData {
        userId: IUser["_id"];
        exercise: IExercise["_id"];
        weight: number; // Non-negative, normalized to KG
        updatedAt: Date; // Date the one-rep max was last updated
    }
```

- Endpoints for IDailyData (MAX 1 per day)
  - Create the IDailyData Model.
  - GET     (dailyData/?startDate=someDate&endDate)  request route that will retrieve it by date.
  - DELETE  (dailyData/:dailyDataId)                 delete the specified dailyData by _id.
  - POST    (dailyData/)                             dailyData will use updateOne with upsert based on createdAt which will always be the start of the day for the user, and the userId, the rest will update or create the document.

```typescript
    // ***Daily Tracking ***

    interface IDailyData {
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

    interface IBodyMeasurement { // Users can measure what they wish
        neck?: Number;
        bicepLeft?: Number;
        bicepRight?: Number;
        forearmLeft?: Number;
        forearmRight?: Number;
        chest?: Number;
        stomach?: Number;
        waist?: Number;
        tightLeft?: Number;
        tightRight?: Number;
        calfLeft?: Number;
        calfRight?: Number;
    }
```

### **Current Place in Process**

- Add IWorkoutData features
  - Create the ISetData Model, making ISetDataEntry a embedded entry
  - Create the IWorkoutData Model
  - DELETE  (workoutData/:workoutId) Delete a workoutData by ID
  - POST    (workoutData/)           Create a POST route that essentially starts the workoutData, with all empty arrays, and userID is used based on who login to the server
  - GET     (workoutData/)           Create GET all workoutData, for a specific user, that is login in on the server. Filter by date, Include Populate Flag for ISetData & workout
  - DELETE  (setData/:setId):        Delete a setData and delete it from the workoutData
  - POST    (setData/:workoutId)     Create a route for creating ISetData
  - PATCH   (setData/:workoutId)     Update a ISetdata inside of the specified IWorkoutData

- Add RPE to user sets so they can state how they felt they performed

```typescript

    // ***Workout Tracking***

    interface ISetDataEntry { // All Data inside this is the actual!
        reps: number;
        weight: number; // Non-negative, normalized to KG
        rpe?: number; // 1-10, 10 being Max Effort, 1 being very light activity while 0 means Effortless, optional metric to log
        restDurationInSeconds?: number;
        distanceInCentimeters?: number;
        durationInSeconds?: number;
    }

    interface ISetData {
        userId: IUser["_id"];
        type: SetTypeKey;
        tempo?: {
            eccentric: number;
            bottomPause: number;
            concentric: number;
            topPause: number;
        };
        weight: number; // Non-negative, normalized to KG, for restPause
        initialWeightSelection: number; // Non-negative, normalized to KG, for dropSets
        exercise: IExercise["_id"];
        setData: ISetDataEntry[];
    }

    interface IWorkoutData {
        userId: IUser["_id"];
        workout: IWorkout["_id"]; // If some deletes a IWorkout then, this should be updated to original workout not found. For example NULL.
        sets: ISetData["_id"][];
        createdAt: Date;
    }


```

## NOTES
