# TODO

## Primary Initiative

- Set **TTL** for automatically clearing old cached data.

## Important Steps

- useLocalizeDate function upon get/retrieving model data that contains dates
- Add original text & user's native text to returns for all localized fields. Specific handled in shared/localizations/*
- Make Sets independent from workouts, as sets could be reusable by user's
- Move constants out of package and require client to request them to interface with the server (Decrease bundle size)
- Add localization to workoutData specifically the status field.
- Add denormalizing for all data metrics to users preferred metric system.
- Add an admin review system for flagged content, so user can report content for programs & workouts
- Allow user's to specify the censorship they'd like to see

## LOW PRIORITY

- Make so assisted sets are accounted for, using assisted equipment for example
- Add Accessory-Equipment to both the Iset, ISetDataEntry, and IOneRepMaxData

## Planning Server

- Ensure that all references to delete documents are removed, find an efficient approach for this

## NOTES

### Gamification inside of application

- Have Weekly/monthly goals that user's can commit themselves
- Leveling system?

### ML inside of APP

- User's can optional have a specific goal. (DOable)
- MyFitnessPal integration, to obtains additional data for neo4j
- Add regression model with neo4j, To predict the optimal weight for exercises, a common algorithm approach would be to use a regression model based on historical training data, incorporating factors like previous weight lifted, sets and reps performed, rest periods, muscle group targeted, and overall fitness level
- ML algorithm for, A prediction algorithm for adjusting a workout program would typically use machine learning techniques to analyze data like past workout performance, heart rate, sleep patterns, nutrition, and other relevant metrics to predict when and how to adjust training variables like intensity, volume, exercise selection, or rest days
