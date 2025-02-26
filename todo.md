# TODO

## Primary Initiative

## Important Steps

- User's can optional have a specific goal. (DOable)
- (POTENTIAL FEATURE) Maybe I wil collect old exercise one rep max to track users progression on a particular lift from a one rep max perspective
- Make Sets independent from workouts, as sets could be reusable by user's

## LOW PRIORITY

- Add an admin review system for flagged content, so user can report content for programs & workouts

## Back Burner

- Make so assisted sets are accounted for, using assisted equipment for example
- Add Accessory-Equipment to both the Iset, ISetDataEntry, and IOneRepMaxData
- MyFitnessPal integration, to obtains additional data for neo4j

## NOTES

### Gamification inside of application

- Streak and Streak breaking mechanics, advertise a 1 day until streak breaks, but provide a 2-3 days buffer to restore streak.
- Provide many rewards and activities from the start and seasoned users have to work harder.
- Add a leveling system, users gain XP for doing tasks/challenges, achievements
- Create a Mechanism for users receiving Achievements (Probably a strategy pattern), and Completing challenges. Server Response should contain some achievement or challenge (Weekly/Monthly) field in response so client knows it happened for UI feedback

- Friends make users return!
- Users should be able to play with each other, asyncly -> Perhaps users can challenge other people to lifts and approve or reject, based on a video!

- Keep track of user reputation - know who's engaged and valuable users

### ML inside of APP

- Add regression model with neo4j, To predict the optimal weight for exercises, a common algorithm approach would be to use a regression model based on historical training data, incorporating factors like previous weight lifted, sets and reps performed, rest periods, muscle group targeted, and overall fitness level
- ML algorithm for, A prediction algorithm for adjusting a workout program would typically use machine learning techniques to analyze data like past workout performance, heart rate, sleep patterns, nutrition, and other relevant metrics to predict when and how to adjust training variables like intensity, volume, exercise selection, or rest days

### React Native Development

- Dates will be formatted on retrieval by the application.
- All dates should be sent using Date.toISOString(). Display stuff in users local timezone, then take the localDate and do localDate.toISOString()
