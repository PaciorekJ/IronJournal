import { Form, useActionData } from "@remix-run/react";
import { censorText } from "~/utils/profanityFilter.server";

export async function action({ request }: any) {
    const formData = await request.formData();
    const text = formData.get("text").toString();

    const censoredText = await censorText(text, "test");

    return { text, censoredText };
}

export default function Test() {
    const data = useActionData<typeof action>();
    return (
        <div>
            <h1>Test</h1>
            <Form method="post">
                <input type="text" name="text" placeholder="text" />
                <button>Submit</button>
            </Form>
            <div>
                <h2>Result</h2>
                <p>{data?.text}</p>
                <p>{data?.censoredText}</p>
            </div>
        </div>
    );
}
