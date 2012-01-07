var jsdom = require('jsdom');
var http = require('http');
var url = require('url');
var request = require('request');
var querystring = require("querystring");
var fs     = require('fs');
var jquery = fs.readFileSync("./jquery-1.7.1.min.js").toString();

// Defaults
var PORT=11000;


process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});


function parseRatings(urlOrBody, siteDetails, processResult) {
	var result={}
	jsdom.env({
		html: urlOrBody,
		src: [ jquery ],
		done: function(errors, window) {
			var $ = window.$;
			try {
				$(siteDetails.selector).each(function() {
					console.log($(this).text())
					ratingStr = $(this).text().match(siteDetails.ratingRegex)[0]
					reviewsStr = $(this).text().match(siteDetails.reviewsRegex)[0]
					
					console.log(ratingStr)
					console.log(reviewsStr)
					reviewsStr = reviewsStr.replace(/(^\d+)(.+$)/i,'$1')
					
					ratingParts = ratingStr.split(siteDetails.ratingSplitter)
					result.rating=parseFloat(ratingParts[0])
					result.maxRating=parseFloat(ratingParts[1])
					result.reviews=parseInt(reviewsStr)
					
					return false;
				});
			}
			catch(err) {
				result={ rating:-1, maxRating:-1, reviews:-1 };
			}
			console.log(result)
			window.close();
			processResult(result)
		}
	});
}

function appliesTo(url, siteDetails) {
	if(url.indexOf(siteDetails.domain)!=-1)
		return true;
	else
		return false;
}

/*
 --------------------------------------------------------
 NewEgg.com Ratings Parser 
 --------------------------------------------------------
*/
NewEgg = {
	name: 'New Egg',
	ratingRegex: /\d\/\d/,
	reviewsRegex: /\d+\sreviews/,
	ratingSplitter: '/',
	selector: 'a.itmRating',
	domain: 'newegg.com',
	getRating: function(pageUrl, processResult) {
		parseRatings(pageUrl, NewEgg, processResult);
	}
}

/*
 --------------------------------------------------------
 Amazon.com Ratings Parser 
 --------------------------------------------------------
*/
Amazon = {
	name: 'Amazon',
	ratingRegex: /\d.?\d? out of \d/,
	reviewsRegex: /\d+\scustomer\sreviews/,
	ratingSplitter: 'out of',
	selector: '.crAvgStars',
	domain: 'amazon.com',
	getRating: function(pageUrl, processResult) {
		parseRatings(pageUrl, Amazon, processResult);
	}
}


/*
 --------------------------------------------------------
 BestBuy.com Ratings Parser 
 --------------------------------------------------------
*/
BestBuy = {
	name: 'Best Buy',
	ratingRegex: /\d.?\d? of \d/,
	reviewsRegex: /\d+\sreviews/,
	ratingSplitter: ' of ',
	selector: '.customer-reviews',
	domain: 'bestbuy.com',
	getRating: function getPage (pageUrl, processResult) {
		request({uri: pageUrl, headers:{'User-Agent': 'Mozilla/5.0'}}, function (error, response, body) {
			parseRatings(body, BestBuy, processResult);
		});
	}
}

/*
 --------------------------------------------------------
 Utility Functions
 --------------------------------------------------------
*/
function encodeUrl(url) {
	return url.replace(/ /gi, "%20");
}

/*
 Create the HTTP Server
*/
var scrapers=[NewEgg, Amazon, BestBuy];

http.createServer(function (req, res) {
	
	var params = url.parse(req.url, true).query;
	console.log('URL To Parse: ' + params.url)
	console.log('Callback: ' + params.callback)
		
	if('url' in params) {
		var targetUrl = url.parse(params.url, true)
		
		res.writeHead(200, {'Content-Type': 'text/plain'});
		
		for (var i in scrapers) {
			scraper=scrapers[i];
			if (appliesTo(params.url, scraper)) {
				console.log('Domain: '+scraper.domain)
				scraper.getRating(encodeUrl(params.url), function(result) {
					if('callback' in params) {
						res.write(params.callback+'('+JSON.stringify(result)+')');
					}
					else {
						res.write(JSON.stringify(result));
					}
					res.end()
					console.log('\n--------------------------------------------\n');
				});
			}
		}
	}
}).listen(PORT);
console.log('Service running at port '+PORT);