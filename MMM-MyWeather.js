/*********************************

  Magic Mirror Module: 
  MMM-MyWeather
  By Martin Kooij (github user "martinkooij")
  using weatherbits API
  
  Fork of MMM-MyWeather
  By Jeff Clarke

  Fork of MMM-WunderGround
  By RedNax
  https://github.com/RedNax67/MMM-WunderGround

  MIT Licensed
 
*********************************/

Module.register("MMM-MyWeather", {

  // Default module config.
  defaults: {
    apikey: "",
    len: "40.712778",
	lon: "-74.005833",
    currentweather: 1,
    currentweatherdetails: 1,
    forecasttable: 1,
    forecasttableheadertext: "Forecast",
    forecasttablecolumnheadericons: 1,
    coloricon: false,
    units: config.units,
    windunits: "bft", // choose from mph, kph, bft
    updateInterval: 10 * 60 * 1000, // every 10 minutes
    animationSpeed: 1000,
    timeFormat: "h a",
    lang: config.language,
    showWindDirection: true,
    fade: true,
    fadePoint: 0.25, // Start on 1/4th of the list.
    tz: "",
    fcdaycount: "5",
    fcdaystart: "0",
    daily: "1",
    hourly: "0",
    hourlyinterval: "3",
    hourlycount: "2",
    fctext: "1",
    alerttime: 5000,
    roundTmpDecs: 1,
    UseCardinals: 0,
    layout: "vertical",
    sysstat: 0,
    scaletxt: 1,
    iconset: "VCloudsWeatherIcons",
		debug: 0,
		socknot: "GET_WEATHERBIT",
		sockrcv: "WEATHERBIT",
    enableCompliments: 0,
    itemsPerRow: 4,

    retryDelay: 2500,

    apiBase: "http://api.weatherbit.io/v2.0",
	alarmUrl: null,
	showAlarmText: 1,
    iconAlarmArray: [
			"Weather Alarm(s)",
			"Wind",
			"Snow/Ice",
			"Thunderstorms",	
			"Fog",
			"Extreme high temperature",
			"Extreme low temperature",
			"Coastal Threat",
			"Forestfire",
			"Avalanches",
			"Rain",
			"Rain",
			"Flooding",
			"Rain & Flooding"
			],
	 
    iconTableDay: {
      "chanceflurries": "wi-day-snow-wind",
      "chancerain": "wi-day-showers",
      "chancesleet": "wi-day-sleet",
      "chancesnow": "wi-day-snow",
      "chancetstorms": "wi-day-storm-showers",
      "clear": "wi-day-sunny",
      "cloudy": "wi-cloud",
      "flurries": "wi-snow-wind",
      "fog": "wi-fog",
      "haze": "wi-day-haze",
      "hazy": "wi-day-haze",
      "mostlycloudy": "wi-cloudy",
      "mostlysunny": "wi-day-sunny-overcast",
      "partlycloudy": "wi-day-cloudy",
      "partlysunny": "wi-day-cloudy-high",
      "rain": "wi-rain",
      "sleet": "wi-sleet",
      "snow": "wi-snow",
      "tstorms": "wi-thunderstorm"
    },

    iconTableNight: {
      "chanceflurries": "wi-night-snow-wind",
      "chancerain": "wi-night-showers",
      "chancesleet": "wi-night-sleet",
      "chancesnow": "wi-night-alt-snow",
      "chancetstorms": "wi-night-alt-storm-showers",
      "clear": "wi-night-clear",
      "cloudy": "wi-night-alt-cloudy",
      "flurries": "wi-night-alt-snow-wind",
      "fog": "wi-night-fog",
      "haze": "wi-night-alt-cloudy-windy",
      "hazy": "wi-night-alt-cloudy-windy",
      "mostlycloudy": "wi-night-alt-cloudy",
      "mostlysunny": "wi-night-alt-partly-cloudy",
      "partlycloudy": "wi-night-alt-partly-cloudy",
      "partlysunny": "wi-night-alt-partly-cloudy",
      "rain": "wi-night-alt-rain",
      "sleet": "wi-night-alt-sleet",
      "snow": "wi-night-alt-snow",
      "tstorms": "wi-night-alt-thunderstorm"
    },
    
    iconTableCompliments: {
      "chanceflurries": "13",
      "chancerain": "10",
      "chancesleet": "13",
      "chancesnow": "13",
      "chancetstorms": "11",
      "clear": "01",
      "cloudy": "02",
      "flurries": "13",
      "fog": "50",
      "haze": "50",
      "hazy": "50",
      "mostlycloudy": "03",
      "mostlysunny": "02",
      "partlycloudy": "02",
      "partlysunny": "02",
      "rain": "10",
      "sleet": "13",
      "snow": "13",
      "tstorms": "11"
    }
	
   },

   wbCode2TextTable:  {
	"20": "tstorms",
	"23": "tstorms",
	"30": "chancerain",
	"50": "rain",
	"51": "rain",
	"52": "rain",
	"60": "snow",
	"61": "sleet",
	"62": "fulrries",
	"63": "flurries",
    "70": "fog",
	"71": "fog",
	"71": "haze",
	"73": "fog",
	"74": "fog",
	"75": "fog",
	"800": "clear",
	"801": "mostlysunny",
	"802": "partlysunny",
	"803": "mostlycloudy",
	"804": "cloudy",
	"90": "chancerain"
	},
	
	
	

  // Define required translations.
  getTranslations: function() {
    return {
      en: "translations/en.json",
      nl: "translations/nl.json",
      de: "translations/de.json",
      dl: "translations/de.json",
      fr: "translations/fr.json",
      pl: "translations/pl.json"
    };
  },

  // Define required scripts.
  getScripts: function() {
    return ["moment.js"];
  },

  // Define required scripts.
  getStyles: function() {
    return ["weather-icons.css", "weather-icons-wind.css",
      "MMM-MyWeather.css"
    ];
  },

  // Define start sequence.
  start: function() {
    Log.info("Starting module: " + this.name);

    // Set locale.
    moment.locale(config.language);

    this.forecast = [];
    this.hourlyforecast = [];
    this.loaded = false;
    this.error = false;
    this.errorDescription = "";
    this.getWeatherbit();
    this.updateTimer = null;
    this.haveforecast = 0;
  },

  getWeatherbit: function() {
    if ( this.config.debug === 1 ) {
			Log.info("WunderGround: Getting weather.");
		}
    this.sendSocketNotification(this.config.socknot, this.config);
  },

  // Override dom generator.
  getDom: function() {
    var wrapper = document.createElement("div");
    var f;
    var forecast;
    var iconCell;
    var icon;
    var maxTempCell;
    var minTempCell;
    var popCell;
    var mmCell;
    var hourCell;
    var dayCell;
    var startingPoint;
    var currentStep;
    var steps;

    
    if (this.config.apikey === "") {
      wrapper.innerHTML = this.translate("APIKEY") + this.name + ".";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (this.error) {
      wrapper.innerHTML = "Error: " + this.errorDescription;
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    if (this.config.currentweather === 1) {

      var small = document.createElement("div");
      small.className = "normal medium";

      var spacer = document.createElement("span");
      spacer.innerHTML = "&nbsp;";


      if (this.config.currentweatherdetails === 1) { 
        var table_sitrep = document.createElement("table");

        var row_sitrep = document.createElement("tr");


        var windIcon = document.createElement("td");
        if (this.config.windunits == "mph") {
          windIcon.innerHTML = this.windSpeedMph + " mph";
        } else if (this.config.windunits == "kph") {
          windIcon.innerHTML = this.windSpeedKph + " km/h";
        } else {
          windIcon.className = "wi " + this.windSpeed;
        }
        row_sitrep.appendChild(windIcon);
        row_sitrep.className = "pop";

        var windDirectionIcon = document.createElement("td");
        if (this.config.UseCardinals === 0) {
          windDirectionIcon.className = "wi wi-wind " + this.windDirection;
          windDirectionIcon.innerHTML = "&nbsp;";
        } else {
          windDirectionIcon.innerHTML = this.windDirectionTxt;
        }
		
//		Log.log("WIND: ") ;
//		Log.log(windDirectionIcon) ;
		
        row_sitrep.appendChild(windDirectionIcon);

        var HumidityIcon = document.createElement("td");
        HumidityIcon.className = "wi wi-humidity lpad";
        row_sitrep.appendChild(HumidityIcon);

        var HumidityTxt = document.createElement("td");
        HumidityTxt.innerHTML = this.Humidity + "&nbsp;";
        HumidityTxt.className = "vcen left";
        row_sitrep.appendChild(HumidityTxt);

        var sunriseSunsetIcon = document.createElement("td");
        sunriseSunsetIcon.className = "wi " + this.sunriseSunsetIcon;
        row_sitrep.appendChild(sunriseSunsetIcon);

        var sunriseSunsetTxt = document.createElement("td");
        sunriseSunsetTxt.innerHTML = this.sunriseSunsetTime;
        sunriseSunsetTxt.className = "vcen left";
        row_sitrep.appendChild(sunriseSunsetTxt);

        var moonPhaseIcon = document.createElement("td");
        moonPhaseIcon.innerHTML = this.moonPhaseIcon;
        row_sitrep.appendChild(moonPhaseIcon);

        table_sitrep.appendChild(row_sitrep);
        small.appendChild(table_sitrep);
      }

      var large = document.createElement("div");
      large.className = "large light";

      var weatherIcon = document.createElement("span");
      if (this.config.coloricon) {
          weatherIcon.innerHTML = this.weatherTypeTxt;
      } else {
          weatherIcon.className = "wi " + this.weatherType;
      }
      weatherIcon.classList.add("currentWeatherIconWrapper");

      var temperature = document.createElement("span");
      temperature.className = "bright";
      temperature.innerHTML = " " + this.temperature + "&deg;";
      large.appendChild(weatherIcon);
      large.appendChild(temperature);

      wrapper.appendChild(small);
      wrapper.appendChild(large);

    }

    // Forecast table
    if (this.config.forecasttable === 1) {

      var header = document.createElement("header");
      header.classList.add("module-header");
      header.innerHTML = this.config.forecasttableheadertext;
      wrapper.appendChild(header);


      var table = document.createElement("table");
      table.className = "small";
      // table.setAttribute("width", "25%");


      if (this.config.layout == "vertical") {

        // vertical layout
        table.classList.add("vertical");

        var row = document.createElement("tr");
        table.appendChild(row);

        if (this.config.fctext == 1) {
          var forecastTextCell = document.createElement("td");
		  
		  this.forecastText += this.alarmIcons.join(" &nbsp; &nbsp; ") ;
				
		  forecastTextCell.className = "forecastText";
          forecastTextCell.setAttribute("colSpan", "10");
          forecastTextCell.innerHTML = this.forecastText;
		  
          row.appendChild(forecastTextCell);
        }

        if (this.config.forecasttablecolumnheadericons === 1) {
          row = document.createElement("tr");

          var dayHeader = document.createElement("th");
          dayHeader.className = "day";
          dayHeader.innerHTML = "";
          row.appendChild(dayHeader);

          var iconHeader = document.createElement("th");
          iconHeader.className = "tableheader icon";
          iconHeader.innerHTML = "";
          row.appendChild(iconHeader);

          var maxtempHeader = document.createElement("th");
          maxtempHeader.className = "align-center bright tableheader";
          row.appendChild(maxtempHeader);

          var maxtempicon = document.createElement("span");
          maxtempicon.className = "wi wi-thermometer";
          maxtempHeader.appendChild(maxtempicon);


          var mintempHeader = document.createElement("th");
          mintempHeader.className = "align-center bright tableheader";
          row.appendChild(mintempHeader);

          var mintempicon = document.createElement("span");
          mintempicon.className = "wi wi-thermometer-exterior";
          mintempHeader.appendChild(mintempicon);


          var popiconHeader = document.createElement("th");
          popiconHeader.className = "align-center bright tableheader";
          popiconHeader.setAttribute("colSpan", "10");
          row.appendChild(popiconHeader);

          var popicon = document.createElement("span");
          popicon.className = "wi wi-umbrella";
          popicon.setAttribute("colSpan", "10");
          popiconHeader.appendChild(popicon);

          table.appendChild(row);
        }

        if (this.config.hourly == 1) {
          // for (f in this.forecast) {
            // forecast = this.hourlyforecast[f * this.config.hourlyinterval];

          var counter = 0;
		  for (var i = 0; i < this.hourlyforecast.length; i++) {
            forecast = this.hourlyforecast[i];

            row = document.createElement("tr");
            table.appendChild(row);

            hourCell = document.createElement("td");
            hourCell.className = "hourv";
            // var amPm = "am";
            // var timeSplit = forecast.hour.split(":");
            // var hourVal = Number(timeSplit[0]);
            // if (hourVal == 12) {
            //   amPm = "pm";
            // } else if (hourVal > 12) {
            //   hourVal = hourVal - 12;
            //   amPm = "pm";
            // } else if (hourVal == 0) {
            //   hourVal = 12;                      
            // }
            // hourCell.innerHTML = hourVal + " " + amPm;
            hourCell.innerHTML = moment(forecast.hour, "HH:mm").format(this.config.timeFormat);
            row.appendChild(hourCell);

            iconCell = document.createElement("td");
            iconCell.className = "align-center bright weather-icon";
            row.appendChild(iconCell);

            icon = document.createElement("span");
            if (this.config.coloricon) {
              icon.innerHTML = forecast.icon_url;
            } else {
              icon.className = "wi " + forecast.icon;
            }
            iconCell.appendChild(icon);

            maxTempCell = document.createElement("td");
            maxTempCell.innerHTML = forecast.maxTemp + "&deg;";
            maxTempCell.className = "align-right hourly-temp";
            row.appendChild(maxTempCell);

            minTempCell = document.createElement("td");
            minTempCell.innerHTML = "&nbsp;";
            row.appendChild(minTempCell);

            popCell = document.createElement("td");
            popCell.innerHTML = forecast.pop + "%";
            popCell.className = "align-right pop";
            row.appendChild(popCell);

            mmCell = document.createElement("td");
            mmCell.innerHTML = forecast.mm;
            mmCell.className = "align-right mm";
            row.appendChild(mmCell);

            counter = counter + 1;
            if (counter == Number(this.config.hourlycount)) {
              break;
            }
    	
    				if (this.config.daily == 0) {
    				
    					if (this.config.fade && this.config.fadePoint < 1) {
    						if (this.config.fadePoint < 0) {
    							this.config.fadePoint = 0;
    						}
    						startingPoint = this.forecast.length * this.config.fadePoint;
    						steps = this.forecast.length - startingPoint;
    						if (f >= startingPoint) {
    							currentStep = f - startingPoint;
    							row.style.opacity = 1 - (1 / steps * currentStep);
    						}
    					}
    				}

          }
        }


        if (this.config.daily == 1) {
    	    for (f in this.forecast) {
    				forecast = this.forecast[f];

    				row = document.createElement("tr");
    				table.appendChild(row);

    				dayCell = document.createElement("td");
    				dayCell.className = "day";
    				dayCell.innerHTML = forecast.day;
    				row.appendChild(dayCell);

    				iconCell = document.createElement("td");
    				iconCell.className = "align-center bright weather-icon";
    				row.appendChild(iconCell);

    				icon = document.createElement("span");
    				if (this.config.coloricon) {
    					icon.innerHTML = forecast.icon_url;
    				} else {
    					icon.className = "wi " + forecast.icon;
    				}
    				iconCell.appendChild(icon);

    				maxTempCell = document.createElement("td");
    				maxTempCell.innerHTML = forecast.maxTemp + "&deg;";
    				maxTempCell.className = "align-right max-temp";
    				row.appendChild(maxTempCell);

    				minTempCell = document.createElement("td");
    				minTempCell.innerHTML = forecast.minTemp + "&deg;";
    				minTempCell.className = "align-right min-temp";
    				row.appendChild(minTempCell);

    				popCell = document.createElement("td");
    				popCell.innerHTML = forecast.pop + "%";
    				popCell.className = "align-right pop";
    				row.appendChild(popCell);

    				mmCell = document.createElement("td");
    				mmCell.innerHTML = forecast.mm;
    				mmCell.className = "align-right mm";
    				row.appendChild(mmCell);

    				if (this.config.fade && this.config.fadePoint < 1) {
    					if (this.config.fadePoint < 0) {
    						this.config.fadePoint = 0;
    					}
    					startingPoint = this.forecast.length * this.config.fadePoint;
    					steps = this.forecast.length - startingPoint;
    					if (f >= startingPoint) {
    						currentStep = f - startingPoint;
    						row.style.opacity = 1 - (1 / steps * currentStep);
    					}
    				}
    		  }
        }

        wrapper.appendChild(table);

      } else {

        // horizontal layout


        var fctable = document.createElement("div");
        // var divider = document.createElement("hr");
        // divider.className = "hrDivider";
        // fctable.appendChild(divider);

        if (this.config.fctext == 1) {
            // var row = document.createElement("tr");
            var forecastTextCell = document.createElement("div");
			
		    this.forecastText += this.alarmIcons.join(" &nbsp; &nbsp; ") ;
				
			forecastTextCell.className = "forecastText";
            // forecastTextCell.setAttribute("colSpan", "10");
            forecastTextCell.innerHTML = this.forecastText;

            fctable.appendChild(forecastTextCell);
            // table.appendChild(row);
            // fctable.appendChild(table);
            // fctable.appendChild(divider.cloneNode(true));
        }

        table = document.createElement("table");
        table.className = "small";
        // table.setAttribute("width", "25%");
        table.classList.add("horizontal");

        if (this.config.sysstat == 1) {

          row_mem = document.createElement("tr");
          row_storage = document.createElement("tr");
          row_stemp = document.createElement("tr");
          row_wifi = document.createElement("tr");

          iconCell = document.createElement("td");
          iconCell.className = "align-right bright weather-icon";

          icon = document.createElement("span");
          icon.className = "wi wi-thermometer";

          iconCell.appendChild(icon);
          row_stemp.appendChild(iconCell);

          sysTempCell = document.createElement("td");
          sysTempCell.innerHTML = this.systemp;
          sysTempCell.className = "align-left";
          row_stemp.appendChild(sysTempCell);

          iconCell = document.createElement("td");
          iconCell.className = "align-right bright weather-icon";
          icon = document.createElement("span");

          icon.className = "fa fa-wifi ";
          iconCell.appendChild(icon);
          row_stemp.appendChild(iconCell);

          WifiCell = document.createElement("td");
          WifiCell.innerHTML = this.wifiap + " @ " + this.wifistrength + "%";
          WifiCell.className = "align-left";

          row_stemp.appendChild(WifiCell);
          table.appendChild(row_stemp);

          FillCell = document.createElement("td");
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = "Size";
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = "Used";
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = "Free";
          row_mem.appendChild(FillCell);
          table.appendChild(row_mem);

          row_mem = document.createElement("tr");
          FillCell = document.createElement("td");
          FillCell.innerHTML = "Memory";
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = this.mem_size;
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = this.mem_used;
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = this.mem_free;
          row_mem.appendChild(FillCell);
          table.appendChild(row_mem);

          row_mem = document.createElement("tr");
          FillCell = document.createElement("td");
          FillCell.innerHTML = "Storage";
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = this.storage_size;
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = this.storage_used;
          row_mem.appendChild(FillCell);
          FillCell = document.createElement("td");
          FillCell.innerHTML = this.storage_free;
          row_mem.appendChild(FillCell);
          table.appendChild(row_mem);

          fctable.appendChild(table);
          fctable.appendChild(document.createElement("hr"));

          table = document.createElement("table");
          table.className = "small";
          // table.setAttribute("width", "25%");

        }

        if (this.config.hourly == 1) {

          row_time = document.createElement("tr");
          row_icon = document.createElement("tr");
          row_temp = document.createElement("tr");
          row_pop = document.createElement("tr");
          row_wind = document.createElement("tr");


          // for (f in this.forecast) {
          //   forecast = this.hourlyforecast[f * Number(this.config.hourlyinterval)]; always 3 hours

          var counter = 0;
          for (var i = 0; i < this.hourlyforecast.length; i++) {
            forecast = this.hourlyforecast[i];

            hourCell = document.createElement("td");
            hourCell.className = "hour";
            hourCell.innerHTML = moment(forecast.hour, "HH:mm").format(this.config.timeFormat);
            row_time.appendChild(hourCell);


            iconCell = document.createElement("td");
            iconCell.className = "align-center bright weather-icon";
            icon = document.createElement("span");
            if (this.config.coloricon) {
              icon.innerHTML = forecast.icon_url;
            } else {
              icon.className = "wi " + forecast.icon;
            }
            iconCell.appendChild(icon);
            row_icon.appendChild(iconCell);

            maxTempCell = document.createElement("td");
            maxTempCell.innerHTML = forecast.maxTemp + "&deg;";
            maxTempCell.className = "temp hourly-temp";
            row_temp.appendChild(maxTempCell);

            mmCell = document.createElement("td");

            if (this.config.units == "metric") {
              mmCell.innerHTML = forecast.pop + "% / " + forecast.mm;
              mmCell.className = "prec";
            } else {
              mmCell.innerHTML = forecast.pop + "% / " + forecast.mm;
              mmCell.className = "prec";
            }

            row_pop.appendChild(mmCell);

            var windDirectionIcon = document.createElement("td");
            windDirectionIcon.className = "center";

            windDirectionIconCell = document.createElement("span");
            if (this.config.windunits == "mph") {
              windDirectionIconCell.innerHTML = forecast.windSpdMph + " mph";
            } else if (this.config.windunits == "kph") {
              windDirectionIconCell.innerHTML = forecast.windSpdKph + " km/h";
            } else {
              windDirectionIconCell.className = "wi " + forecast.windSpd;
            }
            windDirectionIcon.appendChild(windDirectionIconCell);

            // var spacer = document.createElement("");
            // spacer.innerHTML = "&nbsp;&nbsp;";
            // windDirectionIcon.appendChild(spacer);


            windDirectionIconCell = document.createElement("span");


            if (this.config.UseCardinals === 0) {

              windDirectionIconCell.classList.add("icon-container");
              var windDirectionIconGlyph = document.createElement("span");
              windDirectionIconGlyph.className = "wi wi-wind " + forecast.windDir;
              windDirectionIconCell.appendChild(windDirectionIconGlyph);

            } else {
              // windDirectionIconCell.className = "smaller";
              windDirectionIconCell.innerHTML = "&nbsp;" + forecast.windDirImp;
            }
            windDirectionIcon.appendChild(windDirectionIconCell);

            row_wind.appendChild(windDirectionIcon);




            counter = counter + 1;
 
            if (counter == Number(this.config.hourlycount)) {
              table.appendChild(row_time);
              table.appendChild(row_icon);
              table.appendChild(row_temp);
              table.appendChild(row_pop);
              table.appendChild(row_wind);
              fctable.appendChild(table);
              // fctable.appendChild(divider.cloneNode(true));
              break;

            } else if (counter % this.config.itemsPerRow === 0) {

              table.appendChild(row_time);
              table.appendChild(row_icon);
              table.appendChild(row_temp);
              table.appendChild(row_pop);
              table.appendChild(row_wind);
              row_time = document.createElement("tr");
              row_icon = document.createElement("tr");
              row_temp = document.createElement("tr");
              row_pop = document.createElement("tr");
              row_wind = document.createElement("tr");
            }


          }



        }

        table = document.createElement("table");
        table.className = "small";
        // table.setAttribute("width", "25%");
        table.classList.add("horizontal");


        row_time = document.createElement("tr");
        row_icon = document.createElement("tr");
        row_temp = document.createElement("tr");
        row_pop = document.createElement("tr");
        row_wind = document.createElement("tr");


    		if (this.config.daily == 1) {

          counter = 0;

    			for (f in this.forecast) {
    				forecast = this.forecast[f];

    				dayCell = document.createElement("td");
    				dayCell.className = "day";
    				dayCell.innerHTML = forecast.day;
    				row_time.appendChild(dayCell);

    				iconCell = document.createElement("td");
    				iconCell.className = "align-center bright weather-icon";

    				icon = document.createElement("span");
    				if (this.config.coloricon) {
    					icon.innerHTML = forecast.icon_url;
    				} else {
    					icon.className = "wi " + forecast.icon;
    				}
    				iconCell.appendChild(icon);

    				row_icon.appendChild(iconCell);

    				maxTempCell = document.createElement("td");
    				maxTempCell.innerHTML = "<span class='max-temp'>" + forecast.maxTemp + "&deg;</span> / " + "<span class='min-temp'>" + forecast.minTemp + "&deg;</span>";
    				maxTempCell.className = "temp";
    				row_temp.appendChild(maxTempCell);

    				mmCell = document.createElement("td");
    				if (this.config.units == "metric") {
    					mmCell.innerHTML = forecast.pop + "% / " + forecast.mm;
    					mmCell.className = "prec";
    				} else {
    					mmCell.innerHTML = forecast.pop + "% / " + forecast.mm;
    					mmCell.className = "prec";
    				}

    				row_pop.appendChild(mmCell);

    				windDirectionIcon = document.createElement("td");
    				windDirectionIcon.className = "center";
    				windDirectionIconCell = document.createElement("span");
    				if (this.config.windunits == "mph") {
    					windDirectionIconCell.innerHTML = forecast.windSpdMph + " mph";
    				} else if (this.config.windunits == "kph") {
              windDirectionIconCell.innerHTML = forecast.windSpdKph + " km/h";
            } else {
    					windDirectionIconCell.className = "wi " + forecast.windSpd;
    				}
    				windDirectionIcon.appendChild(windDirectionIconCell);

    				// spacer = document.createElement("i");
    				// spacer.innerHTML = "&nbsp;&nbsp;";
    				// windDirectionIcon.appendChild(spacer);

    				windDirectionIconCell = document.createElement("span");

            if (this.config.UseCardinals === 0) {
              windDirectionIconCell.classList.add("icon-container");
              var windDirectionIconGlyph = document.createElement("span");
    					windDirectionIconGlyph.className = "wi wi-wind " + forecast.windDir;
              windDirectionIconCell.appendChild(windDirectionIconGlyph);
    				} else {
    					// windDirectionIconCell.className = "smaller";
    					windDirectionIconCell.innerHTML = "&nbsp;" + forecast.windDirImp;
    				}
    				windDirectionIcon.appendChild(windDirectionIconCell);

    				row_wind.appendChild(windDirectionIcon);

    				counter = counter + 1;
            if (counter == this.config.fcdaycount) {
        			table.appendChild(row_time);
        			table.appendChild(row_icon);
        			table.appendChild(row_temp);
        			table.appendChild(row_pop);
        			table.appendChild(row_wind);
              break;
            } else if (counter % this.config.itemsPerRow === 0) {
              table.appendChild(row_time);
              table.appendChild(row_icon);
              table.appendChild(row_temp);
              table.appendChild(row_pop);
              table.appendChild(row_wind);
              row_time = document.createElement("tr");
              row_icon = document.createElement("tr");
              row_temp = document.createElement("tr");
              row_pop = document.createElement("tr");
              row_wind = document.createElement("tr");
            }

          }

    			fctable.appendChild(table);
    			wrapper.appendChild(fctable);
    		}

      }

    }

    return wrapper;

  },


  /* processWeather(data)
   * Uses the received data to set the various values.
   *
   * argument data object - Weather information received form openweather.org.
   */

  processWeather: function(data) {

    this.haveforecast = 1;
      this.error = false;
      var forecast;
      var i;
      var count;
      var iconTable = this.config.iconTableDay;
      this.alerttext = "";
      this.alertmsg = "";
	  const waxing = Symbol("waxing") ;
	  const waning = Symbol("waning") ;
	  var moonDirection ;
	  var aspectofMoon ;
	  var latitude ;
	  this.alarmLevel = 0 ;

      var now = new Date();
	  
//	  Log.log(data.current.data[0].country_code)
	  
	  this.sendSocketNotification("COUNTRY", data.current.data[0].country_code );

      var sunrise = new Date(data.daily.data[0].sunrise_ts * 1000);
//      this.sunrhour = Number(data.current.data[0].sunrise.substr(0,2));
//      sunrise.setHours(data.current.data[0].sunrise.substr(0,2));
//      sunrise.setMinutes(data.current.data[0].sunrise.substr(3,2));
//      sunrise = moment.utc(data.current.data[0].sunrise) ;
	  
      var sunset = new Date(data.daily.data[0].sunset_ts * 1000);
//      this.sunshour = Number(data.current.data[0].sunset.substr(0,2));
//      sunset.setHours(data.current.data[0].sunset.substr(0,2));
//      sunset.setMinutes(data.current.data[0].sunset.substr(3,2));
//      sunset = moment.utc(data.current.data[0].sunset) ;
      // The moment().format("h") method has a bug on the Raspberry Pi.
      // So we need to generate the timestring manually.
      // See issue: https://github.com/MichMich/MagicMirror/issues/181
	  
	  if (this.config.debug === 1) { 
	  Log.log("Sunrise: "+ moment(sunrise).format() );
	  Log.log("Sunset: "+ moment(sunset).format() );
	  Log.log("Now: "+ moment(now).format() );
	  Log.log("Inbetween = " + (sunrise < now && sunset > now)) ;
	  }

      var sunriseSunsetDateObject = (sunrise < now && sunset > now) ? sunset : sunrise;
        
      if (this.config.enableCompliments === 1) {
        var complimentIconSuffix = (sunrise < now && sunset > now) ? "d" : "n";
        var complimentIcon = '{"data":{"weather":[{"icon":"' + this.config.iconTableCompliments[this.wbCode2Text(data.current.data[0].weather.code)] + complimentIconSuffix + '"}]}}';
        var complimentIconJson = JSON.parse(complimentIcon);
        this.sendNotification("CURRENTWEATHER_DATA", complimentIconJson);
      }
        
      var timeString;
      if (this.config.timeFormat.indexOf("H") != -1 || this.config.timeFormat.indexOf("k") != -1) {
        timeString = moment(sunriseSunsetDateObject).format("HH:mm");
      } else {
        timeString = moment(sunriseSunsetDateObject).format("h:mm a");
      }

	  
      this.sunriseSunsetTime = timeString;
      this.sunriseSunsetIcon = (sunrise < now && sunset > now) ? "wi-sunset" : "wi-sunrise";
      this.iconTable = (sunrise < now && sunset > now) ? this.config.iconTableDay : this.config.iconTableNight;


      this.weatherType = this.iconTable[this.wbCode2Text(data.current.data[0].weather.code)];
        
      //Log.info("observation logo " + this.weatherType)
      this.windDirection = this.deg2Cardinal(data.current.data[0].wind_dir);
      this.windDirectionTxt = data.current.data[0].wind_cdir;
      this.Humidity = data.current.data[0].rh;
      this.windSpeed = "wi-wind-beaufort-" + this.ms2Beaufort(data.current.data[0].wind_spd * 3.6); // in m/s from API
      this.windSpeedKph = Math.round(data.current.data[0].wind_spd * 3.6) ;
      this.windSpeedMph = Math.round(data.current.data[0].wind_spd * 2.237) ;
	  aspectofMoon = data.daily.data[0].moon_phase ;
	  moonDirection = (data.daily.data[0].moon_phase - data.daily.data[1].moon_phase < 0)? waxing : waning ;
	  latitude = data.current.data[0].lat ;
      this.moonPhaseIcon = "<img class='moonPhaseIcon' " +
	       "src='https://www.timeanddate.com/scripts/moon.php?i=" + 
		   aspectofMoon +
		   "&p=" +
		   (((latitude>=0 && moonDirection == waxing) || (latitude < 0 && moondirection == waning) )? "0" : "3.14") +
		   "&r=0.833' >" ;
 
      if (this.config.units == "metric") {
        this.temperature = data.current.data[0].temp ;
      } else {
        this.temperature = data.current.data[0].temp * 1.8 + 32 ;
      }
	  
	  var fc_text = 
		data.current.data[0].city_name + ". " +
		this.translate("TODAY") + ": " + 
		data.daily.data[0].weather.description + ", "+
		this.translate("TOMORROW").toLowerCase() + ": " +
		data.daily.data[1].weather.description + "." ;
	  
	  
	  this.alarmIcons = [] ;
	  if (data.alarm != null) {
		  var welement ;
		  for (let w of data.alarm) {
			  if (w.level >=2 ) {
				welement = ' <img border="1" src="https://www.meteoalarm.eu/documents/rss/wflag-l' + w.level +
				"-t" + w.type + '.jpg" >' ;
				if (this.config.showAlarmText) {
					welement += ("&nbsp;" + this.config.iconAlarmArray[w.type]) ;
				}
				this.alarmIcons.push(welement) ;
			  }
		  }
	  }
	  
	  this.forecastText = fc_text;
	  
	  if (this.alarmIcons.length != 0) { 
			this.alarmIcons[0] = 
				"<br />" + 
				this.config.iconAlarmArray[0] + 
				" " +
				data.alarm[0].title + 
				": &nbsp; " +
				this.alarmIcons[0] ;
	  }
	  
//	  Log.log(this.alarmIcons) ;

      this.temperature = this.roundValue(this.temperature);
      this.weatherTypeTxt = "<img src='./modules/MMM-MyWeather/img/" + this.config.iconset + "/" +
          this.wbCode2Text(data.current.data[0].weather.code) +
          ".png' style='vertical-align:middle' class='currentWeatherIcon'>";

      this.forecast = [];
      for (i = this.config.fcdaystart, count = data.daily.data.length; i < Number(this.config.fcdaycount) + 1; i++) {

        forecast = data.daily.data[i];

        if (this.config.units == "metric") {
          this.tmaxTemp = forecast.max_temp;
          this.tminTemp = forecast.min_temp;
          if (forecast.snow > 0) {
            this.tmm = Math.round(forecast.snow * 10) / 100 + "cm";
          } else {
            this.tmm = Math.round(forecast.precip * 10) / 10 + "mm";
          }
        } else {
          this.tmaxTemp = forecast.max_temp * 1.8 + 32;
          this.tminTemp = forecast.min_temp * 1.8 + 32;
          if (forecast.snow > 0) {
            this.tmm = Math.round(forecast.snow / 2.54) / 10 + "in";
          } else {
            this.tmm = Math.round(forecast.precip / 2.54) / 10 + "in";
          }
        }

        this.maxTemp = this.roundValue(this.tmaxTemp);
        this.minTemp = this.roundValue(this.tminTemp);

        this.windDir = this.deg2Cardinal(forecast.wind_dir);
        this.windDirImp = forecast.wind_cdir;
        this.windSpd = "wi-wind-beaufort-" + this.ms2Beaufort(forecast.wind_spd*3.6);
        this.windSpdKph = Math.round(forecast.wind_spd * 3.6);
        this.windSpdMph = Math.round(forecast.wind_spd * 2.24);

        this.icon_url = "<img style='max-height:100%; max-width:100%; vertical-align:middle' src='./modules/MMM-MyWeather/img/" + 
						this.config.iconset + "/" +
						this.wbCode2Text(forecast.weather.code) + 
						".png' class='forecastWeatherIcon'>";

        this.forecast.push({
          day: moment(forecast.valid_date).format("ddd"),
          maxTemp: this.maxTemp,
          minTemp: this.minTemp,
          icon: this.config.iconTableDay[this.wbCode2Text(forecast.weather.code)],
          icon_url: this.icon_url,
          pop: forecast.pop,
          windDir: this.windDir,
          windDirImp: this.windDirImp,
          windSpd: this.windSpd,
          windSpdKph: this.windSpdKph,
          windSpdMph: this.windSpdMph,
          mm: this.tmm
        });

      }

      if (this.config.hourly == 1) {
        this.hourlyforecast = [];
        for (i = 0 ; i < data.hourly.data.length ; i += 3) {  

          var hourlyforecast = data.hourly.data[i];

          if (this.config.units == "metric") {
            this.tmaxTemp = hourlyforecast.temp;
            this.tminTemp = hourlyforecast.app_temp;
            if (forecast.snow > 0) {
              this.tmm = Math.round(hourlyforecast.snow) / 10 + "cm";
            } else {
              this.tmm = Math.round(hourlyforecast.precip * 10 ) / 10+ "mm";
            }
            this.thour = moment(hourlyforecast.timestamp_local).format("HH:mm");
          } else {
            this.tmaxTemp = hourlyforecast.temp * 1.8 + 32;
            this.tminTemp = hourlyforecast.app_temp * 1.8 + 32;
            if (forecast.snow > 0) {
              this.tmm = Math.round(hourlyforecast.snow / 2.54) / 10 + "in";
            } else {
              this.tmm = Math.round(hourlyforecast.precip / 2.54) / 10 + "in";
            }
            this.thour = moment(hourlyforecast.timestamp_local).format("HH:mm");
          }

          this.tthour = Number(moment(hourlyforecast.timestamp_local).format("HH"));
          this.ForecastIcon = 
				(this.sunrhour < this.tthour && this.sunshour > this.tthour) ? 
				this.config.iconTableDay[this.wbCode2Text(hourlyforecast.weather.code)] : 
				this.config.iconTableNight[this.wbCode2Text(hourlyforecast.weather.code)];

          this.ForecastIconUrl = "<img style='max-height:100%; max-width:100%; vertical-align:middle' src='./modules/MMM-MyWeather/img/" + this.config.iconset + "/" +
            this.wbCode2Text(hourlyforecast.weather.code) + ".png' class='forecastWeatherIcon'>";

          this.windDir = this.deg2Cardinal(hourlyforecast.wind_dir);
          this.windDirImp = hourlyforecast.wind_cdir;
          this.windSpd = "wi-wind-beaufort-" + this.ms2Beaufort(hourlyforecast.wind_spd * 3.6);
          this.windSpdKph = hourlyforecast.wind_spd * 3.6;
          this.windSpdMph = hourlyforecast.wind_spd * 2.24;


          this.hourlyforecast.push({
            hour: this.thour,
            maxTemp: this.roundValue(this.tmaxTemp),
            minTemp: this.roundValue(this.tminTemp),
            icon: this.ForecastIcon,
            icon_url: this.ForecastIconUrl,
            pop: hourlyforecast.pop,
            windDir: this.windDir,
            windDirImp: this.windDirImp,
            windSpd: this.windSpd,
            windSpdKph: this.windSpdKph,
            windSpdMph: this.windSpdMph,
            mm: this.tmm
          });
        }
      }

      if ( this.config.debug === 1 ) {
		    Log.log(this.forecast);
			Log.log(this.hourlyforecast);
      }

      this.loaded = true;
      this.updateDom(this.config.animationSpeed);
  },


  /* ms2Beaufort(ms)
   * Converts m2 to beaufort (windspeed).
   *
   * argument ms number - Windspeed in m/s.
   *
   * return number - Windspeed in beaufort.
   */
  ms2Beaufort: function(kmh) {
    var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
    for (var beaufort in speeds) {
      var speed = speeds[beaufort];
      if (speed > kmh) {
        return beaufort;
      }
    }
    return 12;
  },

  wordwrap: function(str, width, brk) {

    brk = brk || "n";
    width = width || 75;


    if (!str) {
      return str;
    }

    var re = new RegExp(".{1," + width + "}(\\s|$)|\\ S+?(\\s|$)", "g");

    var wordwrapped = str.trim().match(RegExp(re));
    for (var i in wordwrapped) {
      wordwrapped[i] = wordwrapped[i].trim();
    }

    return wordwrapped.join(brk);

  },

  /* function(temperature)
   * Rounds a temperature to 1 decimal.
   *
   * argument temperature number - Temperature.
   *
   * return number - Rounded Temperature.
   */

  deg2Cardinal: function(deg) {
    if (deg > 11.25 && deg <= 33.75) {
      return "wi-from-nne";
    } else if (deg > 33.75 && deg <= 56.25) {
      return "wi-from-ne";
    } else if (deg > 56.25 && deg <= 78.75) {
      return "wi-from-ene";
    } else if (deg > 78.75 && deg <= 101.25) {
      return "wi-from-e";
    } else if (deg > 101.25 && deg <= 123.75) {
      return "wi-from-ese";
    } else if (deg > 123.75 && deg <= 146.25) {
      return "wi-from-se";
    } else if (deg > 146.25 && deg <= 168.75) {
      return "wi-from-sse";
    } else if (deg > 168.75 && deg <= 191.25) {
      return "wi-from-s";
    } else if (deg > 191.25 && deg <= 213.75) {
      return "wi-from-ssw";
    } else if (deg > 213.75 && deg <= 236.25) {
      return "wi-from-sw";
    } else if (deg > 236.25 && deg <= 258.75) {
      return "wi-from-wsw";
    } else if (deg > 258.75 && deg <= 281.25) {
      return "wi-from-w";
    } else if (deg > 281.25 && deg <= 303.75) {
      return "wi-from-wnw";
    } else if (deg > 303.75 && deg <= 326.25) {
      return "wi-from-nw";
    } else if (deg > 326.25 && deg <= 348.75) {
      return "wi-from-nnw";
    } else {
      return "wi-from-n";
    }
  },

  /* function(temperature)
   * Rounds a temperature to 1 decimal.
   *
   * argument temperature number - Temperature.
   *
   * return number - Rounded Temperature.
   */
  roundValue: function(temperature) {
    return parseFloat(temperature).toFixed(this.config.roundTmpDecs);
  },

  socketNotificationReceived: function(notification, payload) {
    var self = this;

    if ( this.config.debug === 1 ) {
	    Log.info('Wunderground received ' + notification);
    }

    if (notification === this.config.sockrcv) {
      if ( this.config.debug === 1 ) {
  			Log.info('received ' + this.config.sockrcv);
  			Log.info(payload);
	    }
      self.processWeather(payload);
    }

  },
  
  wbCode2Text: function(c) {
	  var ch = c.toString() ;
	  if (ch.substr(0,2) == "80") {
		  return this.wbCode2TextTable[ch] ;
	  } else {
		  return this.wbCode2TextTable[ch.substr(0,2)] ;
	  }
  }

});
