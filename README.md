JSON Service To Extract User Ratings From Online Shoping Sites
===

### About

This is simple Node.js based service designed to take a URL and reply with simple
JSON the user ratings of a produt, if found on the page. If you are working on a project
to collect project related information, it is easy to become an affiliate of sites like
Amazon.com or BestBuy.com and access their product information legally and cleanly. However
none of them share the ratings and the comments information from their API.

This project is to fill that gap of information. You can get the product information formally
through the API and use a service like this to acquire rest of the information.

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

	http://localhost:11000?url=[url of the product page]

Response:

	{"rating":"2.6 ","maxRating":"5","reviews":"475"}


### I Need Your Help

I am new to Node.js and enjoying working on it. I would like my work to be accessible as many people as possible.
If you have any suggestion or comment on how I can structure of manage this project better, please feel free to
let me konw.