const fetch = require('node-fetch');
const {
  openseaAssetUrl
} = require('../config.json');

const Discord = require('discord.js');

module.exports = {
  name: process.env.DISCORD_TOKEN_COMMAND || "token",
  execute(message, args) {
    if (!args.length) {
      return message.channel.send(`You must provide a Token ID.`);
    }

    if (isNaN(parseInt(args[0]))) {
      return message.channel.send(`Token ID must be a number.`);
    }

    let url = `${openseaAssetUrl}/${process.env.CONTRACT_ADDRESS}/${args[0]}`;
    let settings = {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.OPEN_SEA_API_KEY
      }
    };

    fetch(url, settings)
      .then(res => {
        if (res.status == 404 || res.status == 400) {
          throw new Error("[Error] Token ID does not exist.");
        }
        if (res.status != 200) {
          throw new Error(`[Error] Failure to retrieve Token Metadata: ${res.statusText}`);
        }
        return res.json();
      })
      .then((metadata) => {
        const embedMsg = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setAuthor('Lolpop Sales', 'https://i.imgur.com/MaQQdwK.png', 'https://opensea.io/collection/lolpops')
          .setTitle(metadata.name)
          .setURL(metadata.permalink)
          .setDescription(metadata.description)
          .setThumbnail(metadata.image_url)
          .addField('--Owner--', metadata.owner.user?.username || metadata.owner.address.slice(0, 8))
          .addField('--Attributes--', '\u200B')
          .setImage(metadata.image_url)
          .setTimestamp()
          .setFooter('Usage: !lolstats <Token ID>', 'https://i.imgur.com/MaQQdwK.png');
        metadata.traits.forEach(function (trait) {
          embedMsg.addField(trait.trait_type, `${trait.value} (${Number(trait.trait_count / metadata.collection.stats.count).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })})`, true)
        });
        message.channel.send(embedMsg);
      })
      .catch(error => message.channel.send(error.message));
  },
};