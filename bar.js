d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv", d3.autoType)
  .then(rows => {
    const data = rows
      .map(row => ({
        label: row.Screen_Tech,
        value: row["Mean(Labelled energy consumption (kWh/year))"]
      }))
      .filter(d => d.label && Number.isFinite(d.value));
      
    const container = d3.select("#bar-container");

    if (data.length === 0) {
      throw new Error("The 55-inch TV CSV does not contain valid chart data.");
    }

    // Consistent color scale for screen tech (matching the donut chart)
    const color = d3.scaleOrdinal()
      .domain(["LCD", "LED", "OLED"])
      .range(["#8ecae6", "#219ebc", "#0d3b3e"]);

    const svg = container.append("svg")
      .attr("role", "img")
      .attr("aria-label", "Bar chart of mean energy consumption by screen technology for 55-inch TVs")
      .style("display", "block")
      .style("width", "100%");

    function render() {
      const width = container.node().clientWidth;
      if (width === 0) return;

      const height = Math.max(320, Math.min(460, width * 0.55));
      const margin = { top: 32, right: 24, bottom: 64, left: 68 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      
      const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, plotWidth])
        .padding(0.3);
        
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.15])
        .nice()
        .range([plotHeight, 0]);

      svg.attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
      svg.selectAll("*").remove();

      const plot = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Clean, minimal axes
      plot.append("g")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(x).tickSize(0))
        .call(g => g.select(".domain").attr("stroke", "#ccc"))
        .call(g => g.selectAll("text").attr("font-size", "14px").attr("dy", "1em"));

      plot.append("g")
        .call(d3.axisLeft(y).tickSize(-plotWidth))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#eee"))
        .call(g => g.selectAll("text").attr("fill", "#666"));

      // Axis Labels
      plot.append("text")
        .attr("x", plotWidth / 2).attr("y", plotHeight + 45)
        .attr("text-anchor", "middle").attr("fill", "#333").attr("font-weight", "bold")
        .text("Screen Technology");

      plot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -plotHeight / 2).attr("y", -50)
        .attr("text-anchor", "middle").attr("fill", "#333").attr("font-weight", "bold")
        .text("Energy Consumption (kWh/year)");

      // Bars with unified colors
      plot.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => plotHeight - y(d.value))
        .attr("fill", d => color(d.label))
        .attr("rx", 4); // Rounded corners for modern look

      // Data Labels (Pre-attentive)
      plot.selectAll(".bar-value")
        .data(data)
        .join("text")
        .attr("class", "bar-value")
        .attr("x", d => x(d.label) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 8)
        .attr("text-anchor", "middle").attr("fill", "#333").attr("font-weight", "bold")
        .text(d => d3.format(".1f")(d.value));
    }

    render();
    new ResizeObserver(render).observe(container.node());
  })
  .catch(error => {
    console.error("Unable to render the bar chart.", error);
    d3.select("#bar-container").text("Unable to load chart.");
  });