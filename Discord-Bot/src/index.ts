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
} = process.env as Record<string, string>;

// 1) Define slash commands (no start_time or end_time)
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
                        name: "message",
                        description: "Message",
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
                        name: "message",
                        description: "New message",
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
                description: "Show usage for announce commands",
            },
        ],
    },
];

// 2) Register commands
async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
    });
    console.log("Slash commands registered");
}

// 3) Create Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

// 4) Handle interactions
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "announce") return;

    const member = interaction.member;
    if (
        !member ||
        !(member instanceof GuildMember) ||
        !(member.roles instanceof GuildMemberRoleManager) ||
        !member.roles.cache.has(ADMIN_ROLE_ID)
    ) {
        return interaction.reply({
            content: "🚫 Not allowed",
            ephemeral: true,
        });
    }

    const sub = interaction.options.getSubcommand();
    if (sub === "help") {
        const embed = {
            title: "Announce Commands",
            color: 0x00ae86,
            fields: [
                {
                    name: "/announce create",
                    value: "title (string), message (string)\nCreate a new announcement.",
                },
                {
                    name: "/announce update",
                    value: "id (string), [title], [message]\nUpdate an existing announcement by ID.",
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
        };
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Clean payload
    const allowedKeys = ["id", "title", "message", "limit"];
    const payload: Record<string, any> = {};
    for (const key of allowedKeys) {
        const value =
            interaction.options.getString(key) ??
            interaction.options.getInteger(key);
        console.log(JSON.stringify({ key, value }));
        if (value !== null && value !== undefined) {
            payload[key] = value;
        }
    }

    // Determine endpoint & method
    let url = `${API_BASE_URL}/announcements`;
    let method: string;
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
            url += `?${new URLSearchParams(payload as any)}`;
            break;
        default:
            return;
    }

    console.log(JSON.stringify({ payload }));

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

        if (method === "GET" && res.ok) {
            const embed = {
                title: "📢 Announcements",
                color: 0x00ae86,
                fields: body.data.map((announcement: any, i: number) => ({
                    name: `${i + 1}) ${announcement.title}`,
                    value: `📝 ${announcement.message}\n🆔 \`${announcement._id}\`\n`,
                })),
            };
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const reply = res.ok
                ? `✅ ${body.message || "Success"}`
                : `❌ ${body.error || "Error"}`;
            await interaction.reply({ content: reply, ephemeral: true });
        }
    } catch (e) {
        console.error(e);
        await interaction.reply({
            content: "❌ Request failed",
            ephemeral: true,
        });
    }
});

// 5) Startup
(async () => {
    await registerCommands();
    await client.login(DISCORD_TOKEN);
})();
