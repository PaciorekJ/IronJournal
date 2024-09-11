import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import { RootFilterQuery } from "mongoose";
import { Exercise, IExercise } from "~/models/Exercise";
import { buildQueryFromRequest, IBuildQueryConfig } from "~/utils/util.server";

const queryConfig: IBuildQueryConfig = {
	id: {},
	name: {
		regex: (value: string) => new RegExp(value, "i"),
	},
	level: { isArray: false, constructor: String },
	category: { isArray: false, constructor: String },
	force: {
		isArray: false,
		constructor: String,
		regex: (value: string) => new RegExp(value, "i"),
	},
	equipment: { isArray: true, constructor: String },
	primaryMuscles: { isArray: true, constructor: String },
	secondaryMuscles: { isArray: true, constructor: String },
	limit: { isArray: false, constructor: Number },
	offset: { isArray: false, constructor: Number },
	sortBy: { isArray: false, constructor: String },
	sortOrder: { isArray: false, constructor: String },
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { query, limit, offset, sortBy, sortOrder } =
		buildQueryFromRequest<IExercise>(request, queryConfig);

	const sortOption: Record<string, 1 | -1> | undefined = sortBy
		? { [sortBy]: sortOrder as 1 | -1 }
		: undefined;

	const exercises = await Exercise.find(query as RootFilterQuery<IExercise>)
		.sort(sortOption)
		.skip(offset)
		.limit(limit)
		.lean()
		.exec();

	return json(exercises);
};

export default function Exercises() {
	const actionData = useLoaderData<typeof loader>() as IExercise[];

	return (
		<div>
			<h1>Exercises</h1>
			<Form method="post" action="/program">
				<button type="submit">Go</button>
			</Form>
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
