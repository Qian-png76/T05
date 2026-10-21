d3.csv("data/Ex5_ARE_Spot_Prices.csv", row => ({
  year: Number(row.Year),
  price: Number(row["Average Price (notTas-Snowy)"])
}))
  .then(rows => {
    const data = rows
      .filter(d => Number.isFinite(d.year) && Number.isFinite(d.price))
      .sort((a, b) => a.year - b.year);
    const container = d3.select("#line-container");

    if (data.length === 0) throw new Error("No data");

    // Create a tooltip div (hidden by default)
    const tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");

    const svg = container.append("svg")
      .attr("role", "img")
      .style("display", "block").style("width", "100%");

    function render() {
      const width = container.node().clientWidth;
      if (width === 0) return;

      const height = Math.max(320, Math.min(460, width * 0.55));
      const margin = { top: 40, right: 24, bottom: 64, left: 100 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      
      // ADDED PADDING TO X DOMAIN (-0.5 and +0.5) so dots don't sit on the axis lines
      const xMin = d3.min(data, d => d.year);
      const xMax = d3.max(data, d => d.year);
      const x = d3.scaleLinear()
        .domain([xMin - 0.5, xMax + 0.5]) 
        .range([0, plotWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d.price) * 1.15]).nice().range([plotHeight, 0]);

      const line = d3.line().x(d => x(d.year)).y(d => y(d.price));
      
      const area = d3.area()
        .x(d => x(d.year))
        .y0(plotHeight)
        .y1(d => y(d.price));

      svg.attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
      svg.selectAll("*").remove();

      // Gradient
      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "area-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#219ebc").attr("stop-opacity", 0.3);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "#219ebc").attr("stop-opacity", 0.0);

      const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Axes
      plot.append("g").attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
      plot.append("g").call(d3.axisLeft(y).tickSize(-plotWidth))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#eee"));

      // Area and Line
      plot.append("path").datum(data).attr("fill", "url(#area-gradient)").attr("d", area);
      plot.append("path").datum(data).attr("fill", "none")
        .attr("stroke", "#0d3b3e").attr("stroke-width", 3).attr("d", line);

      // Dots with Hover Interactions
      plot.selectAll("circle").data(data).join("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.price))
        .attr("r", 5)
        .attr("fill", "#f4a261")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        // SHOW TOOLTIP ON HOVER
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 8).attr("fill", "#0d3b3e"); // Enlarge dot
          tooltip.style("opacity", 1)
                 .html(`<strong>Year:</strong> ${d.year}<br><strong>Price:</strong> $${d.price}`)
                 .style("left", (event.pageX + 15) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        // HIDE TOOLTIP ON MOUSE OUT
        .on("mouseout", function() {
          d3.select(this).attr("r", 5).attr("fill", "#f4a261"); // Reset dot
          tooltip.style("opacity", 0);
        });

      // DATA STORYTELLING: Highlight the max peak permanently
      const maxData = data.reduce((prev, current) => (prev.price > current.price) ? prev : current);
      plot.append("text")
        .attr("x", x(maxData.year))
        .attr("y", y(maxData.price) - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#0d3b3e")
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text(`Peak: $${maxData.price}`);
    }

    render();
    new ResizeObserver(render).observe(container.node());
  })
  .catch(error => {
    console.error("Unable to render line chart.", error);
  });