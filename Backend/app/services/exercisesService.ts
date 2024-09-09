// eslint-disable-next-line import/no-unresolved
import IExercise from "~/Interfaces/Exercise";
import exercises from "../data/exercises.json";

// Define the configuration interface for the get function
interface IGetConfig {
    id?: string; // Filter by exercise ID
    name?: string; // Filter by exercise name
    level?: "beginner" | "intermediate" | "advanced"; // Filter by difficulty level
    category?: "strength" | "cardio" | "mobility" | "stretching"; // Filter by category
    force?: "push" | "pull" | "static"; // Filter by force type
    equipment?: string; // Filter by equipment
    primaryMuscles?: string[]; // Filter by primary muscles
    secondaryMuscles?: string[]; // Filter by secondary muscles
    sortBy?: keyof IExercise; // Sort by a specific field
    sortOrder?: "asc" | "desc"; // Sort order: ascending or descending
    limit?: number; // Limit the number of returned exercises
    offset?: number; // Offset to skip the first 'n' results
    fields?: (keyof IExercise)[]; // Specify which fields to include in the result
  }
  
  class ExercisesService {
    static EXERCISES_DATASET = exercises as IExercise[];
  
    static get(config: IGetConfig = {}): Partial<IExercise>[] {
      let results: IExercise[] = ExercisesService.EXERCISES_DATASET;
  
      // Filter exercises based on the config using Regex
      if (config.id) {
        results = results.filter((exercise) => new RegExp(config.id!, "i").test(exercise.id));
      }
      if (config.name) {
        results = results.filter((exercise) => new RegExp(config.name!, "i").test(exercise.name));
      }
      if (config.level) {
        results = results.filter((exercise) => exercise.level === config.level);
      }
      if (config.category) {
        results = results.filter((exercise) => exercise.category === config.category);
      }
      if (config.force) {
        results = results.filter((exercise) => exercise.force === config.force);
      }
      if (config.equipment) {
        results = results.filter((exercise) => new RegExp(config.equipment!, "i").test(exercise.equipment!));
      }
      if (config.primaryMuscles) {
        results = results.filter((exercise) =>
          config.primaryMuscles!.every((muscle) => 
            exercise.primaryMuscles.some((eMuscle) => new RegExp(muscle, "i").test(eMuscle))
          )
        );
      }
      if (config.secondaryMuscles) {
        results = results.filter((exercise) =>
          config.secondaryMuscles!.every((muscle) =>
            exercise.secondaryMuscles.some((eMuscle) => new RegExp(muscle, "i").test(eMuscle))
          )
        );
      }
  
      // Sort results based on the config
      if (config.sortBy) {
        results = results.sort((a, b) => {
          const aValue = a[config.sortBy!] as string | number;
          const bValue = b[config.sortBy!] as string | number;
  
          if (aValue < bValue) return config.sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return config.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }
  
      // Apply offset if provided
      if (config.offset) {
        results = results.slice(config.offset);
      }
  
      // Limit the number of results based on the config
      if (config.limit) {
        results = results.slice(0, config.limit);
      }
  
      // Select only the specified fields based on the config
      if (config.fields) {
        return results.map((exercise) =>
          config.fields!.reduce((acc: Partial<IExercise>, field: keyof IExercise) => {
            const value = exercise[field];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            acc[field] = value as IExercise[typeof field];
            return acc;
          }, {} as Partial<IExercise>)
        );
      }
  
      return results;
    }
  }
  
  export default ExercisesService;
  