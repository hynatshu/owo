import { UpdateFeature } from "@/services/UpdateService.js";
import express from 'express';
import { BaseAgent } from "@/structure/BaseAgent.js";
import { ExtendedClient } from "@/structure/core/ExtendedClient.js";
import { InquirerUI } from "@/structure/InquirerUI.js";
import { logger } from "@/utils/logger.js";
import { confirm } from "@inquirer/prompts";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import packageJSON from "./package.json" with { type: "json" };
import { Locale } from "@/utils/locales.js";

process.title = `Advanced Discord OwO Tool Farm v${packageJSON.version} - Copyright 2025 © Elysia x Kyou Izumi`;
console.clear();

const updateFeature = new UpdateFeature();
const client = new ExtendedClient();
//temp start
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'owo-bot',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.send('OK');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
//temp
const argv = await yargs(hideBin(process.argv))
    .scriptName("adotf")
    .usage("$0 <command> [options]")
    .commandDir("./src/cli", {
        extensions: ["ts", "js"],
    })
    .option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Enable verbose logging",
        default: false,
    })
    .option("skip-check-update", {
        alias: "s",
        type: "boolean",
        description: "Skip the update check",
        default: false,
    })
    .option("language", {
        alias: "l",
        type: "string",
        description: "Set the language for the application",
        choices: ["en", "tr", "vi"],
        default: "en",
    })
    .help()
    .epilogue(`For more information, visit ${packageJSON.homepage}`)
    .parse();

logger.setLevel(argv.verbose || process.env.NODE_ENV === "development" ? "debug" : "sent");
process.env.LOCALE = argv.language as Locale || "en";

if (!argv._.length) {
    if (!argv.skipCheckUpdate) {
        const updateAvailable = await updateFeature.checkForUpdates();
        if (updateAvailable) {
            const shouldUpdate = await confirm({
                message: "An update is available. Do you want to update now?",
                default: true,
            });
            if (shouldUpdate) {
                await updateFeature.performUpdate();
            }
        }
        await client.sleep(1000); // Wait for update to complete
    }

    const { config } = await InquirerUI.prompt(client);
    await BaseAgent.initialize(client, config);
}




