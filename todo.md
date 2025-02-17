# TODO

## Primary Initiative

1. Set up a Redis instance in Docker
   - Create a **Redis container** using Docker.
   - Ensure it is **accessible from the backend**.

2. Create a `ProfanityFilterService`
   - Accepts **field value** and **key** as input.
   - Checks Redis for cached profanity-filtered results.
   - If cache is missing:
     - Apply **profanity filtering** in both the **original language** and the **user’s native language**.
     - Store the censored result in Redis.

3. Implement Redis caching for profanity-filtered results
   - Store results in Redis using the following key format:

     ```plaintext
     workoutdata/{workoutId}
     programdata/{programId}
     ```

   - Implement **cache invalidation** when a workout/program is updated:

     ```typescript
     await redisClient.del(`workoutdata/${workoutId}`);
     await redisClient.del(`programdata/${programId}`);
     ```

   - Set a **TTL (Time-To-Live)** on cached entries for automatic expiration.

4. Ensure profanity filtering applies to multiple content types
   - Implement filtering for:
     - **Workout names & descriptions**
     - **Program names & descriptions**
     - **Future user-provided fields (scalable design)**

5. Implement profanity filtering on data fetching
   - When retrieving workout/program data:
     - **Check Redis** for cached profanity-filtered results.
     - If **cache hit**, return the cached version.
     - If **cache miss**:
       - Run the **profanity filter for all languages**.
       - Save the censored result to Redis.
       - Return the censored version.

6. Ensure the `ProfanityFilterService` is reusable across different fields
   - Accepts **only the field value & cache key**.
   - Makes **separate calls** for:
     - **Original language filtering**
     - **User’s native language filtering**
   - Stores **only the censored version** in Redis to **avoid duplicate processing**.

7. Implement cache clearing when:
   - A **workout or program is updated**.
   - **Filtering rules change**, requiring old results to be reprocessed.

8. Expand profanity filtering to additional user-provided fields
   - Maintain scalability by ensuring the `ProfanityFilterService` is generic.

9. Optimize caching for better performance
   - Implement **batch deletion** when multiple entries need invalidation.
   - Set **TTL** for automatically clearing old cached data.

10. Consider an admin review system for flagged content
    - Allow admins to **review and override** filtered content when necessary.

## Important Steps

- useLocalizeDate function upon get/retrieving model data that contains dates
- Make Sets independent from workouts, as sets could be reusable by user's
- Move constants out of package and require client to request them to interface with the server (Decrease bundle size)
- Add localization to workoutData specifically the status field.
- Add denormalizing for all data metrics to users preferred metric system.

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
