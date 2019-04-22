/* Magic Mirror
 * Module: MMM-MyWeather-wb
 *
 * By Martin Kooij (https://github.com/martinkooij)
 * Based on MMM-MyWeather
 * MIT Licensed.
 */
 

var NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');
var RSSParser = require('rss-parser') ;




module.exports = NodeHelper.create({
  start: function () {
    console.log('MMM-MyWeather helper started ...');
	this.fetcherRunning = false;
	this.country = null;
	this.wunderPayload = {
		current: null,
		daily: null,
		hourly: null,
		alarm: null
	};
	this.parser = new RSSParser() ;
  },


  fetchWeatherbits: function() {      
		var self = this ;

        var wulang = this.config.lang.toLowerCase();

        var params = "?lat=" + this.config.lat;
        params += "&lon=" + this.config.lon ;
		params += "&key=" + this.config.apikey;
		params += "&lang=" + wulang;
        
        var Wurl = this.config.apiBase + "/current" + params;
		var Wurlf = this.config.apiBase + "/forecast/daily" + params
		var Wurlf3 = this.config.apiBase + "/forecast/hourly" + params ;
		if ( this.config.debug === 1 ) {
			console.log(moment().format() + " 4 " + this.name  + ": " + Wurl);
		}
        request({
            url: Wurl,
            method: 'GET'
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        self.wunderPayload.current = JSON.parse(body);
                        // console.log(moment().format() + " <5> " + self.name + ": " + body);
						// console.log(Wurlf) ;
						request({
						url: Wurlf,
						method: 'GET'
						}, function(err, res, bd) {
							if (!err && res.statusCode == 200) {
								self.wunderPayload.daily = JSON.parse(bd);
								// console.log(moment().format() + " <5b> " + self.name + ": " + bd);
								request({
									url: Wurlf3,
									method: 'GET'
										}, function(e, r, b) {
												if (!e && r.statusCode == 200) {
												self.wunderPayload.hourly = JSON.parse(b) ;
												if (self.config.debug === 1) {
													console.log(moment().format() + " <5c> " + self.name + ": " + self.wunderPayload);
												}
												if (self.config.alarmUrl != null) {
													self.parser.parseURL(self.config.alarmUrl, function(errorp, feed) {
														if (!errorp) {
															self.wunderPayload.alarm = self.extractAlarminfo(feed) ;
															self.sendSocketNotification('WEATHERBIT',self.wunderPayload);
														} else {
															console.log(moment().format() + " <6d> " + self.name + ": " + errorp);
														}
													});
												} else {
													self.sendSocketNotification('WEATHERBIT',self.wunderPayload);
												} ;
												} else {
												console.log(moment().format() + " <6c> " + self.name + ": " + e);
												}
											});
								} else {
								console.log(moment().format() + " <6b> " + self.name + ": " + err);
								}
						});
                    } else {
                        console.log(moment().format() + " <6a> " + self.name + ": " + error);
                    }
				})			
	},
					
    startFetcher: function () {
		var self = this;
        this.fetcherRunning = true; 
		this.fetchWeatherbits() ;
		setTimeout(function() {
                       self.startFetcher();
                    }, self.config.updateInterval);

    },
  
  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    // console.log(notification);
    
    var self = this;
    
    if(notification === "GET_WEATHERBIT"){
            
        this.config = payload;

        // console.log(JSON.stringify(payload));

        if ( this.config.debug === 1 ) {
			console.log('Lets get WeatherBits');
		}

        if (!this.fetcherRunning) {
            this.startFetcher();
        } 
        
    }
  },
  
  extractAlarminfo: function (parsedxml) {
	  var alarm = [] ;
	  var wimages = RegExp('awt:([\\d]*)[\\s]*level:([\\d]*)','g');
	  var content = parsedxml.items[0].content.replace(/Tomorrow[\s\S]*$/i, "") ;
	  var result;
	  while ((result = wimages.exec(content)) !== null) {
		alarm.push( {type: result[1], level: result[2], title: parsedxml.items[0].title } )
	  }
	  
	  if (this.config.debug === 1) {
	  console.log("Content") ;
	  console.log(parsedxml.items[0].content) ;
	  console.log ("Alarm: ") ;
	  console.log(alarm) ;
	  }
	  
	  return alarm ;
  }

});
