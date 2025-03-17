var xVal = 0;
var predictions;
var predictions1;
var smooth = 15;
var smooth1 = 15;
var threshold = 50;
var leftreading = [];
var rightreading = [];
var leftavg = [];
var rightavg = [];
var threshold1 = 300;
var mouthreading = [];
var mouthavg = [];
var yawnCounter = 0;
var yawnStatus = false;



function distVec(v1, v2) {
  var dx = v1[0] - v2[0];
  var dy = v1[1] - v2[1];
  var dz = v1[2] - v2[2];

  return Math.sqrt(dx * dx + dy * dy + dz * dz) * 10;
}


//frame drop
const processFrame = async () => {
  try {
    predictions = await model.estimateFaces(document.querySelector("video"));
    
    
    if(predictions && predictions.length > 0) {
      callProcessing();
    }
    
    // Add small delay to prevent freezing
    setTimeout(() => requestAnimationFrame(processFrame), 50);
  } catch (error) {
    console.error("Face detection error:", error);
    requestAnimationFrame(processFrame);
  }
};


function updateTextInput(val) {
  document.getElementById('drowsinessText').value = val;
  threshold = parseInt(val);
  document.getElementById('drowsinessRange').value = val;
}

function updateTextInput1(val) {
  document.getElementById('yawnText').value = val;
  threshold1 = parseInt(val);
  document.getElementById('yawnRange').value = val;
}


function updateRangeInput(val) {
  document.getElementById('drowsinessText').value = val;
  threshold = parseInt(val);
}

function updateRangeInput1(val) {
  document.getElementById('yawnText').value = val;
  threshold1 = parseInt(val);
}

function smoothing(arr, windowSize) {
  if(arr.length < windowSize) return arr.slice(-1)[0];
  const weightedSum = arr.slice(-windowSize)
    .reduce((acc, val, idx) => {
      const weight = Math.cos((Math.PI * idx)/(windowSize * 2)) + 1;
      return acc + (val * weight);
    }, 0);
  
  const weightSum = arr.slice(-windowSize)
    .reduce((acc, _, idx) => {
      const weight = Math.cos((Math.PI * idx)/(windowSize * 2)) + 1;
      return acc + weight;
    }, 0);

  return weightedSum / weightSum;
}
// Yawn tag counter display
function updateYawnTag(count) {
  const counter = document.getElementById('yawnCounter');
  counter.textContent = `Yawn Count: ${count}`;
  counter.style.animation = 'none';
  counter.offsetHeight; 
}

// Line chart for the eyes
var eyeChart = new CanvasJS.Chart("eyeChartContainer", {
  title: {
    text: "Vertical Distance between the Eyelids"
  },
  axisY: {
    minimum: 30,
    maximum: 150
  },
  data: [
    {
      type: "line",
      dataPoints: leftavg,
      showInLegend: true,
      name: "Left Eye",
    },
    {
      type: "line",
      dataPoints: rightavg,
      showInLegend: true,
      name: "Right Eye",
    }
  ],
  legend: {
    cursor: "pointer",
    verticalAlign: "bottom",
    horizontalAlign: "left",
    dockInsidePlotArea: true,
  }
});

var mouthChart = new CanvasJS.Chart("mouthChartContainer", {
  title: {
    text: "Distance between Lips"
  },
  axisY: {
    minimum: 30,
    maximum: 800
  },
  data: [
    {
      type: "line",
      dataPoints: mouthavg,
      showInLegend: true,
      name: "Mouth",
    }
  ],
  legend: {
    cursor: "pointer",
    verticalAlign: "bottom",
    horizontalAlign: "left",
    dockInsidePlotArea: true,
  }
});

//sound file
function beep() {
  var mp3_url = 'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3';

(new Audio(mp3_url)).play()
}



callProcessing = function() {
  // Eye calculations
  var points = predictions[0]['mesh'];
  let lefteye = (distVec(points[385], points[380]) + distVec(points[386], points[374])) / 2;
  let righteye = (distVec(points[159], points[145]) + distVec(points[158], points[153])) / 2;
  
  leftreading.push(lefteye);
  rightreading.push(righteye);

  if(leftreading.length > smooth) {
    leftavg.push({ x: xVal, y: smoothing(leftreading, smooth) });
  }
  if(rightreading.length > smooth) {
    rightavg.push({ x: xVal, y: smoothing(rightreading, smooth) });
  }

  // Mouth calculations
  let mouth = (distVec(points[38], points[86]) + distVec(points[268], points[316])) / 2;
  mouthreading.push(mouth);

  if(mouthreading.length > smooth1) {
    mouthavg.push({ x: xVal, y: smoothing(mouthreading, smooth1) });
  }

  xVal++;

  
  if(leftreading.length > 4*smooth) leftreading.shift();
  if(rightreading.length > 4*smooth) rightreading.shift();
  if(mouthreading.length > 4*smooth1) mouthreading.shift();

 //ifs and more ifs
  if(leftreading.length > smooth && rightreading.length > smooth) {
    if(leftavg.slice(-1)[0].y < threshold && rightavg.slice(-1)[0].y < threshold) {
      beep();
    }
  }

  if(mouthreading.length > smooth1) {
    if(mouthavg.slice(-1)[0].y > threshold1) {
      if(!yawnStatus) {
        yawnCounter++;
        updateYawnTag(yawnCounter);
        yawnStatus = true;
      }
    } else {
      yawnStatus = false;
    }
  }

  // Render both charts separately
  eyeChart.render();
  mouthChart.render();
};

var eyeChart = new CanvasJS.Chart("eyeChartContainer", {
  title: {
    text: "Eye Closure Detection",
    fontFamily: "Segoe UI",
    fontSize: 20,
    fontWeight: "lighter",
    fontColor: "#2f4f4f"
  },
  axisX: {
    labelFontColor: "#708090",
    gridColor: "#d3d3d3",
    gridThickness: 0.5,
    lineThickness: 0
  },
  axisY: {
    title: "Eye Closure (px)",
    titleFontColor: "#2f4f4f",
    minimum: 30,
    maximum: 150,
    labelFontColor: "#708090",
    gridColor: "#e8e8e8",
    gridThickness: 0.5,
    lineThickness: 0
  },
  data: [{
      type: "spline", // Changed to spline for smooth curves
      dataPoints: leftavg,
      showInLegend: true,
      name: "Left Eye",
      color: "#1e90ff",
      lineThickness: 3,
      markerType: "circle",
      markerSize: 0,
      markerColor: "transparent"
    },
    {
      type: "spline",
      dataPoints: rightavg,
      showInLegend: true,
      name: "Right Eye",
      color: "#ff6347",
      lineThickness: 3,
      markerType: "circle",
      markerSize: 0,
      markerColor: "transparent"
  }],
  legend: {
    fontFamily: "Segoe UI",
    fontSize: 14,
    itemclick: function(e) {
      e.dataSeries.visible = !(e.dataSeries.visible);
      e.chart.render();
    }
  },
  backgroundColor: "#f8f8ff",
  animationEnabled: true,
  animationDuration: 500,
  toolTip: {
    shared: true,
    backgroundColor: "#ffffff",
    borderColor: "#d3d3d3"
  }
});




// Enhanced Mouth Chart
var mouthChart = new CanvasJS.Chart("mouthChartContainer", {
  title: {
    text: "Yawning Detection",
    fontFamily: "Segoe UI",
    fontSize: 20,
    fontWeight: "lighter",
    fontColor: "#2f4f4f"
  },
  axisX: {
    labelFontColor: "#708090",
    gridColor: "#d3d3d3",
    gridThickness: 0.5,
    lineThickness: 0
  },
  axisY: {
    title: "Mouth Opening (px)",
    titleFontColor: "#2f4f4f",
    minimum: 10,
    maximum: 800,
    labelFontColor: "#708090",
    gridColor: "#e8e8e8",
    gridThickness: 0.5,
    lineThickness: 0
  },
  data: [{
    type: "spline",
    dataPoints: mouthavg,
    showInLegend: true,
    name: "Mouth Opening",
    color: "#32cd32",
    lineThickness: 3,
    markerType: "circle",
    markerSize: 0,
    markerColor: "transparent"
  }],
  legend: {
    fontFamily: "Segoe UI",
    fontSize: 14
  },
  backgroundColor: "#f8f8ff",
  animationEnabled: true,
  animationDuration: 500,
  toolTip: {
    backgroundColor: "#ffffff",
    borderColor: "#d3d3d3"
  }
});

main();
