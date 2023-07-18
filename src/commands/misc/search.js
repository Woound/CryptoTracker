const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const getCoinInfo = name =>
  axios
    .get(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?slug=${name}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_KEY,
        },
      }
    )
    .catch(error => {
      console.log(error);
    });

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

  callback: async (client, interaction) => {
    const coinInfo = await getCoinInfo(
      interaction.options.get('name')?.value.toLowerCase()
    );

    if (!coinInfo) {
      interaction.reply('Coin not found.');
      return;
    }

    try {
      const coinData = coinInfo.data.data;
      // API returns data with a weird string, to access it we turn everything into an array and access ther first element.
      const firstCoin = Object.values(coinData)[0];

      const embed = new EmbedBuilder()
        .setTitle(`${firstCoin.name} information`)
        .setDescription(firstCoin.urls.website[0])
        .addFields(
          {
            name: firstCoin.symbol,
            value: firstCoin.description,
          },
          {
            name: 'Date Launched',
            value: firstCoin.date_added.slice(0, 10),
            inline: true,
          },
          {
            name: 'Reddit',
            value: firstCoin.urls.reddit[0] || 'Not Added',
            inline: true,
          }
        )
        .setThumbnail(firstCoin.logo);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
