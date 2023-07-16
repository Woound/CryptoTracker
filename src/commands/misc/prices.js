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

// Creating an embed to display relevant data from the API.
const createEmbed = (interaction, start, limit) => {
  getCryptoData(start, limit)
    .then(async res => {
      const cryptoData = res.data.data; // Retrieve the crypto data from the response

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
            value: `Price: $${parseFloat(cryptoData[i].quote.USD.price).toFixed(
              2
            )}`,
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

      if (!interaction.replied) {
        interaction.reply({ embeds: [embed], components: [row] });
      } else {
        interaction.editReply({ embeds: [embed], components: [row] });
      }
    })
    .catch(error => {
      console.log(error.message);
    });
};

module.exports = {
  name: 'prices',
  description: 'Displays the current prices of the top 10 cryptocurrencies.',
  // devOnly: Boolean,
  // testOnly: Boolean,
  // options: Object[],

  callback: async (client, interaction) => {
    let start = 1;
    let limit = 10;
    await createEmbed(interaction, start, limit);

    // Will indicate if the interaction matches the click on the next button.
    const collectorFilter = interaction => interaction.customId === 'nextPage';

    // Listening for interactions on message components in this case the buttons.
    const collector = interaction.channel.createMessageComponentCollector({
      collectorFilter,
      time: 60000,
      max: 1,
    });

    collector.on('collect', async interaction => {
      start += limit;

      await createEmbed(interaction, start, limit);
    });

    collector.on('end', collected => {
      // Handle any necessary cleanup or end-of-collection actions.
    });
  },
};
