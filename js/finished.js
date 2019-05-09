'use strict';

(function() {

  let data = ""; // keep data in global scope
  let svgContainer = ""; // keep SVG reference in global scope
  let width = "";
  let height = "";
  let margin = "";
  let div = "";

  // load data and make scatter plot after window loads
  window.onload = function() {
    margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = 1400 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

    svgContainer = d3.select('body')
      .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    // make tooltip
    div = d3.select("body")
        .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("data/SeasonsData.csv")
      .then((csvData) => makeHistogram(csvData));
  }


    function makeHistogram(csvData) {
        data = csvData
        
        let avgViewers = data.map((row) => parseFloat(row["Avg. Viewers (mil)"]))
        let seasons = data.map((row) => parseFloat(row["Year"]))
        
        // for average line on graph
        let avgOfAvgViewers = d3.mean(avgViewers).toFixed(1)

        var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        
        var y = d3.scaleLinear().rangeRound([height, 0]);
        
        var xAxis = d3.axisBottom()
            .scale(x);
        
        var yAxis = d3.axisLeft()
            .scale(y);

        x.domain(seasons);
        y.domain([0, d3.max(avgViewers) + 4]);

        svgContainer.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(95," + (height + 100) + ")")
            .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-90)" );
        
        svgContainer.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .attr("transform", "translate(100,100)")
            

        var bar = svgContainer.selectAll(".bar")
        .data(data)
        .enter().append("g")

        bar.append("rect")
            .attr("class", "bar")
            .attr("transform", "translate(95,100)")
            .attr("x", function (d) {
                return x(d["Year"]);
            })
            .attr("y", function (d) {
                return y(Number(d["Avg. Viewers (mil)"]));
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return height - y(Number(d["Avg. Viewers (mil)"]));
            })
            .style("fill", (d) => { // make gray if not actual data
                if (d["Data"] !== "Actual") {
                    return "gray"
                }
            })
            .on("mouseover", (d) => mouseIn(d))
            .on("mouseout", (d) => mouseOut(d));

        bar.append("text")
            .attr("class", "below")
            .attr("x", (d) => x(d["Year"]) + 107 - String(d["Avg. Viewers (mil)"]).length) // shift based on size of text
            .attr("y", (d) => y(Number(d["Avg. Viewers (mil)"])) + 95)
            .text((d) => parseFloat(d["Avg. Viewers (mil)"]).toFixed(1))
            .style("fill", "#000000")   
            .style("font-weight", "bold");

        // add graph labels    
        addLabels();
        // add legend to graph    
        addLegend();
        // add mean line
        addAvgLine(y(avgOfAvgViewers), avgOfAvgViewers)
    }


// mouseIn handles when user mouses over bar on chart
function mouseIn(d) {
    div.transition()
            .duration(200)
            .style("opacity", 1)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          div.html("Season #" + d["Year"] +
                   "<br/>" + "Year: <span>" + d["Year"] + "</span>" +
                   "<br/>" + "Episodes: <span>" + d["Episodes"] + "</span>" +
                   "<br/>" + "Avg Viewers (mil): <span>" + d["Avg. Viewers (mil)"] + "</span> <br/>" +
                   "<br/>" + "Most Watched Episode: <span>" + d["Most watched episode"] + "</span>" +
                   "<br/>" + "Viewers (mil): <span>" + d["Viewers (mil)"] + "</span>"
                   )

}

// mouseOut handles when user mouses away from bar on chart
function mouseOut(d) {
    div.transition()
        .duration(500)
        .style("opacity", 0);
}


// addAvgLine takes in the scaled location of the average along
// the y axis and the avg and draws a dashed average line on the chart
function addAvgLine(avgLoc, avg) {
    var avgLine = svgContainer.append("g")

    // add line
    avgLine.append("line")
        .style("stroke", "darkgray")
        .style("stroke-width", "2px")
        .style("stroke-dasharray", "10,5")
        .attr("transform", "translate(95,100)")
        .attr("x1", 15)     
        .attr("y1", avgLoc)      
        .attr("x2", width - 15)     
        .attr("y2", avgLoc); 

    // add white box behind label
    avgLine.append("rect")
        .style("fill", "white")
        .style("opacity", 0.5)
        .attr("x", 20)
        .attr("y", avgLoc - 25)
        .attr("transform", "translate(95,100)")
        .attr("width", 30)
        .attr("height", 21);  


    // add label for line
    avgLine.append("text")
    .attr("x", 21)
    .attr("y", avgLoc - 10)
    .attr("transform", "translate(95,100)")
    .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
    .style("font-size", "14px")
    .style("background-color", "red")
    .text(avg)

    
}


// addLabels adds text labels for axis and the title of the graph
function addLabels() {
    // text label for the x axis
    svgContainer.append("text")   
        .attr("y", height + margin.bottom + 80)
        .attr("x", (width / 2) + 80)
        .style("text-anchor", "middle")
        .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
        .text("Season (by year)");
    
    // text label for the y axis
    svgContainer.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("x", - (height / 2) - 100)
        .style("text-anchor", "middle")
        .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
        .text("Avg. Viewers (in millions)"); 

    // text label for the title
    svgContainer.append("text")
        .attr("y", 25)
        .attr("x", (width / 2) + 100)
        .style("text-anchor", "middle")
        .style("font-size", "25px")
        .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
        .text("Average Viewership By Season"); 
}


// addLegend adds a g element to the svg that contains elements that make
// up a legend
function addLegend() {   
    // add legend   
    var legend = svgContainer.append("g")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 100)
        .attr("x", width - 65)
        .attr("y", 50)
        .attr('transform', 'translate(-20,50)')    
    
    // add title for legend
    legend.append("text")
        .attr("x", width - 65)
        .attr("y", 30)
        .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
        .style("font-weight", "bold")
        .text("Viewership Data");

    // add actual/estimated references    
    legend.append("rect")
        .style("fill", "#5e9ed3")
        .attr("x", width - 65)
        .attr("y", 45)
        .attr("width", 15)
        .attr("height", 15)
        .style("stroke", "rgb(90, 89, 89)")
        .style("stroke-width", "0.7px");

    legend.append("text")
        .attr("x", width - 44)
        .attr("y", 58)
        .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
        .text("Actual");

    legend.append("rect")
        .style("fill", "gray")
        .attr("x", width - 65)
        .attr("y", 70)
        .attr("width", 15)
        .attr("height", 15) 
        .style("stroke", "rgb(90, 89, 89)")
        .style("stroke-width", "0.7px");

    legend.append("text")
        .attr("x", width - 44)
        .attr("y", 84)
        .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
        .text("Estimated");
}
})();
