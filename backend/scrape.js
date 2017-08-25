// var PythonShell = require('python-shell')

// PythonShell.run('./scrape.py', (err) => {
//   if (err) throw err;
//   console.log('YAY')
// })

// var spawn = require('child_process').spawn;
// var hey = spawn('python', ['backend/scrape.py'])
//
// hey.stdout.on('data', (data) => {
//   console.log('good', data)
// })
// hey.stderr.on('data', (data) => {
//   console.log('bad', data)
// })
// hey.on('exit', (code) => {
//   console.log('done')
// })





"use strict"

var cheerio = require('cheerio')
var axios = require('axios')

var url = process.argv[2]
var selector = process.argv[3]

axios.get('https://www.nytimes.com/')
  .then(({data}) => {
    // cheerio is a jQuery-like interface
    // emulates jQuery inside node
    // instantiate with data
    var $ = cheerio.load(data);
    $('.story-heading a').toArray().map(e => {
      console.log($(e).text().trim())
    })
  })


// Get information from selector
// $$('selector a').innerText
// CLI command: node scrape.js url selector ('.selectorName')

var wikiMainUrl = 'https://en.wikipedia.org/wiki/Main_Page'
axios.get(wikiMainUrl)
  .then(({data}) => {
    // cheerio is a jQuery-like interface
    // emulates jQuery inside node
    // instantiate with data
    var $ = cheerio.load(data);
    var promiseArray = $('#mp-itn li b a').toArray().map(e => {
      var resolvedUrl = url.resolve(wikiMainUrl, $(e).attr('href'))
      console.log(resolvedUr$(e).attr('href'))
      return axios.get(resolvedUrl)
    })
    return Promise.all(promiseArray)
  })
.then((responses) => {
  responses.map(response => {
    var body = response.data
    var $ = cheerio.load(body)
    console.log('.mw-parser-output > p').first().text().trim()
  })
})
.catch(error => {
  console.log('Error getting data', error)
})
