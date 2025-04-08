// Discord bot with full support for /announce and /notifications command groups
// Includes dynamic route mapping, help messages, embedded responses, and ObjectId support

import {
    Client,
    GatewayIntentBits,
    GuildMember,
    GuildMemberRoleManager,
    REST,
    Routes,
} from "discord.js";
import "dotenv/config";

const {
    DISCORD_TOKEN,
    CLIENT_ID,
    GUILD_ID,
    API_BASE_URL,
    SERVER_AUTH_TOKEN,
    ADMIN_ROLE_ID,
} = process.env;

if (
    !DISCORD_TOKEN ||
    !CLIENT_ID ||
    !GUILD_ID ||
    !API_BASE_URL ||
    !SERVER_AUTH_TOKEN ||
    !ADMIN_ROLE_ID
) {
    throw new Error("Missing environment variables");
}

const commandRouteMap = {
    announce: "announcements",
    notifications: "notifications",
};

const commands = [
    {
        name: "announce",
        description: "Manage announcements",
        options: [
            {
                type: 1,
                name: "create",
                description: "Create an announcement",
                options: [
                    {
                        type: 3,
                        name: "title",
                        description: "Title",
                        required: true,
                    },
                    {
                        type: 3,
                        name: "description",
                        description: "Description",
                        required: true,
                    },
                ],
            },
            {
                type: 1,
                name: "update",
                description: "Update an announcement",
                options: [
                    {
                        type: 3,
                        name: "id",
                        description: "Announcement ID",
                        required: true,
                    },
                    {
                        type: 3,
                        name: "title",
                        description: "New title",
                        required: false,
                    },
                    {
                        type: 3,
                        name: "description",
                        description: "New description",
                        required: false,
                    },
                ],
            },
            {
                type: 1,
                name: "delete",
                description: "Delete an announcement",
                options: [
                    {
                        type: 3,
                        name: "id",
                        description: "Announcement ID",
                        required: true,
                    },
                ],
            },
            {
                type: 1,
                name: "list",
                description: "List announcements",
                options: [
                    {
                        type: 4,
                        name: "limit",
                        description: "Max items",
                        required: false,
                    },
                ],
            },
            {
                type: 1,
                name: "help",
                description: "Show usage for announcement commands",
            },
        ],
    },
    {
        name: "notifications",
        description: "Manage user notifications",
        options: [
            {
                type: 1,
                name: "create",
                description: "Send a notification to a user",
                options: [
                    {
                        type: 3,
                        name: "user_id",
                        description: "User ID",
                        required: true,
                    },
                    {
                        type: 3,
                        name: "title",
                        description: "Notification title",
                        required: true,
                    },
                    {
                        type: 3,
                        name: "message",
                        description: "Notification message",
                        required: true,
                    },
                ],
            },
            {
                type: 1,
                name: "update",
                description: "Update a notification",
                options: [
                    {
                        type: 3,
                        name: "id",
                        description: "Notification ID",
                        required: true,
                    },
                    {
                        type: 3,
                        name: "title",
                        description: "New title",
                        required: false,
                    },
                    {
                        type: 3,
                        name: "message",
                        description: "New message",
                        required: false,
                    },
                ],
            },
            {
                type: 1,
                name: "delete",
                description: "Delete a notification",
                options: [
                    {
                        type: 3,
                        name: "id",
                        description: "Notification ID",
                        required: true,
                    },
                ],
            },
            {
                type: 1,
                name: "help",
                description: "Show usage for notification commands",
            },
        ],
    },
];

interface IAnnouncementPayload {
    id?: string;
    limit?: number;
    title: string;
    description: string;
}

interface INotificationPayload {
    id?: string;
    user_id: string;
    title: string;
    message: string;
}

async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN!);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID!), {
        body: commands,
    });
    console.log("Slash commands registered");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const member = interaction.member;
    if (
        !member ||
        !(member instanceof GuildMember) ||
        !(member.roles instanceof GuildMemberRoleManager) ||
        !member.roles.cache.has(ADMIN_ROLE_ID!)
    ) {
        return interaction.reply({
            content: "🚫 Not allowed",
            ephemeral: true,
        });
    }

    const command = interaction.commandName as "announce" | "notifications";
    const sub = interaction.options.getSubcommand();
    const route = command in commandRouteMap ? commandRouteMap[command] : null;

    if (!route) {
        return interaction.reply({
            content: "❌ Unknown command route.",
            ephemeral: true,
        });
    }

    const payload = {} as any;
    const keys =
        command === "notifications"
            ? ["id", "user_id", "title", "message"]
            : ["id", "title", "description", "limit"];

    for (const key of keys) {
        const value =
            interaction.options.getString(key) ??
            interaction.options.getInteger(key);
        if (value !== null && value !== undefined) payload[key] = value;
    }

    if (sub === "help") {
        const embed =
            command === "announce"
                ? {
                      title: "📢 Announce Commands",
                      color: 0x00ae86,
                      fields: [
                          {
                              name: "/announce create",
                              value: "title (string), description (string)\nCreate a new announcement.",
                          },
                          {
                              name: "/announce update",
                              value: "id (string), [title], [description]\nUpdate an existing announcement by ID.",
                          },
                          {
                              name: "/announce delete",
                              value: "id (string)\nDelete an announcement by ID.",
                          },
                          {
                              name: "/announce list",
                              value: "[limit] (integer)\nList announcements.",
                          },
                          {
                              name: "/announce help",
                              value: "—\nShow this help message.",
                          },
                      ],
                  }
                : {
                      title: "🔔 Notification Commands",
                      color: 0xffcc00,
                      fields: [
                          {
                              name: "/notifications create",
                              value: "user_id (string), title (string), message (string)\nSend a notification to a user.",
                          },
                          {
                              name: "/notifications update",
                              value: "id (string), [title], [message]\nUpdate a notification by ID.",
                          },
                          {
                              name: "/notifications delete",
                              value: "id (string)\nDelete a notification by ID.",
                          },
                          {
                              name: "/notifications help",
                              value: "—\nShow this help message.",
                          },
                      ],
                  };

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let url = `${API_BASE_URL}/${route}`;
    let method;

    switch (sub) {
        case "create":
            method = "POST";
            break;
        case "update":
            method = "PUT";
            url += `/${payload.id}`;
            delete payload.id;
            break;
        case "delete":
            method = "DELETE";
            url += `/${payload.id}`;
            delete payload.id;
            break;
        case "list":
            method = "GET";
            url += `?${new URLSearchParams(payload)}`;
            break;
        default:
            return;
    }

    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SERVER_AUTH_TOKEN}`,
            },
            body: method === "GET" ? undefined : JSON.stringify(payload),
        });

        const body = await res.json();

        if (res.ok) {
            if (command === "announce" && sub === "list") {
                const embed = {
                    title: "📢 Announcements",
                    color: 0x00ae86,
                    fields: body.data.map(
                        (
                            a: { title: any; description: any; _id: any },
                            i: number,
                        ) => ({
                            name: `${i + 1}) ${a.title}`,
                            value: ` ${a.description}\n \`${a._id}\`\n`,
                        }),
                    ),
                };
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (
                command === "notifications" &&
                ["create", "update"].includes(sub)
            ) {
                const n = body.data;
                const embed = {
                    title:
                        sub === "create"
                            ? "📬 Notification Created"
                            : "✏️ Notification Updated",
                    color: 0xffcc00,
                    fields: [
                        { name: "Title", value: n.title },
                        { name: "Message", value: n.message },
                        { name: "User ID", value: n.userId },
                        { name: "Notification ID", value: `\`${n._id}\`` },
                    ],
                };
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            return interaction.reply({
                content: `✅ ${body.message || "Success"}`,
                ephemeral: true,
            });
        } else {
            return interaction.reply({
                content: `❌ ${body.error || "Error"}`,
                ephemeral: true,
            });
        }
    } catch (e) {
        console.error(e);
        return interaction.reply({
            content: "❌ Request failed",
            ephemeral: true,
        });
    }
});

(async () => {
    await registerCommands();
    await client.login(DISCORD_TOKEN);
})();
