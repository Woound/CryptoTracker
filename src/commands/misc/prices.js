const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

// Function to retrieve crypto data from the coinmarketcap API.
const getCryptoData = (start, limit) =>
  axios
    .get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_KEY,
        },
      }
    )
    .catch(error => {
      console.log(error);
    });

// Function to update the existing reply with the updated embed.
const updateReply = async (interaction, embed, row) => {
  if (interaction.replied) {
    await interaction.editReply({ embeds: [embed], components: [row] });
  } else {
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

module.exports = {
  name: 'prices',
  description: 'Displays the current prices of the top 10 cryptocurrencies.',
  callback: async (client, interaction) => {
    let start = 1;
    let limit = 10;

    const createEmbed = async () => {
      try {
        const res = await getCryptoData(start, limit);
        const cryptoData = res.data.data;

        const embed = new EmbedBuilder().setTitle(
          'Top 10 Crypto Prices (Current)'
        );

        for (let i = 0; i < cryptoData.length; i++) {
          if (i % 2 === 0) {
            embed.addFields([
              {
                name: ' ',
                value: ' ',
                inline: false,
              },
            ]);
          }
          embed.addFields([
            {
              name: `${cryptoData[i].cmc_rank}. ${cryptoData[i].name} (${cryptoData[i].symbol})`,
              value: `Price: $${parseFloat(
                cryptoData[i].quote.USD.price
              ).toFixed(2)}`,
              inline: true,
            },
          ]);
        }

        embed.setColor('Random').setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('nextPage')
        );

        await updateReply(interaction, embed, row);
      } catch (error) {
        console.log(error.message);
      }
    };

    await createEmbed();

    // Will indicate if the interaction matches the click on the next button.
    const collectorFilter = interaction => interaction.customId === 'nextPage';

    // Listening for interactions on message components in this case the buttons.
    const collector = interaction.channel.createMessageComponentCollector({
      filter: collectorFilter,
      time: 60000,
      max: 10,
    });

    collector.on('collect', async interaction => {
      start += limit;
      await interaction.deferUpdate(); // Acknowledge the interaction to avoid an ephemeral message
      await createEmbed();
    });

    collector.on('end', collected => {
      // Handle any necessary cleanup or end-of-collection actions.
    });
  },
};
