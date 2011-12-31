JSON Service To Extract User Ratings From Online Shoping Sites
===

### About

This is simple Node.js based service designed to take a URL and reply with simple
JSON the user ratings of a produt, if found on the page.

### Supported Sites
  - NewEgg.com
  - Amazon.com
  - BestBuy.com

### Installation

Simply download getratings.js and use node.js to run it

	node getratings.js

### Usage

Assuming the service is running on local host, you can request the rating for a produc page on Amazon.com
by issuing the following request

	http://localhost:1337?url=[url of the product page]

Response:

	{"rating":"2.6 ","maxRating":"5","reviews":"475"}
