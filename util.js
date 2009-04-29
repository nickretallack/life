// NOTE: Oops, I'm displaying the X axis vertically and the Y axis horizontally.
// This would take a bit of fiddling to fix properly, since I didn't think about it
// when I wrote this code.

function x_size(board){return board.length}
function y_size(board){return board[0].length}
function get_point(board, point) {return board[point[0]][point[1]]}
function set_point(board, point, value) {return board[point[0]][point[1]] = value}
function point_plus(point1, point2) {return [point1[0] + point2[0], point1[1] + point2[1]]}
function board_size(board) {return [x_size(board), y_size(board)]}

function check_bounds(point, board){
  return point[0] >= 0 && point[1] >= 0 && point[0] < x_size(board) && point[1] < y_size(board)
}

function unhash_point(str){
  var ints = str.split(',')
  var point = []
  $(ints).each(function(){
    point.push(parseInt(this))
  })
  return point
}

// adds querystring parsing to jquery.  Found at jQuery google group
jQuery.query = function(s) { 
  if (s.indexOf('?') == -1) return {}
  var r = {}; 
  var q = s.substring(s.indexOf('?') + 1); 
  q = q.replace(/\&$/, ''); // remove the trailing & 
  jQuery.each(q.split('&'), function() { 
    var splitted = this.split('='); 
    var key = splitted[0]; 
    var val = splitted[1]; 
    // convert floats 
    if (/^[0-9.]+$/.test(val)) val = parseFloat(val); 
    // ignore empty values 
    if (typeof val == 'number' || val.length > 0) r[key] = val; 
  }); 
  return r; 
}; 
