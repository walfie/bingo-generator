var button = document.querySelector('.js-submit');
var input = document.querySelector('.js-input');
var numInputs = document.querySelector('.js-numInputs');

(function init() {
  var storedInputString = localStorage.inputs;
  var stored = [];
  try {
    stored = JSON.parse(localStorage.inputs);
  } catch(e) {
    stored = [];
  }

  if (stored.constructor === Array) {
    input.value = stored.join('\n');
  } else {
    localStorage.inputs = [];
  }

  updateNumInputs();
}());

generate(getInputs());

input.addEventListener('keyup', throttle(updateNumInputs));

button.addEventListener('click', function(e) {
  var inputs = getInputs();
  localStorage.inputs = JSON.stringify(inputs);
  generate(inputs);
  e.preventDefault();
  return false;
});

function updateNumInputs() {
  numInputs.innerHTML = getInputs().length;
}

function getInputs() {
  return input.value
    .split('\n')
    .filter(function(x) { return x.trim() != ''; });
}

function generate(input) {
  var container = document.querySelector('.js-output');
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  var bingo = createBingo(container, input);
  var table = bingo.querySelector('table');

  // Sometimes canvas gets cut off at the bottom
  table.style.height = table.offsetHeight + 5 + 'px';

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = table.offsetWidth;
  canvas.height = table.offsetHeight;

  var svg = makeSvg(table);
  var svgString = new XMLSerializer().serializeToString(svg);

  var domUrl = window.URL || window.webkitURL || window;
  var img = new Image();
  var svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
  var url = domUrl.createObjectURL(svgBlob);
  container.appendChild(canvas);

  img.src = url;
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    domUrl.revokeObjectURL(url);
  }
}

function makeSvg(content) {
  var d = document;

  var ns = 'http://www.w3.org/2000/svg';

  var svg = d.createElementNS(ns, 'svg');
  svg.setAttribute('width', content.offsetWidth);
  svg.setAttribute('height', content.offsetHeight);

  var fo = d.createElementNS(ns, 'foreignObject');
  fo.setAttribute('width', '100%');
  fo.setAttribute('height', '100%');
  svg.appendChild(fo);

  var div = d.createElement('div');
  div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  div.appendChild(content);
  fo.appendChild(div);

  return svg;
}

function createBingo(container, inputItems) {
  var d = document;

  var table = d.createElement('table');
  var tbody = d.createElement('tbody');
  table.appendChild(tbody);
  table.style.borderCollapse = 'collapse';

  // This stuff should really be configurable. But nah.
  var maxRows = 5;
  var maxCols = 5;
  var color = '#ffafa6';
  var cellSize = 150;
  var cellPadding = 10;
  var maxLineHeight = 50;

  var cellSizeWithPadding = cellSize - cellPadding * 2;
  var emptyCell = [Math.floor(maxRows / 2), Math.floor(maxCols / 2)];

  var paddedItems = new Array(Math.max(0, maxRows * maxCols - inputItems.length - 1))
    .concat(inputItems.slice());
  var items = shuffleArray(paddedItems);

  container.appendChild(table);

  for (var row = 0; row < maxRows; row++) {
    var tr = d.createElement('tr');
    tbody.appendChild(tr);

    for (var col = 0; col < maxCols; col++) {
      var td = d.createElement('td');
      td.style.border = '8px solid ' + color;

      var cell = d.createElement('div');
      cell.style.width = cell.style.height = cellSize + 'px';
      cell.style.display = 'table-cell';
      cell.style.verticalAlign = 'middle';
      cell.style.textAlign = 'center';
      cell.style.boxSizing = 'border-box';
      cell.style.padding = cellPadding + 'px';

      var span = d.createElement('span');
      cell.appendChild(span);

      td.appendChild(cell);
      tr.appendChild(td);

      if (row == emptyCell[0] && col == emptyCell[1]) {
        span.style.font = 'bold '+ maxLineHeight + 'px sans';
        span.innerHTML = "FREE";
        td.style.color = '#ffffff';
        td.style.background = color;
      } else {
        span.innerHTML = items.pop() || '';

        for (var size = maxLineHeight; size > 1; size--) {
          span.style.fontSize = size + 'px';

          if (span.offsetHeight < cellSizeWithPadding && span.offsetWidth < cellSizeWithPadding) {
            break;
          }
        }

        td.style.background = '#ffffff';
      }
    }
  }

  return container;
}

// http://jsfiddle.net/jonathansampson/m7G64/
function throttle (callback, limit) {
  var wait = false;
  return function() {
    if (!wait) {
      callback.call();
      wait = true;
      setTimeout(function () { wait = false; }, limit);
    }
  }
}

// http://stackoverflow.com/a/12646864/1887090
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

