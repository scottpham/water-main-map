This is a graphic made for the NBC Bay Area Investigative Unit, available at http://www.nbcbayarea.com/investigations. A demo is available via the link in the description. This is a production version made available mainly for transparency.

The aim is to visualize leaks of drinking water pipes in the Bay Area in the context of a rapidly aging infrastructure. Heavily inspired by [this map](http://graphics.latimes.com/la-aging-water-infrastructure/) from the LA Times. 

###Data:
Leaks from the past 4 years from the East Bay Municipal Utilities District, the San Francisco Water, Power and Sewer, San Jose Water Company and the City of San Jose.  

###Technologies used:
- Mapbox.js
- [Geocodify](http://jquery-geocodify.readthedocs.org/en/latest/) to allow for user search
- [Turf.js](https://www.mapbox.com/guides/intro-to-turf/) to dynamically render markers (avoids overloading browser with the 4k data points)
