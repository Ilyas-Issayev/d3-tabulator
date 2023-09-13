//dashboard.js
import { formatValue } from './helpers/tableHelpers.js';

/**
 * Отображает первую таблицу на дашборде, включая график и вспомогательные элементы.
 * 
 * @param {Array<Object>} allData - Массив объектов с данными для отображения на дашборде.
 */
export function getFirstTableDashboard(allData) {

    // Группируем данные по месяцам и суммируем значения продаж для каждого месяца
    const groupedData1 = allData.reduce((acc, entry) => {
        const { TrnYear, TrnMonth, SalesAmountCDN } = entry;
        const date = new Date(TrnYear, TrnMonth - 1);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;

        if (!acc[date.getFullYear()]) {
            acc[date.getFullYear()] = [];
        }

        const yearData = acc[date.getFullYear()];

        const existingEntry = yearData.find(item => item.date === formattedDate);
        if (existingEntry) {
            if ('SalesAmountCDN' in existingEntry) {
                existingEntry.SalesAmountCDN += SalesAmountCDN;
            } else {
                existingEntry.SalesAmountCDN = SalesAmountCDN;
            }
        } else {
            yearData.push({ date: formattedDate, SalesAmountCDN });
        }
        return acc;
    }, {});

    // Конвертируем groupedData1 в массив объектов для каждого года
    let result1 = Object.entries(groupedData1).map(([year, data]) => {
        return { [`data${year}`]: data };
    });

    result1.forEach(function (yearData) {
        Object.keys(yearData).forEach(function (key) {
            yearData[key].sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });
        });
    });

    // Удаляем записи, содержащие NaN в значениях продаж
    let removeNans = result1.filter(item => {
        const data = Object.values(item)[0];
        return data.every(entry => !isNaN(entry.SalesAmountCDN));
    });

    result1 = removeNans;

    // Отображаем график и элементы дашборда
    const margin = { top: 20, right: 20, bottom: 30, left: 70 };
    const container = d3.select("#chart-container");
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height;
    const pointerRadius = 4;

    const svgContainer = d3
        .select("#dashboard")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const tooltip = d3
        .select("#dashboard")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const focusLine = svgContainer
        .append("line")
        .attr("class", "focus-line")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("opacity", 0);

    const verticalLine = svgContainer
        .append("line")
        .attr("class", "vertical-line")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("opacity", 0);

    svgContainer.on("mousemove", handleMousemove);

    const threshold = 20;
    function handleMousemove(event) {
        const [mouseX, mouseY] = d3.pointer(event, this);

        const dataInRange = combinedData1.filter((d) => {
            const xPos = x(new Date(d.date).getMonth()) + 120;
            const distance = Math.abs(xPos - mouseX);
            return distance <= threshold; // Adjust the threshold value as needed
        });

        if (dataInRange.length > 0) {
            verticalLine
                .attr(
                    "x1",
                    x(new Date(dataInRange[0].date).getMonth()) + (x.bandwidth() / 2) + 70
                )
                .attr(
                    "x2",
                    x(new Date(dataInRange[0].date).getMonth()) + (x.bandwidth() / 2) + 70
                )
                .attr("opacity", 1);

            const tooltipLeft = mouseX + 240; // Adjust tooltip position as needed
            const tooltipTop =
                y(d3.max(dataInRange, (d) => d.SalesAmountCDN)) + 140; // Adjust tooltip position as needed

            tooltip
                .style("display", "block")
                .style("opacity", 1)
                .style("left", `${tooltipLeft}px`)
                .style("top", `${tooltipTop}px`)
                .html(generateTooltipHTML(dataInRange));
        } else {
            verticalLine.attr("opacity", 0);
            tooltip.style("opacity", 0);
        }
    }

    function generateTooltipHTML(data) {
        let html = "";
        data.forEach((d) => {
            const formattedDate = new Date(d.date).toLocaleDateString();
            const formattedAmount = formatValue(d.SalesAmountCDN);
            html += `<strong>Date:</strong> ${formattedDate}<br><strong>Sales Amount:</strong> ${formattedAmount}<br><br>`;
        });
        return html;
    }

    const svg = svgContainer
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const combinedData1 = result1.reduce((acc, item) => {
        const yearData = Object.values(item)[0];
        return acc.concat(yearData);
    }, []);

    combinedData1.sort((a, b) => new Date(a.date) - new Date(b.date));

    const uniqueMonths = [
        ...new Set(combinedData1.map((d) => new Date(d.date).getMonth())),
    ].sort((a, b) => a - b);

    const x = d3
        .scaleBand()
        .domain(uniqueMonths.map((_, index) => index))
        .range([0, width - 50])
        .paddingInner(0.1)
        .paddingOuter(0.2);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(combinedData1, (d) => d.SalesAmountCDN)])
        .range([height - margin.bottom - 50, margin.top]);

    const yScaleLeft = d3
        .scaleLinear()
        .domain([0, d3.max(combinedData1, (d) => d.SalesAmountCDN)])
        .range([height - margin.bottom - 50, margin.top]);

    const line = d3
        .line()
        .defined((d) => !isNaN(d.SalesAmountCDN))
        .x((d) => x(new Date(d.date).getMonth()) + 35)
        .y((d) => y(d.SalesAmountCDN));

    const pointers = svg.append("g");

    const distanceBetweenText = 40;

    const colorScheme = {
        data2020: "#fd7f6f",
        data2021: "#7eb0d5",
        data2022: "#b2e061",
        data2023: "#bd7ebe",
        data2024: "#ffb55a",
        data2025: "#ffee65",
        data2026: "#beb9db",
    };

    const colorScale = d3
        .scaleOrdinal()
        .domain(Object.keys(groupedData1))
        .range(Object.values(colorScheme));

    const legendWidth = 120;
    const legendHeight = Object.keys(groupedData1).length * 20;
    const legendX = width - legendWidth;
    const legendY = 10;

    const legend = svgContainer
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 120}, 20)`);

    const legendItems = legend
        .selectAll(".legend-item")
        .data(result1)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (d, i) => colorScale(Object.keys(d)[0]));

    legendItems
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("alignment-baseline", "middle")
        .text((d, i) => `${Object.keys(d)[0].split("data")[1]}`);

    result1.forEach((yearData, index) => {
        const yearKey = Object.keys(yearData)[0];
        const data = yearData[yearKey];

        const color = colorScale(yearKey);

        data.forEach((d, i) => {
            const dateArray = d.date.split('-');
            const yearLoop = parseInt(dateArray[0]);
            const monthLoop = parseInt(dateArray[1]) - 1;
            const dayLoop = parseInt(dateArray[2]);

            d.date = new Date(yearLoop, monthLoop, dayLoop);
            d.x = x(i);
            d.y = y(d.SalesAmountCDN);
        });

        const pointerGroup = pointers
            .selectAll(`.pointer-${index}`)
            .data(data)
            .enter()
            .append("g")
            .attr("class", `pointer-group pointer-${index}`);

        pointerGroup
            .append("circle")
            .attr("cx", (d) => x(new Date(d.date).getMonth()) + 35)
            .attr("cy", (d) => y(d.SalesAmountCDN))
            .attr("r", pointerRadius)
            .attr("fill", "steelblue");

        svg
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("d", line);

        const simulation = d3
            .forceSimulation(data)
            .force("x", d3.forceX((d) => x(new Date(d.date).getMonth())).strength(1))
            .force("y", d3.forceY((d) => y(d.SalesAmountCDN)).strength(1))
            .force(
                "collide",
                d3.forceCollide(pointerRadius + distanceBetweenText)
            );

        simulation.alpha(1).restart();
    });

    svg
        .append("g")
        .attr("transform", `translate(0, 320)`)
        .call(d3.axisBottom(x).tickFormat((d) => d3.timeFormat("%b")(new Date(0, d))));

    const yaxis = d3
        .axisLeft(yScaleLeft)
        .ticks(5)
        .tickFormat((d) => formatValue(d));

    svg.append("g").call(yaxis);

}