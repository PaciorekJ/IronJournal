import type { ActionFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { censorText } from "~/utils/profanityFilter.server";

// Define the type of data returned from the action
type ActionData = {
    text: string;
    censoredText: string;
};

// Use Remix’s ActionFunction type for the action export
export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    // Ensure we safely extract the text value
    const text = formData.get("text")?.toString() || "";

    const censoredText = await censorText(text, text);

    return { text, censoredText };
};

export default function Test() {
    const data = useActionData<ActionData>();

    return (
        <div>
            <h1>Test</h1>
            <Form method="post">
                <input type="text" name="text" placeholder="text" />
                <button type="submit">Submit</button>
            </Form>
            <div>
                <h2>Result</h2>
                <p>{data?.text}</p>
                <p>{data?.censoredText}</p>
            </div>
        </div>
    );
}
