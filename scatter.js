d3.csv("data/Ex5_TV_energy.csv", d3.autoType)
  .then(data => {
    const points = data.filter(d =>
      Number.isFinite(d.star2) && Number.isFinite(d.energy_consumpt) && d.count > 0
    );
    const container = d3.select("#scatter-container");

    if (points.length === 0) throw new Error("No data");

    const tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");

    const color = d3.scaleOrdinal()
      .domain(["LCD", "LCD (LED)", "OLED"])
      .range(["#8ecae6", "#219ebc", "#0d3b3e"]);

    const svg = container.append("svg")
      .attr("role", "img")
      .style("display", "block").style("width", "100%");

    function render() {
      const width = container.node().clientWidth;
      if (width === 0) return;

      const height = Math.max(350, Math.min(520, width * 0.6));
      const margin = { top: 40, right: 30, bottom: 64, left: 80 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;

      const x = d3.scaleLinear().domain(d3.extent(points, d => d.star2)).nice().range([0, plotWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(points, d => d.energy_consumpt) * 1.1]).nice().range([plotHeight, 0]);

      svg.attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
      svg.selectAll("*").remove();

      const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Gridlines & Axes
      plot.append("g").attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(x).ticks(10))
        .call(g => g.selectAll(".tick line").attr("stroke", "#eee"));
        
      plot.append("g").call(d3.axisLeft(y).tickSize(-plotWidth))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#eee"));

      // Axis Labels
      plot.append("text").attr("x", plotWidth / 2).attr("y", plotHeight + 50)
        .attr("text-anchor", "middle").attr("fill", "#333").attr("font-weight", "bold").text("Star Rating");
      plot.append("text").attr("transform", "rotate(-90)").attr("x", -plotHeight / 2).attr("y", -55)
        .attr("text-anchor", "middle").attr("fill", "#333").attr("font-weight", "bold").text("Energy Consumption (kWh/year)");

      // Draw Bubbles (Fixed size, transparent, jittered)
      plot.selectAll("circle")
        .data(points)
        .join("circle")
        // JITTER: Add a tiny random offset to X so overlapping dots spread out
        .attr("cx", d => x(d.star2) + (Math.random() - 0.5) * 8) 
        .attr("cy", d => y(d.energy_consumpt))
        .attr("r", 4) // Fixed size
        .attr("fill", d => color(d.screen_tech))
        .attr("opacity", 0.4) // Low opacity to show density (Alpha blending)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("stroke", "#333").attr("stroke-width", 2).attr("opacity", 1); // Highlight
          tooltip.style("opacity", 1)
                 .html(`<strong>${d.brand.toUpperCase()}</strong><br/>
                        Tech: ${d.screen_tech}<br/>
                        Size: ${d.screensize}"<br/>
                        Energy: ${d.energy_consumpt} kWh<br/>
                        Stars: ${d.star2}<br/>
                        <em>(Matches ${d.count} models)</em>`)
                 .style("left", (event.pageX + 15) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("stroke", "white").attr("stroke-width", 0.5).attr("opacity", 0.4);
          tooltip.style("opacity", 0);
        });

      // Annotation: Highlight the massive outlier
      const outlier = points.reduce((prev, current) => (prev.energy_consumpt > current.energy_consumpt) ? prev : current);
      plot.append("text")
        .attr("x", x(outlier.star2) + 15)
        .attr("y", y(outlier.energy_consumpt) + 5)
        .attr("fill", "#e63946")
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text(`← ${outlier.screensize}" TV (Huge Outlier)`);

      // Legend
      const legend = plot.append("g").attr("transform", `translate(${plotWidth - 120}, 10)`);
      const techs = ["LCD", "LCD (LED)", "OLED"];
      techs.forEach((tech, i) => {
        const lg = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        lg.append("circle").attr("r", 5).attr("fill", color(tech)).attr("stroke", "white");
        lg.append("text").attr("x", 12).attr("y", 4).attr("font-size", "12px").attr("fill", "#333").text(tech);
      });
    }

    render();
    new ResizeObserver(render).observe(container.node());
  })
  .catch(error => {
    console.error("Unable to render scatter plot.", error);
  });