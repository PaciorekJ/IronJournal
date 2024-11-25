import { Exercise } from "@paciorekj/iron-journal-shared";
import { json } from "@remix-run/node";
import exercises from "~/exercises.json";

export const loader = async () => {
    await Exercise.deleteMany({});

    await Exercise.create(exercises);

    return json({
        message: "Database seeded successfully",
    });
};
