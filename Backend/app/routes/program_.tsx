import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, json, useFetcher } from "@remix-run/react";
import mongoose from "mongoose";
import { Exercise } from "~/models/Exercise";
import {
	FocusAreas,
	IntensityLevel,
	Program,
	ScheduleType,
	TargetAudience,
} from "~/models/Program";
import { User } from "~/models/User";
import { WorkoutPrototype } from "~/models/WorkoutPrototype";
import {
	buildPopulateOptions,
	buildQueryFromRequest,
	IBuildQueryConfig,
} from "~/utils/util.server";

export const action: ActionFunction = async () => {
	const user = await User.findOne().lean();

	if (!user) {
		throw new Error("User not found");
	}

	const exercises = await Exercise.aggregate([{ $sample: { size: 3 } }]);

	const newWorkout = new WorkoutPrototype({
		name: "Random Workout",
		sets: [],
		userId: user._id,
		description: "A workout with random exercises for testing purposes.",
		createdAt: new Date(),
		notes: "This is a randomly generated workout for demonstration purposes.",
	});

	await newWorkout.save();

	const scheduleType: ScheduleType =
		Math.random() > 0.5 ? ScheduleType.FixedDays : ScheduleType.Cycle;

	const newProgram = new Program({
		name: "Random Program",
		description:
			"A program with random exercises and workouts for testing purposes.",
		workouts: exercises.map((exercise) => ({
			day:
				scheduleType === ScheduleType.FixedDays
					? [
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
							"Sunday",
					  ][Math.floor(Math.random() * 7)]
					: Math.floor(Math.random() * 7) + 1,
			workoutId: newWorkout._id,
			isRestDay: false,
			duration: Math.floor(Math.random() * 60) + 30,
			intensityLevel: IntensityLevel.Moderate,
		})),
		userId: user._id,
		duration: Math.floor(Math.random() * 12) + 4,
		notes: "This is a randomly generated program for demonstration purposes.",
		isPublic: Math.random() > 0.5,
		scheduleType,
		focusAreas: [FocusAreas.Strength, FocusAreas.Endurance],
		targetAudience: TargetAudience.Beginner,
		cardioRecommendations: {
			frequency: "3-5 days per week", // Example frequency
			intensity: IntensityLevel.Moderate, // Use the enum for intensity level
			duration: "30-45 minutes", // Example duration
			type: "Moderate Intensity Steady State (MISS)", // Example cardio type
		},
		progressionStrategy: "Increase weight by 5-10% weekly.", // Example progression strategy
	});

	await newProgram.save();

	return json({
		success: true,
		message: "Program and workout created successfully",
		programId: newProgram._id,
	});
};

// Configuration for building the query based on search parameters
const queryConfig: IBuildQueryConfig = {
	name: {
		isArray: false,
		constructor: String,
		regex: (value: string) => new RegExp(value, "i"),
	},
	userId: {
		isArray: false,
		constructor: mongoose.Types.ObjectId,
		regex: (value: string) => new RegExp(value, "i"),
	},
	scheduleType: {
		isArray: false,
		constructor: String,
		regex: (value: string) => new RegExp(value, "i"),
	},
	focusAreas: {
		isArray: true,
		constructor: String,
		regex: (value: string) => new RegExp(value, "i"),
	},
	targetAudience: {
		isArray: false,
		constructor: String,
		regex: (value: string) => new RegExp(value, "i"),
	},
	isPublic: {
		isArray: false,
		constructor: (value: string) => value === "true", // Convert to boolean
	},
};

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const searchParams = new URLSearchParams(url.search);

	const { query, limit, offset, sortBy, sortOrder } = buildQueryFromRequest(
		request,
		queryConfig,
	);

	const sortOption: Record<string, 1 | -1> | null = sortBy
		? { [sortBy]: sortOrder as 1 | -1 }
		: null;

	let queryObj = Program.find(query).sort(sortOption).skip(offset).limit(limit);

	const populateOptions = buildPopulateOptions(searchParams, "populate");
	populateOptions.forEach((option: string | string[]) => {
		queryObj = queryObj.populate(option);
	});

	const programs = await queryObj.lean();

	return json(programs);
};

export default function ProgramPage() {
	const fetcher = useFetcher();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const data = {
			name: "John Doe",
			age: 30,
		};

		fetcher.submit(JSON.stringify(data), { method: "post" });
	}

	return (
		<div>
			<Form method="post" onSubmit={handleSubmit}>
				<button type="submit">Submit JSON</button>
			</Form>
		</div>
	);
}
