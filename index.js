const { MessageActionRow, MessageButton } = require('discord-buttons');

module.exports = {
    createPages: async (interaction, message, embeds, duration, buttonStyle, rightEmoji, leftEmoji, cancelEmoji) => {
        if (!['red', 'green', 'blurple'].includes(buttonStyle)) throw new TypeError(`Button style provided is not valid. Valid options: red, green, blurple`);
        if (!rightEmoji) throw new TypeError(`An emoji to go to the next page was not provided.`);
        if (!leftEmoji) throw new TypeError(`An emoji to go to the previous page was not provided.`);
        if (!leftEmoji) throw new TypeError(`An emoji to go cancel the embed page was not provided.`);

        const fowardButton = new MessageButton()
            .setLabel("")
            .setStyle(buttonStyle)
            .setEmoji(rightEmoji)
            .setID('next-page');

        const backButton = new MessageButton()
            .setLabel("")
            .setStyle(buttonStyle)
            .setEmoji(leftEmoji)
            .setID('back-page');

        const deleteButton = new MessageButton()
            .setLabel("")
            .setStyle(buttonStyle)
            .setEmoji(cancelEmoji)
            .setID('delete-page');

        const interactiveButtons = new MessageActionRow()
            .addComponent(backButton)
            .addComponent(deleteButton)
            .addComponent(nextButton);

        const msg = await message.channel.send({ components: [interactiveButtons], embed: embeds[0] });
        interaction.message = msg;
        interaction.embeds = embeds;
        interaction.currentPage = 0;
        interaction.duration = duration;
        interaction.interactor = message.author;
        interaction.buttonStartTime = Date.now();
        interaction.components = interactiveButtons;
    },

    buttonInteractions: async (button, interaction) => {
        if (interaction.interactor !== button.clicker.user || Date.now - interaction.buttonStartTime >= interaction.duration || button.message.id !== interaction.msg.id) return;
        if (button.id == 'next-page') {
            (interaction.currentPage + 1 == interaction.embeds.length ? interaction.currentPage = 0 : interaction.currentPage += 1);
            interaction.msg.edit({ embed: interaction.embeds[interaction.currentPage], components: [interaction.components] });
            button.defer(true);
        } else if (button.id == 'back-page') {
            (interaction.currentPage - 1 < 0 ? interaction.currentPage = interaction.embeds.length - 1 : interaction.currentPage -= 1);
            interaction.msg.edit({ embed: this.interaction.embeds[this.interaction.currentPage], components: [interaction.components] });
            button.defer(true);
        } else if (button.id == 'cancel-page') {
            await interaction.msg.delete()
                .catch(err => console.error(err));
        }
    }
};