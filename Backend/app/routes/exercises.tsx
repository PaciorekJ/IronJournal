import { json, useLoaderData } from "@remix-run/react";
import { Exercise, IExercise } from "~/models/Exercise";
export const loader = async () => {
	const exercises = await Exercise.find();

	return json(exercises);
};

export default function Exercises() {
	const actionData = useLoaderData<typeof loader>() as IExercise[];

	return (
		<div>
			<h1>Exercises</h1>
			{actionData.map((data) => (
				<div key={data.id}>
					<h2>Name: {data.name}</h2>
					<p>{`${data.category}, ${data.level}, ${data.force} ${data.mechanic}`}</p>
					<h3>
						Primary Muscles:{" "}
						{data.primaryMuscles
							.map((muscle: string) => muscle.toUpperCase())
							.join(", ")}{" "}
						(Secondaries:{" "}
						{data.secondaryMuscles
							.map((muscle: string) => muscle.toUpperCase())
							.join(", ")}
						)
					</h3>
					<h3>Require Equipment {data.equipment}</h3>
					<h3>How to perform the exercises</h3>
					<ol>
						{data.instructions.map((instruction: string, i: number) => (
							<li key={i}>{instruction}</li>
						))}
					</ol>
					<div>
						<h3>Images</h3>
						{data.images.map((image: string, i: number) => {
							return <img key={i} src={image} alt={data.name} />;
						})}
					</div>
				</div>
			))}
		</div>
	);
}
