// About Pannel code
$('.map-menu').on('click', function(){
    $('.about').toggleClass('hidden')
});
$('.close').on('click', function(){
    $('.about').toggleClass('hidden')
});


// MAP CODE
// width and height
var w = document.documentElement.clientWidth;
var h = document.documentElement.clientHeight;

// scale globe to size of window
var scl = Math.min(w, h)/2.5; 

// map projection
var projection = d3.geoOrthographic()
        .scale(scl)
        .translate([ w/2, h/2 ])
        .clipAngle(90);
            
// path generator
var path = d3.geoPath()
  .projection(projection)
  .pointRadius(3.5);

// append svg
var svg = d3.select("#svgDiv")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

// append g element for map
var map = svg.append("g");


d3.queue()
    .defer(d3.json, "world-110m.json")
    .defer(d3.json, "mannbassadors.json")
    .await(ready);


// load topojson elements
function ready(error, world, places){
    var mapElements = map.append("path")
        .datum({type: "Sphere"})
        .attr("class", "ocean")
        .attr("d", path);

    //Countries
    map.append("path")
        .datum(topojson.merge(world, world.objects.countries.geometries))
        .attr("class", "land")
        .attr("d", path);

    //Country Borders
    map.append("path")
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", path);

    //Mannbassador point-data
    map.append("g")
        .selectAll("text")
        .data(places.features)
        .enter()
        .append("path")
        .attr("class", "point")
        .attr("fill","#c40808")
        .attr("d", path)
    
    //Tooltips
    .on("mouseover", function(d){
        d3.select(this)
            .attr("fill","#e5b20b")
        d3.select("#tooltip")
            .classed("hidden",false)
            .style("left", "10px")
            .style("bottom", "10px");
        d3.select("#tool-name")
            .text("Name: "+ d.properties.mannbassador);
        d3.select("#tool-destination")
            .text("Jurisdiction: "+ d.properties.destination);
        d3.select("#tool-notes")
            .text(d.properties.notes);
    })
    .on("mouseout",function(){
        d3.select(this)
            .attr("fill","#c40808")
        d3.select("#tooltip")
            .classed("hidden", true)
    })
    .on("click", function(d){
        d3.selectAll(".point")
            .attr('fill', "#c40808")
        d3.select(this)
            .attr("fill","#e5b20b")
        d3.select("#tooltip")
            .classed("hidden",false)
            .style("left", "10px")
            .style("bottom", "10px");
        d3.select("#tool-name")
            .text("Name: "+ d.properties.mannbassador);
        d3.select("#tool-destination")
            .text("Jurisdiction: "+ d.properties.destination);
        d3.select("#tool-notes")
            .text(d.properties.notes);
    });
    d3.select("#tooltip-close")
    .on("click",function(){
        d3.selectAll(".point")
            .attr('fill', "#c40808")
        d3.select("#tooltip")
            .classed("hidden", true) 
    })
};

// enable drag
var drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged);

var gpos0, o0, gpos1, o1;

svg.call(drag);

// enable zoom
var zoom = d3.zoom()
    .scaleExtent([1, 50]) //bound zoom
    .on("zoom", zoomed);

svg.call(zoom);

//Zoom buttons
var createZoomButtons = function(){
    var zoomIn = svg.append("g")
    .attr("class", "zoom")
    .attr("id", "in") 
    .attr("transform", "translate(" + (w - 125) + "," + (h - 70) + ")");

    zoomIn.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 45)
        .attr("height", 45)
        .attr("fill", "#c40808");

    zoomIn.append("text")
        .attr("x", 18)
        .attr("y", 28)
        .attr("class", 'zoom-text')
        .text("+");

    //Zoom out button
    var zoomOut = svg.append("g")
        .attr("class", "zoom")
        .attr("id", "out")
        .attr("transform", "translate(" + (w - 70) + "," + (h - 70) + ")");

    zoomOut.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 45)
        .attr("height", 45)
        .attr("fill", "#c40808");

    zoomOut.append("text")
        .attr("x", 18)
        .attr("y", 28)
        .attr("class", 'zoom-text')
        .html("&ndash;");

    //Interaction
    d3.selectAll(".zoom").on("click", function(){
        var direction = d3.select(this).attr("id");
        var scaleFactor;
        switch(direction) {
            case"in":
                scaleFactor = 1.5;
                break;
            case "out":
                scaleFactor = 0.75;
                break;
            default:
            break;
        }
        
        map.transition()
        .call(zoom.scaleBy, scaleFactor);
    });
}
createZoomButtons();


// functions for dragging
function dragstarted() {
    gpos0 = projection.invert(d3.mouse(this));
    o0 = projection.rotate();
}

function dragged() {
    gpos1 = projection.invert(d3.mouse(this));
    o0 = projection.rotate();
    o1 = eulerAngles(gpos0, gpos1, o0);
    projection.rotate(o1);
    map.selectAll("path").attr("d", path);
}

// functions for zooming
function zoomed() {
    projection.scale(d3.event.transform.translate(projection).k * scl)
    map.selectAll("path").attr("d", path);
}
