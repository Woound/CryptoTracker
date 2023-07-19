const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const getWalletData = async walletAddress => {
  try {
    const response = await axios.get(
      `https://api.covalenthq.com/v1/btc-mainnet/address/${walletAddress}/balances_v2/?key=${process.env.COVALENT_KEY}`
    );
    return response.data;
  } catch (error) {
    console.log(
      'Invalid wallet address. Please enter a valid Bitcoin wallet address.'
    );
  }
};

const getBTCBalance = (balance, contractDecimals) => {
  const divisor = 10 ** contractDecimals;
  return (balance / divisor).toString();
};

module.exports = {
  name: 'btcwallet-data',
  description: 'View data on a bitcoin wallet.',
  options: [
    {
      name: 'wallet-address',
      description: 'Address of the wallet to search.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  callback: async (client, interaction) => {
    try {
      const walletData = await getWalletData(
        interaction.options.get('wallet-address')?.value
      );

      const embed = new EmbedBuilder()
        .setTitle('BTC Wallet Data')
        .setDescription(
          `Address: ${walletData.data.address}\n\nLast Transferred: ${walletData.data.items[0].last_transferred_at}\n`
        )
        .addFields(
          {
            name: 'Chain Name',
            value: walletData.data.chain_name,
            inline: true,
          },
          {
            name: 'Updated At',
            value: walletData.data.updated_at.slice(0, 19),
            inline: true,
          },
          {
            name: ' ',
            value: ' ',
          }
        )
        .addFields(
          {
            name: 'Total BTC Balance',
            value: await getBTCBalance(
              parseInt(walletData.data.items[0].balance),
              parseInt(walletData.data.items[0].contract_decimals)
            ),
            inline: true,
          },
          {
            name: 'Total USD Balance',
            value: walletData.data.items[0].pretty_quote,
            inline: true,
          }
        )
        .setThumbnail(
          'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1280px-Bitcoin.svg.png'
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
