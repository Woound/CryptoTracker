const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const getNewsArticle = (coin, sortBy) =>
  axios
    .get(
      `https://gnews.io/api/v4/search?q=${coin}&sortby=${sortBy}&lang=en&max=10&apikey=${process.env.GNEWS_KEY}`
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
  name: 'news',
  description:
    'Search for the 10 most recent articles on a crypto of your choice.',
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
          name: 'Most Relevant',
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
    let index = 0;
    const newsArticle = await getNewsArticle(
      interaction.options.get('coin').value,
      interaction.options.get('sort_by').value
    );

    const createEmbed = async () => {
      try {
        const newsArticleData = newsArticle.data.articles[index];

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Previous')
              .setStyle(ButtonStyle.Primary)
              .setCustomId('previousNewsPage')
          )
          .addComponents(
            new ButtonBuilder()
              .setLabel('Next')
              .setStyle(ButtonStyle.Primary)
              .setCustomId('nextNewsPage')
          );

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

        await updateReply(interaction, embed, row);
      } catch (error) {
        interaction.reply({
          content: 'Not Found.',
          ephemeral: true,
        });
        console.log(error);
      }
    };

    await createEmbed();

    // Will indicate if the interaction matches the click on the next or previous button.
    const collectorFilter = interaction =>
      interaction.customId === 'nextNewsPage' ||
      interaction.customId === 'previousNewsPage';

    // Listening for interactions on message components in this case the buttons.
    const collector = interaction.channel.createMessageComponentCollector({
      filter: collectorFilter,
      time: 60000,
      max: 10,
    });

    collector.on('collect', async interaction => {
      await interaction.deferUpdate(); // Acknowledge the interaction to avoid an ephemeral message

      if (interaction.customId === 'nextNewsPage') {
        index++;
      } else if (interaction.customId === 'previousNewsPage') {
        if (index === 0) return;
        index--;
      }

      await createEmbed();
    });

    collector.on('end', collected => {
      // Handle any necessary cleanup or end-of-collection actions.
    });
  },
};
