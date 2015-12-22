main();

function main() {
  var bingo = createBingo();
  var table = bingo.querySelector('table');

  // Sometimes canvas gets cut off at the bottom
  table.style.height = table.offsetHeight + 5 + 'px';

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = table.offsetWidth;
  canvas.height = table.offsetHeight;

  var svg = makeSvg(table);
  var svgString = new XMLSerializer().serializeToString(svg);
  document.body.removeChild(bingo);

  var domUrl = window.URL || window.webkitURL || window;
  var img = new Image();
  var svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
  var url = domUrl.createObjectURL(svgBlob);
  document.body.appendChild(canvas);

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


function createBingo() {
  var d = document;

  var table = d.createElement('table');
  var tbody = d.createElement('tbody');
  table.appendChild(tbody);
  table.style.borderCollapse = 'collapse';

  var maxRows = 5;
  var maxCols = 5;

  var color = '#ffafa6';
  var cellSize = 150;
  var cellPadding = 10;
  var maxLineHeight = 50;

  var cellSizeWithPadding = cellSize - cellPadding * 2;

  var container = d.createElement('div');
  container.appendChild(table);
  d.body.appendChild(container);

  for (var row=0; row<maxRows; row++) {
    var tr = d.createElement('tr');
    tbody.appendChild(tr);

    for (var col=0; col<maxCols; col++) {
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

      if (row == Math.floor(maxRows / 2) && col == Math.floor(maxCols/2)) {
        span.style.font = 'bold '+ maxLineHeight + 'px sans';
        span.innerHTML = "FREE";
        td.style.color = '#ffffff';
        td.style.background = color;
      } else {
        span.innerHTML = Array(Math.floor(Math.random() * 10) + 2).join('blah ') + (row*5 + col + 1);

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
