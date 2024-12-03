import { Exercise } from "@paciorekj/iron-journal-shared";
import exercises from "~/exercises.json";

export const loader = async () => {
    await Exercise.deleteMany({});

    await Exercise.create(exercises);

    return {
        message: "Database seeded successfully",
    };
};
