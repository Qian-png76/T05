d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv", d3.autoType)
  .then(rows => {
    const data = rows
      .map(row => ({
        label: row.Screen_Tech,
        value: row["Mean(Labelled energy consumption (kWh/year))"]
      }))
      .filter(d => d.label && Number.isFinite(d.value) && d.value > 0);
    const container = d3.select("#donut-container");

    if (data.length === 0) throw new Error("No data");

    // Same color scale as Bar Chart
    const color = d3.scaleOrdinal()
      .domain(["LCD", "LED", "OLED"])
      .range(["#8ecae6", "#219ebc", "#0d3b3e"]);
      
    const pie = d3.pie().value(d => d.value).sort(null);
    
    const svg = container.append("svg")
      .attr("role", "img")
      .attr("aria-label", "Donut chart of mean energy consumption by screen technology")
      .style("display", "block")
      .style("width", "100%");

    function render() {
      const width = container.node().clientWidth;
      if (width === 0) return;

      const height = 400; 
      const radius = Math.min(width, height) / 2.5;
      const centerX = width / 2;
      const centerY = height / 2;
      
      const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
      // Adjusted label arc radius to push labels slightly towards the outer edge
      const labelArc = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);

      svg.attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
      svg.selectAll("*").remove();

      const g = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);

      // Draw Slices
      g.selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      // Direct Labels with values and dynamic contrast
      g.selectAll(".label")
        .data(pie(data))
        .join("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        // Dynamically set text fill: dark text for the light blue LCD, white for the others
        .attr("fill", d => d.data.label === "LCD" ? "#333" : "white") 
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .each(function(d) {
            // We add two text elements per label: the name, and the value below it
            d3.select(this).append("tspan")
                .attr("x", 0).attr("dy", "-0.2em")
                .text(d.data.label);
            d3.select(this).append("tspan")
                .attr("x", 0).attr("dy", "1.2em")
                // Format the value to 0 decimal places to keep it clean
                .text(d3.format(".0f")(d.data.value) + " kWh");
        });

      // NEW: Add central text to utilize empty space
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.2em")
        .attr("fill", "#666")
        .attr("font-size", "14px")
        .text("Mean Energy");

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.2em")
        .attr("fill", "#0d3b3e")
        .attr("font-weight", "bold")
        .attr("font-size", "16px")
        .text("(kWh/year)");
    }

    render();
    new ResizeObserver(render).observe(container.node());
  })
  .catch(error => {
    console.error("Unable to render the donut chart.", error);
    d3.select("#donut-container").text("Unable to load chart.");
  });