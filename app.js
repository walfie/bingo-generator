var itemInputs = document.querySelector('.js-input-items');
var titleInput = document.querySelector('.js-input-title');
var numInputs = document.querySelector('.js-numInputs');
var bgColorInput = document.querySelector('.js-input-bgColor');
var borderColorInput = document.querySelector('.js-input-borderColor');
var textColorInput = document.querySelector('.js-input-textColor');

var fontOptions = [
  "Arial, Helvetica, sans-serif",
  "'Arial Black', Gadget, sans-serif",
  "'Comic Sans MS', Textile, cursive",
  "'Courier New', Courier, monospace",
  "Georgia, 'Times New Roman', Times, serif",
  "Impact, Charcoal, sans-serif",
  "'Lucida Console', Monaco, monospace",
  "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
  "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  "Tahoma, Geneva, sans-serif",
  "'Times New Roman', Times, serif",
  "'Trebuchet MS', Helvetica, sans-serif",
  "Verdana, Geneva, sans-serif",
  "'MS Sans Serif', Geneva, sans-serif",
  "'MS Serif', 'New York', serif"
];

(function init() {
  titleInput.value = localStorage.titleInput || '';
  bgColorInput.value = localStorage.bgColorInput || bgColorInput.value;
  borderColorInput.value = localStorage.borderColorInput || borderColorInput.value;
  textColorInput.value = localStorage.textColorInput || textColorInput.value;

  var stored = [];
  try {
    stored = JSON.parse(localStorage.itemInputs);
  } catch(e) {
    stored = [];
  }

  if (stored.constructor === Array) {
    itemInputs.value = stored.join('\n');
  } else {
    localStorage.itemInputs = [];
  }

  updateNumInputs();

  function generateFromInputs() {
    generate(
      titleInput.value,
      getItems(),
      fontInput.value,
      textColorInput.value,
      bgColorInput.value,
      borderColorInput.value
    );
  }

  function onClickShuffle(shuffle) {
    return function(e) {
      var items = getItems();
      if (shuffle) {
        items = shuffleArray(items);
      }
      itemInputs.value = items.join('\n');

      localStorage.titleInput = titleInput.value;
      localStorage.fontInput = fontInput.value;
      localStorage.textColorInput = textColorInput.value;
      localStorage.bgColorInput = bgColorInput.value;
      localStorage.borderColorInput = borderColorInput.value;
      localStorage.itemInputs = JSON.stringify(items);
      generateFromInputs();
      e.preventDefault();
      return false;
    };
  }

  document.querySelector('.js-submit-inOrder')
    .addEventListener('click', onClickShuffle(false));
  document.querySelector('.js-submit-shuffle')
    .addEventListener('click', onClickShuffle(true));
  document.querySelector('.js-restore-defaults')
    .addEventListener('click', function() {
      var items = localStorage.itemInputs;
      var title = localStorage.titleInput;
      localStorage.clear();
      localStorage.titleInput = title;
      localStorage.itemInputs = items;
      document.location.reload();
    });

  var fontInput = document.querySelector('.js-input-fontSelect');
  fontOptions.forEach(function(font) {
    var opt = document.createElement('option');
    opt.value = font;
    opt.innerHTML = font;
    if (localStorage.fontInput == font) {
      opt.selected = true;
    }
    fontInput.appendChild(opt);
  });

  input.addEventListener('keyup', throttle(updateNumInputs));

  generateFromInputs();
}());

function updateNumInputs() {
  numInputs.innerHTML = getItems().length;
}

function getItems() {
  return itemInputs.value
    .split('\n')
    .filter(function(x) { return x.trim() != ''; });
}

function generate(title, items, font, textColor, bgColor, borderColor) {
  var container = document.querySelector('.js-tmpOutput');

  var bingo = createBingo(container, title, items, font, textColor, bgColor, borderColor);
  var table = bingo.querySelector('table');

  // Sometimes canvas gets cut off at the bottom
  table.style.height = table.offsetHeight + 5 + 'px';

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = table.offsetWidth;
  canvas.height = table.offsetHeight;
  canvas.style.maxWidth = '100%';

  var svg = makeSvg(table);
  var svgString = new XMLSerializer().serializeToString(svg);

  var domUrl = window.URL || window.webkitURL || window;
  var img = new Image();
  var svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
  var url = domUrl.createObjectURL(svgBlob);

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  var outputDiv = document.querySelector('.js-output')
  removeChildNodes(outputDiv).appendChild(canvas);

  img.src = url;
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    domUrl.revokeObjectURL(url);

    removeChildNodes(container);
  }
}

function removeChildNodes(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
  return node;
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

function createBingo(container, titleText, inputItems, fontFamily, textColor, bgColor, borderColor) {
  var d = document;

  // This stuff should really be configurable. But nah.
  var maxRows = 5;
  var maxCols = 5;
  var cellSize = 150;
  var cellPadding = 10;
  var maxLineHeight = 40;

  var table = d.createElement('table');
  table.style.border = '5px solid ' + borderColor;
  table.style.color = textColor;
  table.style.fontFamily = fontFamily;

  var th = d.createElement('th');
  th.innerHTML = titleText;
  th.style.padding = '5px';
  th.style.fontSize = maxLineHeight + 'px';
  th.style.fontWeight = 'bold';
  th.style.background = bgColor;
  th.colSpan = maxCols;
  table.appendChild(th);

  var tbody = d.createElement('tbody');
  table.appendChild(tbody);
  table.style.borderCollapse = 'collapse';

  var cellSizeWithPadding = cellSize - cellPadding * 2;
  var emptyCell = [Math.floor(maxRows / 2), Math.floor(maxCols / 2)];

  var items = inputItems.slice()
    .concat(new Array(Math.max(0, maxRows * maxCols - inputItems.length - 1)))

  container.appendChild(table);

  for (var row = 0; row < maxRows; row++) {
    var tr = d.createElement('tr');
    tbody.appendChild(tr);

    for (var col = 0; col < maxCols; col++) {
      var td = d.createElement('td');
      td.style.border = '8px solid ' + borderColor;
      td.style.background = bgColor;

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
        span.style.fontWeight = 'bold';
        span.style.fontSize = maxLineHeight + 'px';
        span.style.fontFamily = fontFamily;
        span.innerHTML = "FREE";
        span.style.color = bgColor;
        td.style.background = borderColor;
        cell.style.background = borderColor;
      } else {
        span.innerHTML = items.shift() || '';
        cell.style.background = bgColor;

        for (var size = maxLineHeight; size > 1; size--) {
          span.style.fontSize = size + 'px';

          if (span.offsetHeight < cellSizeWithPadding && span.offsetWidth < cellSizeWithPadding) {
            break;
          }
        }
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

