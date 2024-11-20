import { Exercise } from "@paciorekj/iron-journal-shared";
import { json } from "@remix-run/node";
import exercises from "~/exercises.json";

export const loader = async () => {
    await Exercise.deleteMany({});
    const unique = [
        ...new Map(
            exercises.map((item) => [
                item.id,
                {
                    ...item,
                    primaryMuscles: item.primaryMuscles
                        ? item.primaryMuscles.map((muscle) => {
                              if (muscle === "chest") return "pectorals";
                              if (muscle === "traps") return "trapezius";
                              return muscle;
                          })
                        : item.primaryMuscles,
                    secondaryMuscles: item.secondaryMuscles
                        ? item.secondaryMuscles.map((muscle) => {
                              if (muscle === "chest") return "pectorals";
                              if (muscle === "traps") return "trapezius";
                              return muscle;
                          })
                        : item.secondaryMuscles,
                },
            ]),
        ).values(),
    ];

    await Exercise.create(unique);
    return json({
        message: "Database seeded successfully",
    });
};
