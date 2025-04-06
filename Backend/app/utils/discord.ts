import { IUser, Program, User, Workout } from "@paciorekj/iron-journal-shared";
import { IFeedbackCreateDTO } from "~/validation/feedback";
import { IReportCreateDTO } from "~/validation/report";

const DISCORD_WEBHOOK_URL_REPORTER = process.env.DISCORD_WEBHOOK_URL_REPORTER!;
const DISCORD_WEBHOOK_URL_FEEDBACK = process.env.DISCORD_WEBHOOK_URL_FEEDBACK!;
const DISCORD_WEBHOOK_URL_ERROR = process.env.DISCORD_WEBHOOK_URL_ERROR!;

export async function postReportToDiscord(
    user: IUser,
    reportedData: IReportCreateDTO,
) {
    const userId = user._id;

    let previewTitle = "";
    let previewDescription = "";

    switch (reportedData.type) {
        case "Program":
            const program = await Program.findById(reportedData.reported)
                .select("name description userId")
                .populate("userId", "username")
                .lean();
            previewTitle = `Program: ${program?.name[program.originalLanguage] ?? "—"}`;
            previewDescription =
                program?.description?.[program.originalLanguage] ||
                "No description.";
            break;
        case "Workout":
            const workout = await Workout.findById(reportedData.reported)
                .select("name description userId")
                .populate("userId", "username")
                .lean();
            previewTitle = `Workout: ${workout?.name[workout.originalLanguage] ?? "—"}`;
            previewDescription =
                workout?.description?.[workout.originalLanguage].slice(
                    0,
                    200,
                ) ?? "No description.";
            break;
        case "User":
            const reportedUser = await User.findById(reportedData.reported)
                .select("username")
                .lean();
            previewTitle = `User: ${reportedUser?.username ?? "—"}`;
            previewDescription = "User profile report.";
            break;
    }

    const embed = {
        title: `🛑 New Report (${reportedData.type})`,
        color: 0xe74c3c,
        fields: [
            {
                name: "Reporter",
                value: user?.username ?? userId.toString(),
            },
            { name: "Type", value: reportedData.type, inline: true },
            {
                name: "ID",
                value: reportedData.reported.toString(),
                inline: true,
            },
            { name: "Reason", value: reportedData.reason },
            { name: "Details", value: reportedData.details ?? "—" },
            {
                name: "Preview",
                value: `**${previewTitle}**\n${previewDescription}`,
            },
        ],
        timestamp: new Date().toISOString(),
    };

    const res = await fetch(DISCORD_WEBHOOK_URL_REPORTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: "🚨 Content Report",
            embeds: [embed],
        }),
    });

    if (!res.ok) {
        throw new Response(`Discord webhook error ${await res.text()}`, {
            status: 500,
        });
    }
}

function getRatingColor(rating?: number): number {
    if (!rating) return 0x95a5a6; // gray if no rating
    if (rating === 1) return 0xf87171; // red-400
    if (rating === 2) return 0xfacc15; // yellow-400
    if (rating === 3 || rating === 4) return 0x60a5fa; // blue-400
    if (rating === 5) return 0x4ade80; // green-400
    return 0x95a5a6;
}

function renderStars(rating?: number) {
    if (!rating) return "N/A";
    const fullStar = "⭐";
    const emptyStar = "☆";
    const stars = fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
    return stars;
}

export async function postFeedbackToDiscord(
    user: IUser,
    feedbackData: IFeedbackCreateDTO,
) {
    const userId = user._id;

    const embed = {
        title: `💬 New Feedback from ${user?.username ?? userId.toString()}`,
        color: getRatingColor(feedbackData.rating),
        fields: [
            { name: "Subject", value: feedbackData.subject, inline: false },
            {
                name: "Rating",
                value: renderStars(feedbackData.rating),
                inline: true,
            },
            {
                name: "Message",
                value: feedbackData.message,
                inline: false,
            },
            {
                name: "User ID",
                value: userId.toString(),
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: "Iron Journal Feedback",
        },
    };

    const res = await fetch(DISCORD_WEBHOOK_URL_FEEDBACK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: "📝 User Feedback",
            embeds: [embed],
        }),
    });

    if (!res.ok) {
        console.error("Discord webhook error", await res.text());
        throw new Response(`Discord webhook error ${await res.text()}`, {
            status: 500,
        });
    }
}

export function postErrorToDiscord(
    errorOrResponse: Error | Response,
    context: { location?: string; extra?: Record<string, any> } = {},
): void {
    const isError = errorOrResponse instanceof Error;
    const title = isError ? "❗️ Exception Thrown" : "🚨 5xx Response Detected";

    const description = isError
        ? errorOrResponse.message
        : `Status ${errorOrResponse.status}: ${errorOrResponse.statusText || ""}`;

    const fields: Array<{ name: string; value: string; inline?: boolean }> = [];

    if (context.location) {
        fields.push({
            name: "Location",
            value: context.location,
            inline: true,
        });
    }

    if (!isError) {
        if (errorOrResponse.url) {
            fields.push({
                name: "URL",
                value: errorOrResponse.url,
                inline: true,
            });
        }
        fields.push({
            name: "Status",
            value: String(errorOrResponse.status),
            inline: true,
        });
    }

    if (isError) {
        fields.push({
            name: "Stack",
            value:
                "```" +
                (errorOrResponse.stack || "no stack trace available").slice(
                    0,
                    1000,
                ) +
                "```",
        });
    }

    if (context.extra) {
        fields.push({
            name: "Metadata",
            value:
                "```json\n" +
                JSON.stringify(context.extra, null, 2).slice(0, 1000) +
                "\n```",
        });
    }

    const embed = {
        title,
        description,
        color: 0x991b1b, // Tailwind red-700
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: "Iron Journal Error Logger" },
    };

    // Fire-and-forget
    fetch(DISCORD_WEBHOOK_URL_ERROR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: "⚠️ Error Logger",
            embeds: [embed],
        }),
    })
        .then((res) => {
            if (!res.ok) {
                return res
                    .text()
                    .then((txt) =>
                        console.error("Failed to post error to Discord:", txt),
                    );
            }
        })
        .catch((err) => {
            console.error("Error while sending error to Discord:", err);
        });
}
