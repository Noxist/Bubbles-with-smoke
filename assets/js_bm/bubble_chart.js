//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE A
//
// Daten importieren
//
// -----------------------------------------------------------------*/    

d3.csv('assets/data/data.csv', display); // Daten laden
setupButtons(); // Button Setup

//* ------------------------------------------------------------------
//
// Teil 1 - Allgemeiner Code
//
// Initialisierungs-Code und Helfer-Funktionen um eine neue Bubble-Chart-Instanz zu 
// erstellen, um die Daten zu laden und um die Daten darzustellen
//
// -----------------------------------------------------------------*/

var myBubbleChart = bubbleChart();

/* Funktion display ruft die Bubble-Chart Funktion auf und stellt sie im #vis div dar. Wird nach dem laden der Daten aus dem CSV gecallt. */
function display(error, data) {
  if (error) {
    console.log(error);
  }
  myBubbleChart('#vis', data);
}

/* Setup der Layout Buttons damit zwischen den Ansichten getogglet werden kann */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      d3.selectAll('.button').classed('active', false); // Remove active class from all buttons 
      var button = d3.select(this); // Find the button just clicked
      button.classed('active', true); // Set it as the active button
      var buttonId = button.attr('id'); // Get the id of the button
      myBubbleChart.toggleDisplay(buttonId); // Toggle the bubble chart based on the currently clicked button.
    });
}

/* Helper-Funktion zum konvertieren von Zahlen in einen String mit Kommas für schönere Darstellung */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

//* ------------------------------------------------------------------
//
// Teil 2 - Funktion für die Erstellung der Bubble Chart
//
// -----------------------------------------------------------------*/

/* Funktion für die Erstellung der Bubble Chart. Returned eine Funktion, welche eine neue Bubble Chart erstellt, gegeben ein DOM-Element zur Darstellung und gegeben ein Datenset zur Visualisierung. */

function bubbleChart() {
  var width = 1030; // Konstanten für die Grösse
  var height = 600; // Konstanten für die Grösse
  var center = { x: width / 2, y: height / 2 };  // Locations to move bubbles towards, depending on which view mode is selected.

//* ------------------------------------------------------------------
//
// Teil 3 - Beschriftungen
//
// -----------------------------------------------------------------*/

    
//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE G
//
// Beschriftungen anpassen
//
// -----------------------------------------------------------------*/    

// Erster Button: year (Jahr)   
 
var yearCenters = { // Center locations of the bubbles.
    
    2021: { x: 280, y: height / 2 },
    2022: { x: 720, y: height / 2 }
    
  };

  var yearTitleX = { // X locations of the year titles.
    
    '2021': 200,
    '2022': 780
  };
    

// Zweiter Button: agecat (Alterskategorie)   
 
var agecatCenters = { // Center locations of the bubbles.
    //1: { x: 100, y: height / 2 },
    2: { x: 280, y: height / 2 },
    3: { x: 400, y: height / 2 },
    4: { x: 520, y: height / 2 },
    5: { x: 680, y: height / 2 },
    6: { x: 810, y: height / 2 }
  };

  var agecatTitleX = { // X locations of the year titles.
    
    '14 - 15 Jahre': 150,
    '16 - 17 Jahre': 400,
    '18 - 19 Jahre': 620,
    '20 - 29 Jahre': 780,
    'Älter als 30 Jahre': 920
  };
    
    
// Dritter Button: Geschlecht
    
  var sexCenters = { // Center locations of the bubbles. 
    'Maennlich': { x: 250, y: height / 2  },
    'Weiblich': { x: 450, y: height / 2  },
    'Non-Binaer': { x: 600, y: height / 2  },
    'null': { x: 750, y: height / 2  }
    
  };

  var sexTitleX = {  // X locations of the year titles.
    'Männer': 170,
    'Frauen': 480,
    'Nichtbinär': 720,
    'Keine Antwort': 900
    
  };


// Vierter Button: Bildschirmzeit
    
  var screentimeCenters = { // Center locations of the bubbles. 
    'weniger als 1h': { x: 180, y: height / 2 },
    '1h-2h': { x: 300, y: height / 2 },
    '2h-3h': { x: 420, y: height / 2 },
    '3h-4h': { x: 550, y: height / 2 },
    '4h-5h': { x: 670, y: height / 2 },
    'Mehr als 5h': { x: 800, y: height / 2 } 
  };

  var screentimeTitleX = {  // X locations of the year titles.
    'bis 1h': 40,
    '1h bis 2h': 160,
    '2h bis 3h': 330,
    '3h bis 4h': 540,
    '4h bis 5h': 730,
    'mehr als 5h': 900
  };
    
// Fünfter Button: Sorgenbarometer
    
    
  var concernCenters = { // Center locations of the bubbles. 
    '1': { x: 220, y: height / 2  },
    '2': { x: 420, y: height / 2  },
    '3': { x: 600, y: height / 2  },
    '4': { x: 770, y: height / 2  }
  
  };

  var concernTitleX = {  // X locations of the year titles.
    '"Ich mache mir Sorgen um meine Daten."': 500,
    'Stimmt ganz': 100,
    'Stimmt eher': 350, 
    'Stimmt eher nicht': 650, 
    'Stimmt nicht': 900
  };
    
  var concernTitleY = {  // Y locations of the year titles.
    '"Ich mache mir Sorgen um meine Daten."': 35, 
    'Stimmt ganz': 70,
    'Stimmt eher': 70, 
    'Stimmt eher nicht': 70, 
    'Stimmt nicht': 70
  };  
    
    
    
//* ------------------------------------------------------------------
//
// Teil 4 - Datenmanipulation (csv into JS)
//
// -----------------------------------------------------------------*/
    
// Used when setting up force and moving around nodes
  var damper = 0.102;

// These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

/* Charge function that is called for each node. Charge is proportional to the diameter of the circle (which is stored in the radius attribute of the circle's associated data. This is done to allow for accurate collision detection with nodes of different sizes. Charge is negative because we want nodes to repel. Dividing by 8 scales down the charge to be appropriate for the visualization dimensions. */
    
  function charge(d) {
    return -Math.pow(d.radius, 2.05) / 6;
  }

/* Here we create a force layout and configure it to use the charge function from above. This also sets some contants to specify how the force layout should behave. More configuration is done below. */
    
  var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);


  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([5, 100]);

/* This data manipulation function takes the raw data from the CSV file and converts it into an array of node objects. Each node will store data and visualization values to visualize a bubble. rawData is expected to be an array of data objects, read in from one of d3's loading functions like d3.csv. This function returns the new node array, with a node in that array for each element in the rawData input. */
    
  function createNodes(rawData) {
 
/* Use map() to convert raw data into node data. Checkout http://learnjsdata.com/ for more on working with data. */
      
//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE B
//
// Hier werden die Daten importiert. Die Daten müssen mit dem Titel der Daten angesprochen werden. 
// Es wird dafür immer eine variable definiert und dann mit d.titel aus dem Excel importiert. 
// Einige wichtige sind unten schon importiert. 
//
// -----------------------------------------------------------------*/      
      
      
    var myNodes = rawData.map(function (d) {
      return {
          
        id: d.id,
        year: d.jahr,
        radius: radiusScale(+d.bszkat2), // Berechnung Radius für bubbles
        size: d.bszkat2,
        screentime: d.bsz,
          
        age: d.alter,
        agecat: d.kategoriealter,
          
        sex: d.geschlecht,
          
        concern: d.sorgenkat,  
        concerntext: d.sorgen,
        
         
        
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.size - a.size; });

    return myNodes;
  }

/* Main entry point to the bubble chart. This function is returned by the parent closure. It prepares the rawData for visualization and adds an svg element to the provided selector and starts the visualization creation process. selector is expected to be a DOM element or CSS selector that points to the parent element of the bubble chart. Inside this element, the code will add the SVG continer for the visualization. rawData is expected to be an array of data objects as provided by a d3 loading function like d3.csv. */
    
  var chart = function chart(selector, rawData) {
    
/* Use the max duration in the data as the max in the scale's domain. note we have to ensure the duration is a number by converting it with `+`. */

    var maxAmount = d3.max(rawData, function (d) { return +d.bszkat2; });
    radiusScale.domain([0, maxAmount*50]);

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

/* Create a SVG element inside the provided selector with desired size. */
      
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      
      
//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE C
//
// Hier wird definiert, welche Variable die Farbe der Bubbles definiert.
// Aktuell: "agecat". Jede Alters-Kategorie wird also anders eingefärbt. 
//
// -----------------------------------------------------------------*/      

      .attr('fill', function (d) { return fillColor(d.agecat); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.agecat)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // initiales layout = single group.
    groupBubbles();
  };

//* ------------------------------------------------------------------
//
// Teil 5 - Initiale Ansicht, alle Störungen: "Single group mode"
//
// -----------------------------------------------------------------*/

/* Sets visualization in "single group mode". The other labels are hidden and the force layout tick function is set to move all nodes to the center of the visualization. */

    
//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE D
//
// Hier wird für jede Variable eine Hide-Funktion definiert. 
// Alle Variablen, die unter A importiert wurden, müssen hier mit einer Hide-Funktion versehen werden. 
// Immer so vorgehen: hideVariablenname();
// Gross/Kleinschreibung ist wichtig. 
//    
// id und radius brauchen keine hide-Funktion!
//
// -----------------------------------------------------------------*/      
    
  function groupBubbles() {
    hideYear();
    hideAgecat();
    hideSex();
    hideScreentime();
    hideConcern();  
    
    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

/* Helfer-Funktion für den "single group mode". Returned eine Funktion, welche die Daten nimmt für einen Node und die Positionsdaten des Nodes so anpasst, dass er in die Mitte der Visualisierung geht.  

Die Positionierung basiert auf dem alpha Parameter des force layouts und wird kleiner, je länger das force layout läuft. Damit wird die bewegung der nodes verringert, je näher sie ihrem Ziel sind und erlaubt so anderen kräften wie der anziehungskraft der nodes auch die finale Positionen zu bestimmen. */
    
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }
    
//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE E
//
// Für jede Ansicht muss nun die richtige show / hide Anordnung programmiert werden. 
// Für neue Ansicht: Block kopieren und anpassen
//
// -----------------------------------------------------------------*/      

//* ------------------------------------------------------------------
//
// JAHR / YEAR
//
// -----------------------------------------------------------------*/
 
 function splitBubblesintoYear() {
    showYear();
    hideAgecat();
    hideSex();
    hideConcern();
    hideScreentime();

    force.on('tick', function (e) {
      bubbles.each(moveToYear(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }
    
function moveToYear(alpha) {
    return function (d) {
      var target = yearCenters[d.year];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideYear() {
    svg.selectAll('.year').remove();
  }

  function showYear() {

    var yearData = d3.keys(yearTitleX);
    var year = svg.selectAll('.year')
      .data(yearData);

    year.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return yearTitleX[d]; })
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }    
    
//* ------------------------------------------------------------------
//
// ALTER / AGE
//
// -----------------------------------------------------------------*/
 
 function splitBubblesintoAgecat() {
    showAgecat();
    hideYear();
    hideSex();
    hideConcern();
    hideScreentime();

    force.on('tick', function (e) {
      bubbles.each(moveToAgecat(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }
    
function moveToAgecat(alpha) {
    return function (d) {
      var target = agecatCenters[d.agecat];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideAgecat() {
    svg.selectAll('.agecat').remove();
  }

  function showAgecat() {

    var agecatData = d3.keys(agecatTitleX);
    var agecat = svg.selectAll('.agecat')
      .data(agecatData);

    agecat.enter().append('text')
      .attr('class', 'agecat')
      .attr('x', function (d) { return agecatTitleX[d]; })
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }

//* ------------------------------------------------------------------
//
// GESCHLECHT / SEX
//
// -----------------------------------------------------------------*/
    
  function splitBubblesintoSex() {
    showSex();
    hideYear();
    hideAgecat();
    hideConcern();
    hideScreentime();

    force.on('tick', function (e) {
      bubbles.each(moveToSex(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }
    
  function moveToSex(alpha) {
    return function (d) {
      var target = sexCenters[d.sex];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideSex() {
    svg.selectAll('.sex').remove();
  }

  function showSex() {
 
    var sexData = d3.keys(sexTitleX);
    var sex = svg.selectAll('.sex')
      .data(sexData);

    sex.enter().append('text')
      .attr('class', 'sex')
      .attr('x', function (d) { return sexTitleX[d]; })
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }

//* ------------------------------------------------------------------
//
// SCREENTIME / BILDSCHIRMZEIT
//
// -----------------------------------------------------------------*/
    
  function splitBubblesintoScreentime() {
    showScreentime();
    hideYear();
    hideSex();
    hideAgecat();
    hideConcern();

    force.on('tick', function (e) {
      bubbles.each(moveToScreentime(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  function moveToScreentime(alpha) {
    return function (d) {
      var target = screentimeCenters[d.screentime];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideScreentime() {
    svg.selectAll('.screentime').remove();
  }

  function showScreentime() {

    var screentimeData = d3.keys(screentimeTitleX);
    var screentime = svg.selectAll('.screentime')
      .data(screentimeData);

    screentime.enter().append('text')
      .attr('class', 'screentime')
      .attr('x', function (d) { return screentimeTitleX[d]; })
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }    

    
//* ------------------------------------------------------------------
//
// Sorgen
//
// -----------------------------------------------------------------*/
    
  function splitBubblesintoConcern() {
    showConcern();
    hideYear();
    hideSex();
    hideAgecat();
    hideScreentime();

    force.on('tick', function (e) {
      bubbles.each(moveToConcern(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  function moveToConcern(alpha) {
    return function (d) {
      var target = concernCenters[d.concern];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideConcern() {
    svg.selectAll('.concern').remove();
  }

  function showConcern() {

    var concernData = d3.keys(concernTitleX);
    var concern = svg.selectAll('.concern')
      .data(concernData);

    concern.enter().append('text')
      .attr('class', 'concern')
      .attr('x', function (d) { return concernTitleX[d]; })
      .attr('y', function (d) { return concernTitleY[d]; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }

    
//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE F
//
// Wechselfunktion anpassen. Wenn Sie neue Ansichtne hinzufügen, dann unten einen "else if"-Block kopieren und anpassen. 
//
// -----------------------------------------------------------------*/      
    
//* ------------------------------------------------------------------
//
// Teil 11 - Wechseln zwischen den Ansichten
//
// -----------------------------------------------------------------*/
    
  /* Externally accessible function (this is attached to the returned chart function). Allows the visualization to toggle between "single group" and "split by ..." modes. */

  chart.toggleDisplay = function (displayName) {
    if (displayName === 'year') {
      splitBubblesintoYear();
    } else if (displayName === 'agecat') {
      splitBubblesintoAgecat();
    } else if (displayName === 'sex') {
      splitBubblesintoSex();
    } else if (displayName === 'concern') {
      splitBubblesintoConcern();
    } else if (displayName === 'screentime') {
      splitBubblesintoScreentime();
    } else {
      groupBubbles();
    }
  };
    
  return chart;
}

// Ende der Funktion

//* ------------------------------------------------------------------
//
// Teil 12 - Tooltip
//
// -----------------------------------------------------------------*/


//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE H
//
// Tooltips anpassen
//
// -----------------------------------------------------------------*/    

  // Tooltip für Mousover
  var tooltip2 = floatingtooltip2('gates_tooltip2', 240);

  var fillColor = d3.scale.ordinal()
    .domain(['1','2','3', '4','5','6'])
    .range(['#F7CAD0', '#ADE8F4', '#48CAE4', '#0096C7','#023E8A','#03045E']);

  /* Tooltip-Funktion*/
  function showDetail(d) {

    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Alter: </span><span class="value">' +
                  d.age +
                  '</span><br/>' +
                  '<span class="name">Geschlecht: </span><span class="value">' +
                  d.sex +
                  '</span><br/>' +
                  '<span class="name">Bildschirmzeit: </span><span class="value">' +
                  d.screentime +
                  '</span><br/>' +
                  '<span class="name">"Ich mache mir Sorgen um meine Daten": </span><span class="value">' +
                  d.concerntext +
                  '</span><br/>' +
                  '<span class="name">"Umfragejahr": </span><span class="value">' +
                  d.year +
                  '</span>';
    tooltip2.showtooltip2(content, d3.event);
  }

  function hideDetail(d) { // tooltip verstecken

      
//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE I
//
// Farben anpassen: hier Variable definiere, weiter oben (ca. Zeile 500) die Farben konkret anpassen. 
//
// -----------------------------------------------------------------*/    
      
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.agecat)).darker());

    tooltip2.hidetooltip2();
  }

//* ------------------------------------------------------------------
//
// WISSENSCHAFTSWOCHE J
//
// The End
//
// -----------------------------------------------------------------*/