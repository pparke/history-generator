//define the graph and the elements different from the defaults.
var g2=new Graph();
g2.graph_width = 550;
g2.numOfPoints = 73;
g2.xAxisLabel = "Day";
g2.numOfPlots = 2;

g2.plotLabel[0] = "Incident Power"
g2.plotLabel[1] = "Power on the Horizontal"
g2.plotLabel[2] = "Module Power"
g2.legendx = 410;
g2.legendy = 15;
g2.legendWidth = 180;
g2.legendSpacing = 15;

g2.xUpper = 365;
g2.numOfxTicks = 12;
g2.numOfxNumerals = 12;
g2.yAxisLabel = "direct radiation (kWh/m" + String.fromCharCode(178) + "/day)"
g2.yUpper = 18;
g2.yprecision = 1;
g2.numOfyTicks = 18;
g2.numOfyNumerals = 9;
g2.legendShow = true;
graph_calcs(g2);
var canvasModuleIncident = document.getElementById("canvasModuleIncident");
var ctxModuleIncident = canvasModuleIncident.getContext("2d");
latitude2 = 0.0;; //slider1
arrayTilt = 45.0

jQuery(document).ready(function(){jQuery("#sliderLatitude2").slider({ min:-90, max:90, value:latitude2, step: 1,
    slide:function(event,ui){
		latitude2=ui.value;
		graphModuleIncident();
    }
});});

jQuery(document).ready(function(){jQuery("#sliderArrayTilt").slider({ min:0, max:80, value:arrayTilt, step: 1,
    slide:function(event,ui){
		arrayTilt=ui.value;
		graphModuleIncident();
    }
});});

function graphModuleIncident(){

	if (latitude2 >= 0){
	jQuery( "#sliderLatitude2-result" ).html( "Latitude: " + latitude2 + "&deg; North");}
	else {
	jQuery( "#sliderLatitude2-result" ).html( "Latitude: " + -latitude2 + "&deg; South");
	}
	jQuery( "#sliderArrayTilt-result" ).html( "Array Tilt: " + arrayTilt + "&deg;");

	lat = ToRad(latitude2);

	//jQuery( "#sunrise-sunset" ).html( "Sunrise: " + HoursMinutes(sunrise) + " Sunset: " + HoursMinutes(sunset));
	for (i = 0; i < g2.numOfPoints; i++){
		jDay = i * 5;
		g2.xd[0][i] = jDay
		g2.xd[1][i] = jDay
		g2.xd[2][i] = jDay
		dec = ToRad(Declination(jDay))

		x = - (Math.sin(lat) * Math.sin(dec));
		x = x / (Math.cos(lat) * Math.cos(dec));
		if (x > 1.0)
			x = 1.0;
		if (x < -1.0)
			x = -1.0;
		f = Math.acos(x);
		H = ToDeg(f * 1 / 15.0);
		sunrise = 12.0 - H;
		sunset = 12.0 + H;

		Stot = 0.0;
		if (H > 0){
			for (t = sunrise; t <= sunset; t++)
				{
					 am = AM(t, jDay, lat);
					 x1 = Math.pow(0.7, am);
					Stot = Stot + 1.353 * Math.pow(x1, 0.678);
				}
				elevation = Math.asin(Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat));
				if (lat < 0)
					elevation = ToRad(90) + lat - dec;
				else
					elevation = ToRad(90) - lat + dec;
			}
			g2.yd[0][i] = Stot
			g2.yd[1][i] = Stot*Math.sin(ToRad(90) - lat + dec);

			g2.yd[2][i] = Stot*Math.sin(ToRad(arrayTilt) + elevation);

	}

	drawGraph(ctxModuleIncident,g2);

	//add extra drawings here.
}
function showDataModuleIncident(){
		clipData = "";
		clipData = "PVCDROM Graph Data Sunlight Hours\n";
		clipData += "Select, Copy and Paste into Excel etc.\n";
		clipData += "http://www.pveducation.org/pvcdrom\n";
		clipData += "Latitude (degrees, South is negative)\t"+latitude2+"\n";
		clipData += "Array Tilt (degrees)\t"+arrayTilt+"\n";
		clipData += "Day\tIncident Power (kWh/m2/day)\tPower on the Horizontal (kWh/m2/day)\Module Power (kWh/m2/day)\n";
		for (i = 0; i < g2.numOfPoints; i++){
			clipData += g2.xd[0][i]+"\t"+g2.yd[0][i]+"\t"+g2.yd[1][i]+"\t"+g2.yd[2][i]+"\n";
		}
	    return clipData;

}
