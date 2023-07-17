const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'search',
  description: 'Search info about a cryptocurrency by name.',
  options: [
    {
      name: 'name',
      description: 'Name of the crypto to search.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  callback: (client, interaction) => {
    const embed = new EmbedBuilder().setTitle(`{Name} information`).addFields({
      name: 'Title',
      value: ' Data',
      inline: true,
    });

    interaction.reply({ embeds: [embed] });
  },
};
