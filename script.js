let firstTableResult;
let secondTableResult;
let thirdTableResult;
let groupedFirstTableResult;
let groupedSecondTableResult;
let groupedThirdTableResult;
let globalDataResult;

let criteria = [];
let secondTableFilterResult;

let progressBar = document.getElementById('progress');
let progressBarDiv = document.getElementById('progress-bar');

progressBar.style.width = '100%';
window.onload = function () {
  console.log('450');

  const csvURL = '/mainData.csv';

  $(function () {

    var start = moment().subtract(29, 'days');
    var end = moment();

    function cb(start, end) {
      $('#reportrange span').html(start.format('MMMM DD, YYYY') + ' - ' + end.format('MMMM DD, YYYY'));
    }

    $('#reportrange').daterangepicker({
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      },
      "alwaysShowCalendars": true,
      "startDate": "06/06/2023",
      "endDate": "06/12/2023"
    }, function (start, end, label) {
      $('#reportrange span').html(start.format('MMMM DD, YYYY') + ' - ' + end.format('MMMM DD, YYYY'));

      const filteredDataFirstTable = groupedFirstTableResult.filter(obj => {
        const trnYear = obj.TrnYear;
        const trnMonth = obj.TrnMonth;

        return (trnYear == start.format('YYYY-M-D').split('-')[0] && trnMonth >= start.format('YYYY-M-D').split('-')[1]) || (trnYear == end.format('YYYY-M-D').split('-')[0] && trnMonth <= end.format('YYYY-M-D').split('-')[1]);
      });

      const filteredDataSecondTable = groupedSecondTableResult.filter(obj => {
        const trnYear = obj.TrnYear;
        const trnMonth = obj.TrnMonth;

        return (trnYear == start.format('YYYY-M-D').split('-')[0] && trnMonth >= start.format('YYYY-M-D').split('-')[1]) || (trnYear == end.format('YYYY-M-D').split('-')[0] && trnMonth <= end.format('YYYY-M-D').split('-')[1]);
      });

      //console.log(filteredData);

      updateChart(filteredDataFirstTable);
      getFirstTable(filteredDataFirstTable);
      getSecondTable(filteredDataSecondTable);
    });

    cb(start, end);

  });

  let testAllDataFromCSV;


  fetchAndParseCSV(csvURL)
    .then(parsedData => {
      //console.log(parsedData);

      const uniqueArray = [];
      const seen = new Set();

      parsedData.forEach(obj => {
        const objString = JSON.stringify(obj);

        if (!seen.has(objString)) {
          seen.add(objString);
          uniqueArray.push(obj);
        }
      });

      parsedData = uniqueArray;
      globalDataResult = JSON.parse(JSON.stringify(parsedData), parseReviver);

      groupedFirstTableResult = groupJSONFirstTable(parsedData);
      groupedSecondTableResult = groupJSONSecondTable(parsedData);
      groupedThirdTableResult = groupJSONThirdTable(parsedData);

      let uniqueTrnBranchName = [...new Set(groupedFirstTableResult.map(item => item.TrnBranchName))].map(value => {
        return { id: value, text: value };
      });
      let uniqueTrnProductClassDescription = [...new Set(groupedFirstTableResult.map(item => item.TrnProductClassDescription))].map(value => {
        return { id: value, text: value };
      });
      let uniqueArSupplierName = [...new Set(groupedFirstTableResult.map(item => item.ArSupplierName))].map(value => {
        return { id: value, text: value };
      });
      let uniqueSeries = [...new Set(groupedFirstTableResult.map(item => item.Series))].map(value => {
        return { id: value, text: value };
      });
      let uniqueStockCode = [...new Set(groupedFirstTableResult.map(item => item.StockCode))].map(value => {
        return { id: value, text: value };
      });
      let uniqueArCustomerName = [...new Set(groupedFirstTableResult.map(item => item.ArCustomerName))].map(value => {
        return { id: value, text: value };
      });

      //console.log(uniqueTrnBranchName)
      initializeSelect2(uniqueTrnBranchName, 'BranchSalesRep');
      initializeSelect2(uniqueTrnProductClassDescription, 'productClass');
      initializeSelect2(uniqueArSupplierName, 'Supplier');
      initializeSelect2(uniqueSeries, 'productCollection');
      initializeSelect2(uniqueStockCode, 'StockCode');
      initializeSelect2(uniqueArCustomerName, 'Customer');


      firstTableResult = getFirstTable(groupedFirstTableResult);
      secondTableResult = getSecondTable(groupedSecondTableResult);
      //thirdTableResult = getThirdTable(groupedThirdTableResult);

      let firstTableResultDashBoard = getFirstTableDashboard(groupedFirstTableResult);

      document.querySelector('.overlay').style.display = 'none';
      progressBarDiv.style.display = 'none';
    })
    .catch(error => {
      console.error(error);
    });
}

function getFirstTableDashboard(allData) {

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

  // Convert the groupedData object into an array of values for each year
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

  console.log(result1);

  let removeNans = result1.filter(item => {
    const data = Object.values(item)[0];
    return data.every(entry => !isNaN(entry.SalesAmountCDN));
  });

  result1 = removeNans;

  console.log(result1);

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

      const tooltipLeft = mouseX + 240;
      const tooltipTop =
        y(d3.max(dataInRange, (d) => d.SalesAmountCDN)) + 140;

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

function getThirdTable(allData) {
  console.log(allData);

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  let previousMonth = currentMonth - 1;
  let previousYear = currentYear;

  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear--;
  }

  const groupedData = allData.filter(item => item.TrnMonth === previousMonth && item.TrnYear === previousYear);

  console.log(groupedData);

  const result = groupedData.map(allData => {
    const allDataSalesAmt = Math.round(allData.SalesAmt);
    const allDataCostAmt = Math.round(allData.CostAmt);
    const allDataMargin = Math.round(allData.Margin);
    const allDataVariance = Math.round(allData.MarginPct) + '%';

    return {
      ...allData,
      SalesAmtFormatted: formatNumber(allDataSalesAmt),
      CostAmtFormatted: formatNumber(allDataCostAmt),
      MarginFormatted: formatNumber(allDataMargin),
      Variance: allDataVariance
    }

  });

  var table = new Tabulator("#example-table3", {
    height: "auto",
    placeholder: "No Data Available",
    layout: "fitDataFill",
    data: result,
    sortable: true,
    rowHeight: 30,
    columns: [
      { title: "Branch", field: "TrnBranch", responsive: 2 }, //never hide this column
      { title: "Branch Info", field: "TrnBranchName" },
      { title: "Sales Amt", field: "SalesAmtFormatted", responsive: 2, sorter: customNumberSorter }, //hide this column first
      { title: "Cost Amt", field: "CostAmtFormatted", responsive: 2 },
      { title: "Margin", field: "MarginFormatted", hozAlign: "center" },
      { title: "Margin Pct", field: "Variance", hozAlign: "center" },
      { title: "NumInvoices", field: "CountAll", hozAlign: "center" },
    ],
    initialSort: [
      { column: "SalesAmtFormatted", dir: "desc" }
    ]
  });

  setTimeout(function () {
    var tableWidth = table.element.clientWidth;
    var totalColumnWidth = table.columnManager.columns.reduce(function (sum, column) {
      return sum + column.getWidth();
    }, 0);

    var availableWidth = tableWidth - totalColumnWidth;

    var firstColumn = table.columnManager.columns[1];
    var originalFirstColumnWidth = firstColumn.getWidth();

    var newFirstColumnWidth = originalFirstColumnWidth + availableWidth - 30;
    //console.log(newFirstColumnWidth);
    firstColumn.setMinWidth(newFirstColumnWidth);
  }, 100);

  table.on("rowClick", function (e, row) {
    var rowData = row.getData();
    //console.log("Вы нажали на строку:", rowData);
    // Выполните необходимые действия при клике на строку
  });

  return result;
}

function getSecondTable(allData) {

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const lastYear = currentYear - 1;

  const groupedData = {};

  allData.forEach(item => {

    const TrnProductClassDescription = item.TrnProductClassDescription;
    const supplierName = item.ArSupplierName;

    const salesAmount = item.SalesAmountCDN;
    const year = item.TrnYear;
    const month = item.TrnMonth;

    const branch = item.TrnBranch;
    const series = item.Series;
    const stockcode = item.StockCode;

    const branchName = item.TrnBranchName;
    const salesPersonName = item.TrnSalespersonName;
    const customerName = item.ArCustomerName;


    if (!((year === currentYear && month <= currentMonth) || ((year - 1) === lastYear && month <= currentMonth) || ((year + 1) === currentYear && month <= currentMonth))) {
      return;
    }

    if (!groupedData.hasOwnProperty(TrnProductClassDescription)) {
      groupedData[TrnProductClassDescription] = {
        CurrentYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        LastYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        YearToDateCurrentYear: {
          SalesAmountSDN: 0
        },
        YearToDateLastYear: {
          SalesAmountSDN: 0
        },
        _children: {}
      };
    }

    const ClassDescrGroup = groupedData[TrnProductClassDescription];

    if (year === currentYear && month === currentMonth) {
      ClassDescrGroup.CurrentYearMonthCalculated.SalesAmountSDN += salesAmount;
    }

    if (year === lastYear && month === currentMonth) {
      ClassDescrGroup.LastYearMonthCalculated.SalesAmountSDN += salesAmount;
    }

    if (year === currentYear && month <= currentMonth) {
      ClassDescrGroup.YearToDateCurrentYear.SalesAmountSDN += salesAmount;
    }

    if (year === lastYear && month <= currentMonth) {
      ClassDescrGroup.YearToDateLastYear.SalesAmountSDN += salesAmount;
    }

    if (!ClassDescrGroup._children.hasOwnProperty(supplierName)) {
      ClassDescrGroup._children[supplierName] = {
        CurrentYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        LastYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        YearToDateCurrentYear: {
          SalesAmountSDN: 0
        },
        YearToDateLastYear: {
          SalesAmountSDN: 0
        },
        TrnBranch: branch,
        Series: series,
        StockCode: stockcode,
        TrnBranchName: branchName,
        ArCustomerName: customerName,
        TrnSalespersonName: salesPersonName,
        ArSupplierName: supplierName,
      };
    }

    const supplierGroup = ClassDescrGroup._children[supplierName];


    if (year === currentYear && month === currentMonth) {
      supplierGroup.CurrentYearMonthCalculated.SalesAmountSDN += salesAmount;
    }

    if (year === lastYear && month === currentMonth) {
      supplierGroup.LastYearMonthCalculated.SalesAmountSDN += salesAmount;
    }

    if (year === currentYear && month <= currentMonth) {
      supplierGroup.YearToDateCurrentYear.SalesAmountSDN += salesAmount;
    }

    if (year === lastYear && month <= currentMonth) {
      supplierGroup.YearToDateLastYear.SalesAmountSDN += salesAmount;
    }
  });

  const formattedResult = Object.entries(groupedData).map(([TrnProductClassDescription, ClassDescrGroup]) => {
    const salesAmount = ClassDescrGroup.CurrentYearMonthCalculated.SalesAmountSDN;
    const lastYearSalesAmount = ClassDescrGroup.LastYearMonthCalculated.SalesAmountSDN;
    const yearToDateCurrentYearSalesAmount = ClassDescrGroup.YearToDateCurrentYear.SalesAmountSDN;
    const yearToDateLastYearSalesAmount = ClassDescrGroup.YearToDateLastYear.SalesAmountSDN;

    const supplierGroups = Object.entries(ClassDescrGroup._children).map(([supplierName, supplierGroup]) => {
      const salesAmount = supplierGroup.CurrentYearMonthCalculated.SalesAmountSDN;
      const lastYearSalesAmount = supplierGroup.LastYearMonthCalculated.SalesAmountSDN;
      const yearToDateCurrentYearSalesAmount = supplierGroup.YearToDateCurrentYear.SalesAmountSDN;
      const yearToDateLastYearSalesAmount = supplierGroup.YearToDateLastYear.SalesAmountSDN;

      return {
        TrnBranchName: supplierGroup.TrnBranchName,
        ArCustomerName: supplierGroup.ArCustomerName,
        TrnSalespersonName: supplierGroup.TrnSalespersonName,
        TrnBranch: supplierGroup.TrnBranch,
        Series: supplierGroup.Series,
        StockCode: supplierGroup.StockCode,
        ArSupplierName: supplierGroup.ArSupplierName,
        TrnProductClassDescription: supplierName,
        CurrentYearMonthCalculated: salesAmount,
        LastYearMonthCalculated: lastYearSalesAmount,
        YearToDateCurrentYear: yearToDateCurrentYearSalesAmount,
        YearToDateLastYear: yearToDateLastYearSalesAmount,
        SalesAmountSDN: salesAmount
      };
    });

    return {
      TrnProductClassDescription: TrnProductClassDescription,
      CurrentYearMonthCalculated: salesAmount,
      LastYearMonthCalculated: lastYearSalesAmount,
      YearToDateCurrentYear: yearToDateCurrentYearSalesAmount,
      YearToDateLastYear: yearToDateLastYearSalesAmount,
      SalesAmountSDN: salesAmount,
      _children: supplierGroups
    };
  }).filter(ClassDescrGroup => ClassDescrGroup.TrnProductClassDescription !== undefined && ClassDescrGroup.TrnProductClassDescription !== "LastYearMonthCalculated");

  const result = formattedResult.map(customer => {
    const customerCurrentYearMonthCalculated = Math.round(customer.CurrentYearMonthCalculated);
    const customerLastYearMonthCalculated = Math.round(customer.LastYearMonthCalculated);
    const customerVarianceFormatted = calculateVariancePercentage(customerLastYearMonthCalculated, customerCurrentYearMonthCalculated);
    const customerYearToDateCurrentYear = Math.round(customer.YearToDateCurrentYear);
    const customerYearToDateLastYear = Math.round(customer.YearToDateLastYear);
    const customerYearToDateVariance = calculateVariancePercentage(customerYearToDateLastYear, customerYearToDateCurrentYear);

    const resultChild = customer._children.map(client => {
      const clientCurrentYearMonthCalculated = Math.round(client.CurrentYearMonthCalculated);
      const clientLastYearMonthCalculated = Math.round(client.LastYearMonthCalculated);
      const clientYearToDateCurrentYear = Math.round(client.YearToDateCurrentYear);
      const clientYearToDateLastYear = Math.round(client.YearToDateLastYear);
      const clientVariance = calculateVariancePercentage(clientLastYearMonthCalculated, clientCurrentYearMonthCalculated);
      const clientYearToDateVariance = calculateVariancePercentage(clientYearToDateLastYear, clientYearToDateCurrentYear);
      return {
        ...client,
        CurrentYearMonthCalculated: formatNumber(clientCurrentYearMonthCalculated),
        LastYearMonthCalculated: formatNumber(clientLastYearMonthCalculated),
        YearToDateCurrentYear: formatNumber(clientYearToDateCurrentYear),
        YearToDateLastYear: formatNumber(clientYearToDateLastYear),
        Variance: clientVariance,
        YearToDateVariance: clientYearToDateVariance
      }
    });

    return {
      ...customer,
      CurrentYearMonthCalculated: formatNumber(customerCurrentYearMonthCalculated),
      LastYearMonthCalculated: formatNumber(customerLastYearMonthCalculated),
      YearToDateCurrentYear: formatNumber(customerYearToDateCurrentYear),
      YearToDateLastYear: formatNumber(customerYearToDateLastYear),
      Variance: customerVarianceFormatted,
      YearToDateVariance: customerYearToDateVariance,
      _children: resultChild
    }

  });

  var table = new Tabulator("#example-table2", {
    height: "300",
    layout: "fitDataFill",
    data: result,
    dataTree: true,
    sortable: true,
    dataTreeStartExpanded: false,
    rowHeight: 30,
    rowFormatter: function (row) {

      var tableWidth = table.element.clientWidth;
      var totalColumnWidth = table.columnManager.columns.reduce(function (sum, column) {
        return sum + column.getWidth();
      }, 0);

      var availableWidth = tableWidth - totalColumnWidth;

      var firstColumn = table.columnManager.columns[0];

      var originalFirstColumnWidth = firstColumn.getWidth();

      var newFirstColumnWidth = originalFirstColumnWidth + availableWidth;

      var cells = row.getCells();
      var firstCell = cells[0];
      firstCell.getElement().style.minWidth = newFirstColumnWidth - 25 + 'px';


      return row;
    },
    columns: [
      {
        titleFormatter: buttonHeaderRenderer, titleFormatterParams: {
          branchName: "TrnProductClassDescription",
        }, field: "TrnProductClassDescription", bottomCalc: customBottomCalc, bottomCalcParams: { label: 1 }
      },
      { title: "LY M.", field: "LastYearMonthCalculated", sorter: customNumberSorter, bottomCalc: customBottomCalc },
      { title: "CY M.", field: "CurrentYearMonthCalculated", responsive: 2, bottomCalc: customBottomCalc }, //hide this column first
      { title: "Variance", field: "Variance", formatter: progressBarFormatter, formatterParams: { max: 100 }, bottomCalc: customBottomCalc },
      { title: "YTD LY", field: "YearToDateLastYear", hozAlign: "center", bottomCalc: customBottomCalc },
      { title: "YTD CY", field: "YearToDateCurrentYear", hozAlign: "center", bottomCalc: customBottomCalc },
      { title: "Var YTD", field: "YearToDateVariance", formatter: progressBarFormatter, formatterParams: { max: 100 }, bottomCalc: customBottomCalc },
    ],
    initialSort: [
      { column: "LastYearMonthCalculated", dir: "desc" }
    ]
  });

  table.on("rowClick", function (e, row) {
    var rowData = row.getData();

    if (rowData.hasOwnProperty('_children')) {
      let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'TrnProductClassDescription', rowData.TrnProductClassDescription);
      let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'TrnProductClassDescription', rowData.TrnProductClassDescription);

      let resultFirstTable = getFirstTable(filterByClickFirstTable);
      let resultSecondTable = getSecondTable(filterByClickSecondTable);
      updateChart(filterByClickFirstTable);
    } else {
      let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'ArSupplierName', rowData.ArSupplierName);
      let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'ArSupplierName', rowData.ArSupplierName);

      let resultFirstTable = getFirstTable(filterByClickFirstTable);
      let resultSecondTable = getSecondTable(filterByClickSecondTable);
      updateChart(filterByClickFirstTable);
    }

  });

  return result;

}

function getFirstTable(allData) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const lastYear = currentYear - 1;

  const groupedData = {};

  allData.forEach(item => {
    const branchName = item.TrnBranchName;
    const classDescription = item.Categories;
    const salespersonName = item.TrnSalespersonName;
    const salesAmount = item.SalesAmountCDN;
    const customerName = item.ArCustomerName;
    const year = item.TrnYear;
    const month = item.TrnMonth;

    const productClassDescription = item.TrnProductClassDescription;
    const branch = item.TrnBranch;
    const series = item.Series;
    const stockcode = item.StockCode;
    const supplierName = item.ArSupplierName;

    if (!groupedData.hasOwnProperty(branchName)) {
      groupedData[branchName] = {};
    }
    const branchGroup = groupedData[branchName];

    if (!branchGroup.hasOwnProperty(classDescription)) {
      branchGroup[classDescription] = {};
    }
    const classGroup = branchGroup[classDescription];

    if (!classGroup.hasOwnProperty(salespersonName)) {
      classGroup[salespersonName] = {
        CurrentYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        LastYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        YearToDateCurrentYear: {
          SalesAmountSDN: 0
        },
        YearToDateLastYear: {
          SalesAmountSDN: 0
        }
      };
    }
    const salespersonGroup = classGroup[salespersonName];

    if (!salespersonGroup.hasOwnProperty(customerName)) {
      salespersonGroup[customerName] = {
        CurrentYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        LastYearMonthCalculated: {
          SalesAmountSDN: 0
        },
        YearToDateCurrentYear: {
          SalesAmountSDN: 0
        },
        YearToDateLastYear: {
          SalesAmountSDN: 0
        }
      };
    }
    const customerGroup = salespersonGroup[customerName];

    // Filter for the current year and month
    if (year === currentYear && month === currentMonth) {
      customerGroup.CurrentYearMonthCalculated.SalesAmountSDN += salesAmount;
    }

    // Filter for the last year and month
    if (year === lastYear && month === currentMonth) {
      customerGroup.LastYearMonthCalculated.SalesAmountSDN += salesAmount;
    }

    // Filter for the year-to-date current year
    if (year === currentYear && month <= currentMonth) {
      customerGroup.YearToDateCurrentYear.SalesAmountSDN += salesAmount;
    }

    // Filter for the year-to-date last year
    if (year === lastYear && month <= currentMonth) {
      customerGroup.YearToDateLastYear.SalesAmountSDN += salesAmount;
    }

    customerGroup.TrnProductClassDescription = productClassDescription;
    customerGroup.TrnBranch = branch;
    customerGroup.Series = series;
    customerGroup.StockCode = stockcode;
    customerGroup.ArSupplierName = supplierName;
    customerGroup.ArCustomerName = customerName;

  });

  //console.log(groupedData);

  const result = Object.entries(groupedData).map(([branchName, branchGroup]) => {
    const classGroups = Object.entries(branchGroup).map(([classDescription, classGroup]) => {
      const salespersonGroups = Object.entries(classGroup).map(([salespersonName, salespersonGroup]) => {
        const customers = Object.entries(salespersonGroup).map(([customerName, customerGroup]) => {
          const currentYearMonthSales = customerGroup.CurrentYearMonthCalculated?.SalesAmountSDN || 0;
          const lastYearMonthSales = customerGroup.LastYearMonthCalculated?.SalesAmountSDN || 0;
          const yearToDateCurrentYearSales = customerGroup.YearToDateCurrentYear?.SalesAmountSDN || 0;
          const yearToDateLastYearSales = customerGroup.YearToDateLastYear?.SalesAmountSDN || 0;
          return {
            TrnBranchName: customerName !== "CurrentYearMonthCalculated" ? customerName : undefined,
            CurrentYearMonthCalculated: currentYearMonthSales,
            LastYearMonthCalculated: lastYearMonthSales,
            YearToDateCurrentYear: yearToDateCurrentYearSales,
            YearToDateLastYear: yearToDateLastYearSales,
            TrnProductClassDescription: customerGroup.TrnProductClassDescription,
            TrnBranch: customerGroup.TrnBranch,
            Series: customerGroup.Series,
            StockCode: customerGroup.StockCode,
            ArSupplierName: customerGroup.ArSupplierName,
            ArCustomerName: customerGroup.ArCustomerName
          };
        }).filter(customer => customer.TrnBranchName !== undefined && customer.TrnBranchName !== "LastYearMonthCalculated");

        const salesAmount = customers.reduce((total, customer) => total + customer.CurrentYearMonthCalculated, 0);
        const lastYearSalesAmount = customers.reduce((total, customer) => total + customer.LastYearMonthCalculated, 0);
        const yearToDateCurrentYearSalesAmount = customers.reduce((total, customer) => total + customer.YearToDateCurrentYear, 0);
        const yearToDateLastYearSalesAmount = customers.reduce((total, customer) => total + customer.YearToDateLastYear, 0);

        return {
          TrnBranchName: salespersonName !== "CurrentYearMonthCalculated" ? salespersonName : undefined,
          CurrentYearMonthCalculated: salesAmount,
          LastYearMonthCalculated: lastYearSalesAmount,
          YearToDateCurrentYear: yearToDateCurrentYearSalesAmount,
          YearToDateLastYear: yearToDateLastYearSalesAmount,
          SalesAmountSDN: salesAmount,
          CurrentYearMonth: `${currentMonth.toString().padStart(2, "0")}.${currentYear}`,
          _children: customers
        };
      }).filter(salesperson => salesperson.TrnBranchName !== undefined && salesperson.TrnBranchName !== "LastYearMonthCalculated");

      const categorySalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.SalesAmountSDN, 0);
      const categoryLastYearSalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.LastYearMonthCalculated, 0);
      const categoryYearToDateCurrentYearSalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.YearToDateCurrentYear, 0);
      const categoryYearToDateLastYearSalesAmount = salespersonGroups.reduce((total, salespersonGroup) => total + salespersonGroup.YearToDateLastYear, 0);

      return {
        TrnBranchName: classDescription !== "CurrentYearMonthCalculated" ? classDescription : undefined,
        CurrentYearMonthCalculated: categorySalesAmount,
        LastYearMonthCalculated: categoryLastYearSalesAmount,
        YearToDateCurrentYear: categoryYearToDateCurrentYearSalesAmount,
        YearToDateLastYear: categoryYearToDateLastYearSalesAmount,
        SalesAmountSDN: categorySalesAmount,
        CurrentYearMonth: `${currentMonth.toString().padStart(2, "0")}.${currentYear}`,
        _children: salespersonGroups
      };
    }).filter(classGroup => classGroup.TrnBranchName !== undefined && classGroup.TrnBranchName !== "LastYearMonthCalculated");

    const branchSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.SalesAmountSDN, 0);
    const branchLastYearSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.LastYearMonthCalculated, 0);
    const branchYearToDateCurrentYearSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.YearToDateCurrentYear, 0);
    const branchYearToDateLastYearSalesAmount = classGroups.reduce((total, classGroup) => total + classGroup.YearToDateLastYear, 0);

    return {
      TrnBranchName: branchName !== "CurrentYearMonthCalculated" ? branchName : undefined,
      CurrentYearMonthCalculated: branchSalesAmount,
      LastYearMonthCalculated: branchLastYearSalesAmount,
      YearToDateCurrentYear: branchYearToDateCurrentYearSalesAmount,
      YearToDateLastYear: branchYearToDateLastYearSalesAmount,
      SalesAmountSDN: branchSalesAmount,
      CurrentYearMonth: `${currentMonth.toString().padStart(2, "0")}.${currentYear}`,
      _children: classGroups
    };
  }).filter(branch => branch.TrnBranchName !== undefined && branch.TrnBranchName !== "LastYearMonthCalculated");
  // Round and format the values

  //console.log(result);

  const formattedResult = result.map(branch => {
    const branchSalesAmount = Math.round(branch.CurrentYearMonthCalculated);
    const branchLastYearSalesAmount = Math.round(branch.LastYearMonthCalculated);
    const branchYearToDateCurrentYearSalesAmount = Math.round(branch.YearToDateCurrentYear);
    const branchYearToDateLastYearSalesAmount = Math.round(branch.YearToDateLastYear);
    const variance = calculateVariancePercentage(branchLastYearSalesAmount, branchSalesAmount);
    const yearToDateVariance = calculateVariancePercentage(branchYearToDateLastYearSalesAmount, branchYearToDateCurrentYearSalesAmount);

    const formattedClassGroups = branch._children.map(classGroup => {
      const salesAmount = Math.round(classGroup.CurrentYearMonthCalculated);
      const lastYearSalesAmount = Math.round(classGroup.LastYearMonthCalculated);
      const yearToDateCurrentYearSalesAmount = Math.round(classGroup.YearToDateCurrentYear);
      const yearToDateLastYearSalesAmount = Math.round(classGroup.YearToDateLastYear);
      const categoryVariance = calculateVariancePercentage(lastYearSalesAmount, salesAmount);
      const categoryYearToDateVariance = calculateVariancePercentage(yearToDateLastYearSalesAmount, yearToDateCurrentYearSalesAmount);

      const formattedSalespersonGroups = classGroup._children.map(salespersonGroup => {
        const currentYearMonthSales = Math.round(salespersonGroup.CurrentYearMonthCalculated);
        const lastYearMonthSales = Math.round(salespersonGroup.LastYearMonthCalculated);
        const yearToDateCurrentYearSales = Math.round(salespersonGroup.YearToDateCurrentYear);
        const yearToDateLastYearSales = Math.round(salespersonGroup.YearToDateLastYear);
        const salesVariance = calculateVariancePercentage(lastYearMonthSales, currentYearMonthSales);
        const yearToDateSalesVariance = calculateVariancePercentage(yearToDateLastYearSales, yearToDateCurrentYearSales);

        const formattedCustomers = salespersonGroup._children.map(customer => {
          const currentYearMonthSales = Math.round(customer.CurrentYearMonthCalculated);
          const lastYearMonthSales = Math.round(customer.LastYearMonthCalculated);
          const yearToDateCurrentYearSales = Math.round(customer.YearToDateCurrentYear);
          const yearToDateLastYearSales = Math.round(customer.YearToDateLastYear);
          const customerVariance = calculateVariancePercentage(lastYearMonthSales, currentYearMonthSales);
          const customerYearToDateVariance = calculateVariancePercentage(yearToDateLastYearSales, yearToDateCurrentYearSales);
          return {
            ...customer,
            CurrentYearMonthCalculated: formatNumber(currentYearMonthSales),
            LastYearMonthCalculated: formatNumber(lastYearMonthSales),
            YearToDateCurrentYear: formatNumber(yearToDateCurrentYearSales),
            YearToDateLastYear: formatNumber(yearToDateLastYearSales),
            Variance: customerVariance,
            YearToDateVariance: customerYearToDateVariance,
            level: '4'
          };
        });

        return {
          ...salespersonGroup,
          CurrentYearMonthCalculated: formatNumber(currentYearMonthSales),
          LastYearMonthCalculated: formatNumber(lastYearMonthSales),
          YearToDateCurrentYear: formatNumber(yearToDateCurrentYearSales),
          YearToDateLastYear: formatNumber(yearToDateLastYearSales),
          Variance: salesVariance,
          YearToDateVariance: yearToDateSalesVariance,
          level: '3',
          _children: formattedCustomers
        };
      });

      return {
        ...classGroup,
        CurrentYearMonthCalculated: formatNumber(salesAmount),
        LastYearMonthCalculated: formatNumber(lastYearSalesAmount),
        YearToDateCurrentYear: formatNumber(yearToDateCurrentYearSalesAmount),
        YearToDateLastYear: formatNumber(yearToDateLastYearSalesAmount),
        Variance: categoryVariance,
        YearToDateVariance: categoryYearToDateVariance,
        level: '2',
        _children: formattedSalespersonGroups
      };
    });

    return {
      ...branch,
      CurrentYearMonthCalculated: formatNumber(branchSalesAmount),
      LastYearMonthCalculated: formatNumber(branchLastYearSalesAmount),
      YearToDateCurrentYear: formatNumber(branchYearToDateCurrentYearSalesAmount),
      YearToDateLastYear: formatNumber(branchYearToDateLastYearSalesAmount),
      Variance: variance,
      YearToDateVariance: yearToDateVariance,
      level: '1',
      _children: formattedClassGroups
    };
  });

  // console.log(result);
  // console.log(formattedResult);

  const filteredResult = formattedResult.map(branch => {
    const filteredClassGroups = branch._children.filter(classGroup => {
      const filteredSalesPersonGroup = classGroup._children.filter(salespersonGroup => {
        const filteredCustomers = salespersonGroup._children.filter(customerGroup => {
          return (
            customerGroup.CurrentYearMonthCalculated !== "0 K" ||
            customerGroup.LastYearMonthCalculated !== "0 K" ||
            customerGroup.Variance !== "0%" ||
            customerGroup.YearToDateCurrentYear !== "0 K" ||
            customerGroup.YearToDateLastYear !== "0 K" ||
            customerGroup.YearToDateVariance !== "0%"
          );
        });
        salespersonGroup._children = filteredCustomers;
        return filteredCustomers.length > 0;
      });
      classGroup._children = filteredSalesPersonGroup;
      return filteredSalesPersonGroup.length > 0;
    });

    return {
      ...branch,
      _children: filteredClassGroups
    };
  }).filter(branch => branch._children.length > 0);

  //console.log(filteredResult[0]);

  var table = new Tabulator("#example-table", {
    height: "300",
    layout: "fitDataFill",
    data: filteredResult,
    dataTree: true,
    dataTreeStartExpanded: false,
    reactiveData: true,
    sortable: true,
    virtualDomBuffer: 100,
    rowHeight: 30,
    rowFormatter: function (row) {

      var tableWidth = table.element.clientWidth;
      var totalColumnWidth = table.columnManager.columns.reduce(function (sum, column) {
        return sum + column.getWidth();
      }, 0);

      var availableWidth = tableWidth - totalColumnWidth;

      var firstColumn = table.columnManager.columns[0];

      var originalFirstColumnWidth = firstColumn.getWidth();

      var newFirstColumnWidth = originalFirstColumnWidth + availableWidth;

      var cells = row.getCells();
      var firstCell = cells[0];
      firstCell.getElement().style.minWidth = newFirstColumnWidth - 25 + 'px';


      return row;
    },
    columns: [
      {
        titleFormatter: buttonHeaderRenderer, titleFormatterParams: {
          branchName: "TrnBranchName",
        }, field: "TrnBranchName", responsive: 2, bottomCalc: customBottomCalc, bottomCalcParams: { label: 1 }, headerSort: false
      }, //never hide this column
      { title: "LY M.", field: "LastYearMonthCalculated", sorter: customNumberSorter, bottomCalc: customBottomCalc },
      { title: "CY M.", field: "CurrentYearMonthCalculated", responsive: 2, bottomCalc: customBottomCalc }, //hide this column first
      { title: "Variance", field: "Variance", formatter: progressBarFormatter, formatterParams: { max: 100 }, bottomCalc: customBottomCalc },
      { title: "YTD LY", field: "YearToDateLastYear", hozAlign: "center", bottomCalc: customBottomCalc },
      { title: "YTD CY", field: "YearToDateCurrentYear", hozAlign: "center", bottomCalc: customBottomCalc },
      { title: "Var YTD", field: "YearToDateVariance", formatter: progressBarFormatter, formatterParams: { max: 100 }, bottomCalc: customBottomCalc },
    ],
    initialSort: [
      { column: "LastYearMonthCalculated", dir: "desc" }
    ]
  });

  table.on("rowClick", function (e, row) {
    var rowData = row.getData();
    //console.log(rowData)
    if (rowData.level == '1') {
      let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'TrnBranchName', rowData.TrnBranchName);
      let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'TrnBranchName', rowData.TrnBranchName);

      let resultFirstTable = getFirstTable(filterByClickFirstTable);
      let resultSecondTable = getSecondTable(filterByClickSecondTable);
      updateChart(filterByClickFirstTable);
    } else if (rowData.level == '2') {

      let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'Categories', rowData.TrnBranchName);
      //let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'ArSupplierName', rowData.ArSupplierName);

      let resultFirstTable = getFirstTable(filterByClickFirstTable);
      //let resultSecondTable = getSecondTable(filterByClickSecondTable);
      updateChart(filterByClickFirstTable);
    } else if (rowData.level == '3') {
      let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'TrnSalespersonName', rowData.TrnBranchName);
      let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'TrnSalespersonName', rowData.TrnBranchName);

      let resultFirstTable = getFirstTable(filterByClickFirstTable);
      let resultSecondTable = getSecondTable(filterByClickSecondTable);
      updateChart(filterByClickFirstTable);
    } else if (rowData.level = '4') {
      let filterByClickFirstTable = findObjectsByProperty(groupedFirstTableResult, 'ArCustomerName', rowData.TrnBranchName);
      let filterByClickSecondTable = findObjectsByProperty(groupedSecondTableResult, 'ArCustomerName', rowData.TrnBranchName);

      let resultFirstTable = getFirstTable(filterByClickFirstTable);
      let resultSecondTable = getSecondTable(filterByClickSecondTable);
      updateChart(filterByClickFirstTable);
    }
  });

  return filteredResult;

}

function formatNumber(number) {
  let a = `${(number / 1000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} K`;
  return a;
}

function calculateVariancePercentage(lastYearValue, currentValue) {
  if (lastYearValue === 0 && currentValue > 0) {
    return "+100%";
  } else if (lastYearValue === 0 && currentValue < 0) {
    return "-100%";
  } else if (lastYearValue === 0 && currentValue === 0) {
    return "0%";
  } else {
    const variance = currentValue - lastYearValue;
    const percentage = (variance / lastYearValue) * 100;
    return percentage.toFixed(2) + "%";
  }
}

function progressBarFormatter(cell, formatterParams, onRendered) {
  var value = cell.getValue();
  var max = formatterParams.max || 100;

  var percentage = (parseFloat(value) / max) * 100;
  percentage = Math.min(Math.max(percentage, 0), 100);

  //var progressBar = '<div class="progress-bar"><div class="progress-bar-inner" style="width:' + percentage + '%"></div></div>';
  var valueText = '<div class="progress-value">' + value + '</div>';

  let style = '';

  if (Number(value.split('.')[0]) > 0) {
    style = 'position: absolute; top: 7px; right: 55px; width: 15px; height: 15px; fill: green;';
  } else {
    style = 'position: absolute; top: 7px; right: 55px; width: 15px; height: 15px; fill: red; transform: rotate(180deg);';
  }

  var arrow = `<svg style="${style}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z"></path></g></svg>`;

  var output = arrow + valueText;

  return output;
}

function formatValue(value) {
  const million = 1000000;
  const thousands = 1000;
  if (value >= million) {
    const shortenedValue = (value / million).toFixed(1);
    return `${shortenedValue} m`;
  } else if (value >= thousands) {
    const shortenedValue = (value / thousands).toFixed(1);
    return `${shortenedValue} k`;
  } else {
    return value.toFixed(2);
  }
}

function filterFirstTable(selectElement, field) {
  var selectedOption = selectElement.value;
  let resultFirstTable;
  let resultSecondTable;
  let resultThirdTable;

  document.querySelectorAll('select').forEach(element => {
    if (element.value !== '') {
      if (element.value === 'all') {
        criteria = criteria.filter(item => item.key !== field);
      } else {
        const index = criteria.findIndex(item => item.key === field);
        if (index !== -1) {
          criteria[index].value = element.value;
        } else {
          const exists = criteria.some(item => item.value === element.value);
          if (!exists) {
            criteria.push({ "key": field, "value": element.value });
          }
        }
      }
    } else {
      console.log('empty');
    }
  });

  if (criteria.length == 0) {
    getFirstTable(groupedFirstTableResult);
    getSecondTable(groupedSecondTableResult);
    updateChart(groupedFirstTableResult);
  } else {
    const targetElementFirstTable = findObjectsByPropertyArray(groupedFirstTableResult, criteria);
    const targetElementSecondTable = findObjectsByPropertyArray(groupedSecondTableResult, criteria);
    const targetElementThirdTable = findObjectsByPropertyArray(globalDataResult, criteria);

    let grouping = groupJSONThirdTable(targetElementThirdTable);

    console.log(globalDataResult);
    console.log(criteria);

    resultFirstTable = getFirstTable(targetElementFirstTable);
    resultSecondTable = getSecondTable(targetElementSecondTable);
    resultThirdTable = getThirdTable(grouping);
    updateChart(targetElementFirstTable);
  }
}

function parseReviver(key, value) {
  if (typeof value === 'string') {
    return value.replace(/"/g, '');
  }
  return value;
}

function findObjectsByPropertyArray(arr, criteria) {
  return arr.filter(obj => {
    return criteria.every(criterion => obj[criterion.key] === criterion.value);
  });
}

function findObjectsByProperty(arr, key, value) {
  return arr.filter(obj => obj[key] === value);
}

function parseCSV(csvData) {
  const lines = csvData.split('\n');

  const headers = lines[0].split('|');

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split('|');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j];
    }

    result.push(obj);
  }

  return result;
}

function fetchAndParseCSV(url) {
  return fetch(url)
    .then(response => {
      var reader = response.body.getReader();
      var totalBytes = response.headers.get('Content-Length');
      var loadedBytes = 0;
      var chunks = [];

      function read() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            return chunks;
          }

          loadedBytes += value.length;
          var percentComplete = (loadedBytes / totalBytes) * 100;
          progressBar.style.width = percentComplete + '%';

          chunks.push(value);
          return read();
        });
      }

      return read()
        .then(chunks => {
          var concatenatedChunks = new Uint8Array(loadedBytes);
          var offset = 0;

          for (var i = 0; i < chunks.length; i++) {
            concatenatedChunks.set(chunks[i], offset);
            offset += chunks[i].length;
          }

          return new TextDecoder('utf-8').decode(concatenatedChunks);
        })
        .finally(() => reader.releaseLock());
    })
    .then(csvData => parseCSV(csvData));
}

function groupJSONFirstTable(inputObj) {
  const groupedData = inputObj.reduce((result, obj) => {
    const {
      TrnBranchName,
      SaleAmountCDN,
      ArCustomerName,
      SupplierName,
      TrnSalespersonName,
      InvoiceDateChar,
      TrnProductClassDescription,
      TrnBranch,
      Series,
      StockCode,
    } = obj;

    const invoiceDate = new Date(InvoiceDateChar);
    const TrnYear = invoiceDate.getFullYear();
    const TrnMonth = invoiceDate.getMonth() + 1;

    let trimmedTrnBranchName;
    let trimmedTrnSalespersonName;
    let trimmedCustomerName;
    let trimmedProductClassDescription;
    let trimmedTrnBranch;
    let trimmedSeries;
    let trimmedStockCode;
    let trimmedSupplierName;

    if (TrnBranchName) {
      trimmedTrnBranchName = TrnBranchName.replace(/\\/g, '').replace(/"/g, '');
    }
    if (TrnSalespersonName) {
      trimmedTrnSalespersonName = TrnSalespersonName.replace(/\\/g, '').replace(/"/g, '');
    }
    if (ArCustomerName) {
      trimmedCustomerName = ArCustomerName.replace(/\\/g, '').replace(/"/g, '');
    }
    if (TrnProductClassDescription) {
      trimmedProductClassDescription = TrnProductClassDescription.replace(/\\/g, '').replace(/"/g, '');
    }
    if (TrnBranch) {
      trimmedTrnBranch = TrnBranch.replace(/\\/g, '').replace(/"/g, '');
    }
    if (Series) {
      trimmedSeries = Series.replace(/\\/g, '').replace(/"/g, '');
    }
    if (StockCode) {
      trimmedStockCode = StockCode.replace(/\\/g, '').replace(/"/g, '');
    }
    if (SupplierName) {
      trimmedSupplierName = SupplierName.replace(/\\/g, '').replace(/"/g, '');
    }

    const Categories = determineCategory(TrnSalespersonName, TrnBranchName);

    const key = `${TrnBranchName}-${Categories}-${ArCustomerName}-${TrnSalespersonName}-${TrnYear}-${TrnMonth}-${InvoiceDateChar}`;

    if (!result[key]) {
      result[key] = {
        TrnBranchName: trimmedTrnBranchName,
        SalesAmountCDN: parseFloat(SaleAmountCDN),
        Categories,
        ArSupplierName: trimmedSupplierName,
        ArCustomerName: trimmedCustomerName,
        TrnSalespersonName: trimmedTrnSalespersonName,
        TrnYear,
        TrnMonth,
        InvoiceDateChar,
        TrnProductClassDescription: trimmedProductClassDescription,
        TrnBranch: trimmedTrnBranch,
        Series: trimmedSeries,
        StockCode: trimmedStockCode,
      };
    } else {
      result[key].SalesAmountCDN += parseFloat(SaleAmountCDN);
    }

    return result;
  }, {});

  const outputArr = Object.values(groupedData);

  return outputArr;
}


function groupJSONSecondTable(inputObj) {
  const groupedData = inputObj.reduce((result, obj) => {
    const {
      TrnProductClassDescription,
      TrnSalespersonName,
      ArCustomerName,
      SupplierName,
      SaleAmountCDN,
      InvoiceDateChar,
      TrnBranchName,
      TrnBranch,
      Series,
      StockCode,
    } = obj;

    const invoiceDate = new Date(InvoiceDateChar);
    const TrnYear = invoiceDate.getFullYear();
    const TrnMonth = invoiceDate.getMonth() + 1;

    let trimmedTrnBranchName;
    let trimmedTrnSalespersonName;
    let trimmedCustomerName;
    let trimmedProductClassDescription;
    let trimmedTrnBranch;
    let trimmedSeries;
    let trimmedStockCode;
    let trimmedSupplierName;

    if (TrnBranchName) {
      trimmedTrnBranchName = TrnBranchName.replace(/\\/g, '').replace(/"/g, '');
    }
    if (TrnSalespersonName) {
      trimmedTrnSalespersonName = TrnSalespersonName.replace(/\\/g, '').replace(/"/g, '');
    }
    if (ArCustomerName) {
      trimmedCustomerName = ArCustomerName.replace(/\\/g, '').replace(/"/g, '');
    }
    if (TrnProductClassDescription) {
      trimmedProductClassDescription = TrnProductClassDescription.replace(/\\/g, '').replace(/"/g, '');
    }
    if (TrnBranch) {
      trimmedTrnBranch = TrnBranch.replace(/\\/g, '').replace(/"/g, '');
    }
    if (Series) {
      trimmedSeries = Series.replace(/\\/g, '').replace(/"/g, '');
    }
    if (StockCode) {
      trimmedStockCode = StockCode.replace(/\\/g, '').replace(/"/g, '');
    }
    if (SupplierName) {
      trimmedSupplierName = SupplierName.replace(/\\/g, '').replace(/"/g, '');
    }

    const key = `${TrnProductClassDescription}-${SupplierName}-${TrnYear}-${TrnMonth}`;

    if (!result[key]) {
      result[key] = {
        TrnProductClassDescription: trimmedProductClassDescription,
        ArSupplierName: trimmedSupplierName,
        SalesAmountCDN: parseFloat(SaleAmountCDN),
        TrnYear,
        TrnMonth,
        ArCustomerName: trimmedCustomerName,
        TrnSalespersonName: trimmedTrnSalespersonName,
        TrnBranchName: trimmedTrnBranchName,
        TrnBranch: trimmedTrnBranch,
        Series: trimmedSeries,
        StockCode: trimmedStockCode,
      };
    } else {
      result[key].SalesAmountCDN += parseFloat(SaleAmountCDN);
    }

    return result;
  }, {});

  const outputArr = Object.values(groupedData);

  return outputArr;
}


function groupJSONThirdTable(inputObj) {

  console.log(inputObj);

  const groupedData = inputObj.reduce((result, obj) => {
    const {
      TrnBranch,
      TrnBranchName,
      SaleAmountCDN,
      CostAmtCDN,
      InvoiceDateChar,
    } = obj;

    let dateArray = InvoiceDateChar.split('-');
    let year = parseInt(dateArray[0]);
    let month = parseInt(dateArray[1]) - 1;
    let day = parseInt(dateArray[2]);

    const invoiceDate = new Date(year, month, day);
    const TrnYear = invoiceDate.getFullYear();
    const TrnMonth = invoiceDate.getMonth() + 1;

    const key = `${TrnBranch}-${TrnBranchName}-${TrnYear}-${TrnMonth}`;

    if (!result[key]) {
      result[key] = {
        TrnBranch,
        TrnBranchName,
        SalesAmt: parseFloat(SaleAmountCDN),
        CostAmt: parseFloat(CostAmtCDN),
        CountAll: 1,
        Margin: parseFloat(SaleAmountCDN) - parseFloat(CostAmtCDN),
        MarginPct: ((parseFloat(SaleAmountCDN) - parseFloat(CostAmtCDN)) / parseFloat(SaleAmountCDN)) * 100,
        TrnYear,
        TrnMonth,
      };
    } else {
      result[key].SalesAmt += parseFloat(SaleAmountCDN);
      result[key].CostAmt += parseFloat(CostAmtCDN);
      result[key].CountAll++;
      result[key].Margin += parseFloat(SaleAmountCDN) - parseFloat(CostAmtCDN);
      result[key].MarginPct = (result[key].Margin / result[key].SalesAmt) * 100;
    }

    return result;
  }, {});

  const outputArr = Object.values(groupedData);

  console.log(outputArr);
  return outputArr;
}


function determineCategory(salespersonName, TrnBranchName) {
  if (salespersonName) {
    let trimmedData = salespersonName.replace(/\\/g, '').replace(/"/g, '');
    if (
      trimmedData === "AMANDA LABATTE-DAWE" ||
      trimmedData === "SHAMANNA KELAMANGALAM"
    ) {
      return "Architectural";
    } else if (
      trimmedData === "GRACE FARROW" ||
      trimmedData === "LUC TREMBLAY" ||
      trimmedData === "MIKE SIMONIN" ||
      trimmedData === "SAM VECIA" ||
      trimmedData === "SARA RAJIC"
    ) {
      return "Distribution";
    } else if (trimmedData === "HOUSE ACCOUNT") {
      return "HOUSE ACCOUNT (HOU)";
    } else if (trimmedData === "TILEMASTER HOUSE ACCOUNT") {
      return "TILEMASTER HOUSE ACCOUNT (HSE)";
    } else if (
      trimmedData === "500 ACCOUNTS" ||
      trimmedData === "HOUSE" ||
      trimmedData === "MIKE RIEL" ||
      trimmedData === "STEVAN UZELAC" ||
      trimmedData === "TERRY AHERN" ||
      trimmedData === "TILEASTER HOUSE ACCT" ||
      trimmedData === "TILEMASTER HOUSE ACCT" ||
      trimmedData === "JOHN DAVISON"
    ) {
      return "Other";
    }
  }

  return "Unknown";
}

function initializeSelect2(items, elementId) {

  pageSize = 50

  items.unshift({ id: 'all', text: 'ALL' });

  jQuery.fn.select2.amd.require(["select2/data/array", "select2/utils"],

    function (ArrayData, Utils) {
      function CustomData($element, options) {
        CustomData.__super__.constructor.call(this, $element, options);
      }
      Utils.Extend(CustomData, ArrayData);

      CustomData.prototype.query = function (params, callback) {

        results = [];
        if (params.term && params.term !== '') {
          results = _.filter(items, function (e) {
            return e.text.toUpperCase().indexOf(params.term.toUpperCase()) >= 0;
          });
        } else {
          results = items;
        }

        if (!("page" in params)) {
          params.page = 1;
        }
        var data = {};
        data.results = results.slice((params.page - 1) * pageSize, params.page * pageSize);
        data.pagination = {};
        data.pagination.more = params.page * pageSize < results.length;
        callback(data);
      };

      $('#' + elementId).select2({
        ajax: {},
        dataAdapter: CustomData
      });
    })
}

function updateChart(allData) {
  // Очистите существующий график перед обновлением
  d3.select("#dashboard").selectAll("svg").remove();
  d3.select("#dashboard").selectAll(".tooltip").remove();

  getFirstTableDashboard(allData);
}

var customNumberSorter = function (a, b, aRow, bRow, column, dir, sorterParams) {

  var convertToNumber = function (value) {
    var number = removeDecimalsAndChars(value);
    if (value.indexOf("K") !== -1) {
      number *= 1000;
    }
    return number;
  };

  //console.log('Converted string First = ' + a + 'Result ' + convertToNumber(a) + " " + 'Converted string Second = ' + b + 'Result ' + convertToNumber(b));

  var numA = convertToNumber(a);
  var numB = convertToNumber(b);

  return numA - numB;
};

var customBottomCalc = function (values, data, calcParams) {
  var calc = 0;

  if (calcParams.label == '1') {
    return 'Всего';
  }

  if (values.length === 0) {
    return calc;
  }

  values.forEach(function (value) {
    if (value.indexOf('%') == '-1') {
      var number = parseFloat(value.replace(/\s/g, '').replace(',', '.')) * 1000;
    } else {
      var number = parseFloat(value);
    }

    calc = Number(calc) + Number(number);
  });

  if (values[0].indexOf('%') == '-1') {
    return (calc / 1000) + 'K';
  } else {
    return Math.round(calc) + '%';
  }
}

function buttonHeaderRenderer(cell, formatterParams, onRendered) {
  const branchName = formatterParams.branchName;
  return `<div style="display: flex; padding-left: 18px"><button class='btn' onclick="testFunc('${branchName}')" style="background-color: transparent; border: 0; margin-right: 8px; position: absolute; top: -9px; left: -15px;"><img src="back.svg" style="filter: invert(1);"></button> ${branchName}</div>`;
}

function testFunc(branch) {
  if (branch == 'TrnBranchName') {
    filterFirstTable('', '')
  } else if (branch == 'TrnProductClassDescription') {
    filterFirstTable('', '')
  }
}

function removeFilters() {
  getFirstTable(groupedFirstTableResult);
  getSecondTable(groupedSecondTableResult);
  updateChart(groupedFirstTableResult);

  document.querySelectorAll('select').forEach(element => {
    element.onchange = null;

    $(element).val('').trigger('change.select2');

    setTimeout(function () {
      element.onchange = function () {
        filterFirstTable(element, element.getAttribute('filterField'));
      };
    }, 100);
  })
}


function removeDecimalsAndChars(str) {
  str = str.replace(/[a-zA-Z]/g, "").replace(/\s/g, "");

  if (str.length <= 4) {
    let result = str.replace(',', '.');
    return result;
  } else if (str.indexOf(',') === 1 || str.indexOf(',') === 2) {
    let result = str.replace(',', '');
    return result;
  } else {
    let result = str.replace(/\s/g, "").replace(',', '.');
    return result;
  }
}