
const Discord = require("discord.js")
const fetch = require("node-fetch")
const keepAlive = require("./server")
var axios = require('axios');
const { MessageEmbed } = require('discord.js');


const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"]})//to fix a bug
const mySecret = process.env['TOKEN']
const xrapidapikey = process.env['x-rapidapi-key']


function formWeatherEmbed(answer){
    cityName = answer["location"]["name"]
    countryName = answer["location"]["country"]
    timeUpdated = answer["current"]["last_updated"]
    currentTemp = answer["current"]["temp_c"]
    weatherDescription = answer["current"]["condition"]["text"]
    weatherIcon = "https://" + answer["current"]["condition"]["icon"].substring(2)

    const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Weather In ' + cityName + ", " + countryName)
    .addFields(
    { name: 'Description', value: weatherDescription, inline: false },
    { name: 'Current Temperature (℃)', value: currentTemp + "℃", inline: false},
    { name: 'Last Update', value: timeUpdated, inline: false },
    )
    .setThumbnail(weatherIcon)

  return embed
}

function formMemeEmbed(url, subreddit){
    const embed = new MessageEmbed()
    .setColor('#ffa600')
    .setTitle('Taken from r/' + subreddit)
    .setImage(url)

  return embed
}

function formCovidEmbed(countryName, country){
  cases = country['cases']
  deaths = country['deaths']
  recovered = country['total_recovered']
  new_deaths = country['new_deaths']
  new_cases = country['new_cases']
  serious_critical = country['serious_critical']
  active_cases = country['active_cases']
  covid_img_url = "https://www.statnews.com/wp-content/uploads/2020/02/Coronavirus-CDC-645x645.jpg"

  const embed = new MessageEmbed()
    .setColor('#ff000d')
    .setTitle('Covid Stats in ' + countryName)
    .addFields(
    { name: 'Cases Since Start', value: cases, inline: true },
    { name: 'Deaths Since Start', value: deaths, inline: true},
    { name: 'New Deaths', value: new_deaths, inline: true },
    { name: 'New Cases', value: new_cases, inline: true },
    { name: 'Critical Patients', value: serious_critical, inline: true },
    { name: 'Active Cases', value: active_cases, inline: true },
    )
    .setThumbnail(covid_img_url)

  return embed
}

function formHelpEmbed(){
  mip_url ="https://static.wikia.nocookie.net/phineasandferb/images/0/06/Georgia_Meap.jpg/revision/latest?cb=20120528042834"

  const embed = new MessageEmbed()
  .setColor('#ff36e4')
  .setTitle('mip Bot Commands')
  .addFields(
  { name: '!meme', value: "Sends a random meme from a funny subreddit", inline: false },
  { name: '!covid Country', value: "Sends covid-19 stats of a given country", inline: false},
  { name: '!weather City', value: "Sends current weather stats of a given city", inline: false },
  )
  .setThumbnail(mip_url)

  return embed
}


function formErrorEmbed(message){

  error_url = "https://w7.pngwing.com/pngs/882/726/png-transparent-red-x-logo-scalable-graphics-wikimedia-commons-x-mark-computer-file-error-s-angle-hand-wing-thumbnail.png"

  const embed = new MessageEmbed()
    .setColor('#ff1420')
    .setTitle('ERROR')
    .setThumbnail(error_url)
    .setDescription(message)
    .setFooter("😂you dummy😂")
  
  return embed
}


function getLiveCovid(countryName){

  return fetch("https://corona-virus-world-and-india-data.p.rapidapi.com/api", {
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "corona-virus-world-and-india-data.p.rapidapi.com",
      "x-rapidapi-key": xrapidapikey
    }
  })
  .then(res => {
      return res.json()
  })
  .then(response => {
    const country = response['countries_stat'].find((countryEntry) => 
    countryEntry['country_name'].toUpperCase() === countryName.toUpperCase())
    return country
  })
  .catch(err => {
    return "couldn't process request"
  });
}

function getRandomMeme(){
  return fetch("https://meme-api.herokuapp.com/gimme")
  .then(res => {
      return res.json()
  })
  .then(data => {
    return data
  })
  .catch(error => {
    default_meme = "https://cdn.custom-cursor.com/packs/4192/meme-amogus-pack.png"
    return default_meme
  })
}

function getLiveWeather(cityName){
  cityName = cityName.toLowerCase()
  cityName.replaceAll(" ", "_")
  return fetch("https://weatherapi-com.p.rapidapi.com/current.json?q=" + cityName, {
  "method": "GET",
  "headers": {
    "x-rapidapi-host": "weatherapi-com.p.rapidapi.com",
    "x-rapidapi-key": xrapidapikey
  }
  })
  .then(res => {
      return res.json()
  })
  .then(response => {
    return response
  })
  .catch(err => {
    var error = "```\nERROR ->  Check API```"
    return error
  })

  }



client.on("ready", () => {
  console.log('Logged in as '+ client.user.tag + '!')
})

client.on("message", async msg => {
  content = msg.content
  if(msg.author.bot) return

  if(content === "hara")
    msg.reply("maniak")

  if(content === "mip")
    msg.reply("mip")

  if(content.toLowerCase().startsWith("!covid"))
  {
    var embed = " "
    if(content.split(" ").length >= 2){
      country = content.substring(7)
      country = country[0].toUpperCase() + country.substring(1).toLowerCase()

      getLiveCovid(country).then(answer => {
        if(answer != undefined){
          embed = formCovidEmbed(country, answer)
        }else{
          error = "Could Not Identify Country"
          embed = formErrorEmbed(error)
        }
        msg.channel.send({ embeds: [embed] })        
        })
    }else{
      var error = "Not Assigned a Country\n"
      error += "Correct Format -> !covid Country"
      embed = formErrorEmbed(error)
      msg.channel.send({ embeds: [embed] })        
    }
  }

  if(content.toLowerCase().startsWith("!meme")){
    var embed = " "
    if(content.toLowerCase() == "!meme"){
      getRandomMeme().then(answer => {
      if(answer !== "https://cdn.custom-cursor.com/packs/4192/meme-amogus-pack.png"){
        embed = formMemeEmbed(answer["url"], answer["subreddit"])
      }else{
        embed = formMemeEmbed(answer["url"], "amogusus")
      }
        msg.channel.send({ embeds: [embed] })
      })
    }else{
      var error = "This Function Does Not Recieve Any Input"
      embed = formErrorEmbed(error)
      msg.channel.send({ embeds: [embed] })
    }
  }

  if(content.toLowerCase().startsWith("!weather")){
    var embed = " "
    if(content.split(" ").length >= 2){
      city = content.substring(9)
      getLiveWeather(city).then(answer => {
        if(answer.hasOwnProperty("location")){
          embed = formWeatherEmbed(answer)
        }else{
          var error = "Could Not Recognize " + city
          embed = formErrorEmbed(error)
        }
      msg.channel.send({ embeds: [embed] })
    })
    }else{
      var error = "Not Assigned a City\n"
      error += "Correct Format -> !weather City"
      embed = formErrorEmbed(error)
      msg.channel.send({ embeds: [embed] })
    }
  }



  if(content.toLowerCase() == "!help"){
      const embed = formHelpEmbed()
      msg.channel.send({ embeds: [embed] })
  }

})
keepAlive()
client.login(mySecret)