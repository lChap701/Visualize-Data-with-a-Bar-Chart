// Widths and height
const WIDTH = 780;
const HEIGHT = 540;
const BAR_WIDTH = WIDTH / 250;

/* Extracts dates and GDP in JSON */
function extract(v, i) {
  return v[i];
}

/* Finds max values */
function findMax(arr) {
  return d3.max(arr);
}

// SVG
var svg = d3
  .select("#data")
  .append("svg")
  .attr("width", WIDTH + 50)
  .attr("height", HEIGHT + 30);

// Tooltip
var tooltip = d3
  .select("#data")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

// Axis labels
svg
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -(WIDTH / 2.45))
  .attr("y", 15)
  .attr("class", "axis-label")
  .text("Gross Domestic Product");

svg
  .append("text")
  .attr("x", WIDTH / 1.78)
  .attr("y", HEIGHT - 10)
  .attr("class", "axis-label")
  .text("Year");

const URL =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

// Gets data from JSON
d3.json(URL).then(function (data) {
  // Updates headings
  d3.select("#title").text(data.name);
  d3.select("#source_name").text(data.source_name);

  // Sets up the x-axis
  var dates = data.data.map((v) => new Date(extract(v, 0)));
  let maxX = new Date(findMax(dates));
  maxX.setMonth(maxX.getMonth() + 3); // Done for scale

  const xScale = d3
    .scaleTime()
    .domain([d3.min(dates), maxX])
    .range([0, WIDTH - 15]);

  const xAxis = d3.axisBottom().scale(xScale);

  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(60, 490)");

  // Sets up y-axis
  var gdp = data.data.map((v) => extract(v, 1));
  const maxY = findMax(gdp);

  const linearScale = d3
    .scaleLinear()
    .domain([0, maxY])
    .range([0, HEIGHT - 55]);

  const yAxisScale = d3
    .scaleLinear()
    .domain([0, maxY])
    .range([HEIGHT - 55, 0]);

  const yAxis = d3.axisLeft(yAxisScale);

  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(60, 5)");

  const scaledGdp = gdp.map((v) => linearScale(v));

  var years = data.data.map((v) => {
    let quarter = "";

    switch (v[0].substring(5, 7)) {
      case "01":
        quarter = "Q1";
        break;
      case "04":
        quarter = "Q2";
        break;
      case "07":
        quarter = "Q3";
        break;
      case "10":
        quarter = "Q4";
        break;
      default:
        quarter = "Error";
    }

    return v[0].substring(0, 4) + " " + quarter;
  });

  // Adds bars
  d3.select("svg")
    .selectAll("rect")
    .data(scaledGdp)
    .enter()
    .append("rect")
    .attr("data-date", (d, i) => data.data[i][0])
    .attr("data-gdp", (d, i) => data.data[i][1])
    .attr("data-qrter", (d, i) => years[i])
    .attr("class", "bar")
    .attr("x", (d, i) => xScale(dates[i]))
    .attr("y", (d) => HEIGHT - d)
    .attr("width", BAR_WIDTH)
    .attr("height", (d) => d)
    .attr("transform", "translate(60, -50)")
    .on("mouseover", function (e) {
      tooltip.transition().duration(200).style("opacity", 1);

      tooltip
        .html(
          e.target.getAttribute("data-qrter") +
            "<br>" +
            "$" +
            window
              .Number(e.target.getAttribute("data-gdp"))
              .toFixed(1)
              .replace(/(\d)(?=(\d{3})+\.)/g, "$1,") +
            " Billion"
        )
        .attr("data-date", e.target.getAttribute("data-date"))
        .style("left", e.clientX + BAR_WIDTH + "px")
        .style("top", HEIGHT - 80 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });
});

// Info Link
svg
  .append("a")
  .attr("href", "http://www.bea.gov/national/pdf/nipaguid.pdf")
  .attr("target", "_blank");

svg
  .select("a")
  .append("text")
  .attr("x", WIDTH / 4)
  .attr("y", HEIGHT + 26)
  .text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf")
  .style("fill", "#0854af")
  .attr("id", "info");
