![Image](https://img.shields.io/npm/v/backup.djs?color=%2351F9C0&label=backup.djs)
![Image](https://img.shields.io/npm/dt/backup.djs.svg?color=%2351FC0&maxAge=3600)

#

![Image](https://nodei.co/npm/backup.djs.png?downloads=true&downloadRank=true&stars=true)

# Warn
```npm
- Discord.JS Version V12 Required.
```

# Backup Use
```js
const Discord = require("discord.js");
const client = new Discord.Client();
const {
    createBackup,
    loadBackup,
    deleteBackup,
    fetchBackup,
    backupHas
    } = require("backup.djs");

client.on("ready", () => console.log("Bot Online!"));

client.on("message", async (message) => {
    let prefix = "!";

    if (!message.content.startsWith(prefix)
    || message.channel.type === "dm"
    || message.author.bot) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/);
    let commandName = args.shift().toLocaleLowerCase();

    if (commandName === "backup") {
        let option = args[0];
        if (!option)
        return message.reply(
            "You must specify an option. **(create, load, info**"
        );

        //backup create
        if (option === "create") {
            await createBackup(
                message.guild,
                message.author.id,
                {
                    doNotBackup: ["bans"] //options: ["bans", "channels", "roles", "emojis"]
                })
                .then((backupData) => {
                    //backupData: { id: backupID, author: backupAuthorID }
                    return message.reply(
                        `Backup successfuly created, Backup ID: ${backupData.id}, Backup Author: <@${backupData.author}>`
                    );
                });
        }

        //backup load
        else if (option === "load") {
            let backupid = args[1];
            if (!backupid) 
            return message.reply(
                "You must specify a backup ID."
            );

            await loadBackup(
                backupid,
                message.guild,
                {
                    clearGuild: true //true/false
                })
                .then((data) => {
                    if (data === null)
                    return message.reply(
                    "The specified Backup ID could not be found in the database."
                    )
                    else if (data !== null)
                    return message.author.send(
                        "Backup successfuly loaded."
                    );
                });
        }

        //backup info
        else if (option === "info") {
            let backupid = args[1];
            if (!backupid) 
            return message.reply(
                "You must specify a backup ID."
            );

            await fetchBackup(backupid).then((data) => {
                if (data === null)
                return message.reply(
                    "The specified Backup ID could not be found in the database."
                )
                else if (data !== null) {

                let roles;
                roles = data.roles.map(r => r.name).join("\n");

                let others;
                others = data.channels.others.map(c => c.name).join("\n  ") || "\n"

                let categories;
                categories = data.channels.categories.map(c => `• ${c.name}\n  ${c.children.map(c => c.name).join("\n  ")}`).join("\n\n")

                if (roles.length > 1024) {
                    roles = `${roles.slice(0, 300)} ...`
                };

                if (others.length > 1024) {
                    others = `${others.slice(0, 300)} ...`
                }

                if (categories.length > 1024) {
                    categories = `${categories.slice(0, 300)} ...`
                }

                return message.channel.send(new Discord.MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle("Backup Info")
                    .addField("Channels", `\`\`\`${others} \n\n${categories}\`\`\``, true)
                    .addField("Roles", `\`\`\`${roles}\`\`\``, true)
                    .setFooter(`Created: ${data.created}`))
                    .catch((err) => { });
                };
            })
        }

        //backup delete
        else if (option === "delete") {
            let backupid = args[1];
            if (!backupid) 
            return message.reply(
                "You must specify a backup ID."
            );

            await deleteBackup(backupid, message.author.id).then((data) => {
                if (data === null)
                return message.reply(
                    "The specified Backup ID could not be found in the database."
                )
                else if (data === false)
                return message.reply(
                    "You can't delete it because you're not the one creating the backup."
                )
                else if (data === true)
                return message.reply(
                    "Backup successfuly deleted."
                );
            })
        }
        else {
            return message.reply(
                "Invalid option! **(create, load, info)**"
            )
        }
    };
});

client.login("BOT TOKEN");
```

### To Report a Bug: Emirhan77#0001 Via Discord
