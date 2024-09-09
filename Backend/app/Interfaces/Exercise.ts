
interface IExercise {
    id: string;
    name: string;
    force: "push" | "pull" | "static" | null;
    level: "beginner" | "intermediate" | "advanced" | null;
    mechanic: "compound" | "isolation" | null;
    equipment: string | null;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    instructions: string[];
    category: "strength" | "cardio" | "mobility" | "stretching" | null;
    images: string[];
  }
  
  export default IExercise;