  // Example debounce function
  function debounce(func, delay) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args);
        }, delay);
    };
}

// Example throttle function
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function () {
                inThrottle = false;
            }, limit);
        }
    };
}

const timeSeries = "Data_CT.csv";
let svg = d3.select("svg");
const path = d3.geoPath();

$(document).ready(async function () {
    try {
        const data = await d3.csv(timeSeries);
        let m = 512, n = 512;

        let values_T = [];
        data.forEach(function (d) {
            values_T.push(+d[0]);
        });

        const min_temp = d3.min(values_T);
        const max_temp = d3.max(values_T);

        let colors = d3.scaleLinear()
            .domain(d3.range(min_temp, max_temp, parseInt(Math.abs(max_temp - min_temp) / 6.5)))
            .range(["#0d1a50", "#3e5eba", "#2b83ba", "#abdda4", "#ffffbf", "#fdae61", "#d7191c"])
            .interpolate(d3.interpolateHcl);

        function plot_contour(minValue, maxValue) {
            svg.select('.contours').remove();

            let filteredValues = values_T.filter(function (value) {
                return value >= minValue && value <= maxValue;
            });

            const min_filtered = d3.min(filteredValues);
            const max_filtered = d3.max(filteredValues);

            let contours = d3.contours()
                .size([m, n])
                .thresholds(d3.range(min_filtered, max_filtered, 300))
                (filteredValues);

            svg.append("g").attr("class", "contours")
                .selectAll("path")
                .data(contours)
                .enter()
                .append("path")
                .attr("d", function (d) { return path(d); })
                .attr("stroke", "black")
                .attr("stroke-width", ".1px")
                .attr("stroke-linejoin", "round")
                .attr("fill", function (d) { return colors(d.value); });
        }

        $("#slider-range").slider({
            range: true,
            min: min_temp,
            max: max_temp,
            values: [min_temp, max_temp],
            slide: function (event, ui) {
                $("#amount").val(ui.values[0] + " - " + ui.values[1]);
                plot_contour(ui.values[0], ui.values[1]);
            }
        });

        plot_contour(min_temp, max_temp);
    } catch (error) {
        console.error("Error loading CSV:", error);
    }
});