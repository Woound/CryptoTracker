const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const getNewsArticle = (coin, sortBy) =>
  axios
    .get(
      `https://gnews.io/api/v4/search?q=${coin}&sortby=${sortBy}&lang=en&max=1&apikey=${process.env.GNEWS_KEY}`
    )
    .catch(error => {
      console.log(error);
    });

module.exports = {
  name: 'news',
  description: 'Search for recent articles on a crypto of your choice.',
  options: [
    {
      name: 'coin',
      description: 'Name of the crypto coin to search articles for.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'sort_by',
      description: 'Custom article sorting option.',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'Most Relevant (Recommended)',
          value: 'relevance',
        },
        {
          name: 'Publication date',
          value: 'publishedAt',
        },
      ],
      required: true,
    },
  ],

  callback: async (client, interaction) => {
    const newsArticle = await getNewsArticle(
      interaction.options.get('coin').value,
      interaction.options.get('sort_by').value
    );

    try {
      const newsArticleData = newsArticle.data.articles[0];

      const embed = new EmbedBuilder()
        .setTitle(newsArticleData.title)
        .setDescription(newsArticleData.description)
        .addFields([
          {
            name: 'Content',
            value: newsArticleData.content,
          },
          {
            name: 'Link',
            value: newsArticleData.url,
          },
          {
            name: 'Date Published',
            value: newsArticleData.publishedAt,
            inline: true,
          },
          {
            name: 'Source',
            value: newsArticleData.source.name,
            inline: true,
          },
        ])
        .setColor('Random')
        .setTimestamp()
        .setImage(newsArticleData.image);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      interaction.reply({
        content: 'Not Found.',
        ephemeral: true,
      });
      console.log(error);
    }
  },
};
