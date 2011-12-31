var jsdom = require('jsdom');
var http = require('http');
var url = require('url');
var request = require('request');
var querystring = require("querystring");

/*
 --------------------------------------------------------
 NewEgg.com Ratings Parser 
 --------------------------------------------------------
*/
NewEgg = {
	name: 'New Egg',
	ratingRegex: /\d\/\d/,
	reviewsRegex: /\d+\sreviews/,
	getRating: function(pageUrl, processResult) {
		var result = {}
		jsdom.env({
			html: pageUrl,
			scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ],
			done: function(errors, window) {
				var $ = window.$;
				//console.log('HN Links');
				$('a.itmRating').each(function() {
					//console.log(' -', $(this).text());
					ratingStr = $(this).text().match(NewEgg.ratingRegex)[0]
					reviewsStr = $(this).text().match(NewEgg.reviewsRegex)[0].replace(/(^\d+)(.+$)/i,'$1')
					
					ratingParts = ratingStr.split("/")
					console.log(ratingParts)
					result.rating=ratingParts[0]
					result.maxRating=ratingParts[1]
					result.reviews=reviewsStr
				});
				console.log(result)
				processResult(result)
			}
		});
		
		return result;
	},
	appliesTo: function(pageUrl) {
		if(pageUrl.indexOf('newegg.com')!=-1)
			return true;
		else
			return false;
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
	getRating: function(pageUrl, processResult) {
		var result = {}
		jsdom.env({
			html: pageUrl,
			scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ],
			done: function(errors, window) {
				var $ = window.$;
				//console.log('HN Links');
				$('.crAvgStars').each(function() {
					//console.log(' -', $(this).text());
					ratingStr = $(this).text().match(Amazon.ratingRegex)[0]
					reviewsStr = $(this).text().match(Amazon.reviewsRegex)[0].replace(/(^\d+)(.+$)/i,'$1')
					
					ratingParts = ratingStr.split("out of")
					console.log(ratingParts)
					result.rating=ratingParts[0]
					result.maxRating=ratingParts[1]
					result.reviews=reviewsStr
					
					return false;
				});
				console.log(result)
				processResult(result)
			}
		});
		
		return result;
	},
	appliesTo: function(pageUrl) {
		if(pageUrl.indexOf('amazon.com')!=-1)
			return true;
		else
			return false;
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
	getRating: function getPage (pageUrl, processResult) {

		request({uri: pageUrl, headers:{'User-Agent': 'Mozilla/5.0'}}, function (error, response, body) {
		
			jsdom.env({
				html: body,
				scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ],
				done: function(errors, window) {
					var $ = window.$;
					result={};
					
					$('.customer-reviews').each(function() {
						ratingStr = $(this).text().match(BestBuy.ratingRegex)[0]
						reviewsStr = $(this).text().match(BestBuy.reviewsRegex)[0].replace(/(^\d+)(.+$)/i,'$1')
						
						ratingParts = ratingStr.split(" of ")
						result.rating=ratingParts[0]
						result.maxRating=ratingParts[1]
						result.reviews=reviewsStr
						
						return false;
					});
					
					processResult(result)
				}
			});
		});
	},
	appliesTo: function(pageUrl) {
		if(pageUrl.indexOf('bestbuy.com')!=-1)
			return true;
		else
			return false;
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
	console.log(params.url)
		
	if('url' in params) {
		var targetUrl = url.parse(params.url, true)
		console.log(targetUrl.hostname)
		
		res.writeHead(200, {'Content-Type': 'text/plain'});
		
		for (var i in scrapers) {
			scraper=scrapers[i];
			console.log(scraper.name)
			if (scraper.appliesTo(params.url)) {
				scraper.getRating(encodeUrl(params.url), function(result) {
					res.write(JSON.stringify(result));
					res.end()
				});
			}
		}
	}
}).listen(1337);
console.log('Server running at port 1337');