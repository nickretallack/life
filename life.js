var life_forms = {}
var timer = null
var current_board = null;
var current_board_view = null;

var dead = 0;
var alive = 1;

var lonely = 2;
var crowded = 3;

var drawing_color = null
var drawing = false

var offsets = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]]

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

// NOTE: Oops, I'm displaying the X axis vertically and the Y axis horizontally.
// This would take a bit of fiddling to fix properly, since I didn't think about it
// when I wrote this code.

function x_size(board){return board.length}
function y_size(board){return board[0].length}
function get_point(array, point) {return array[point[0]][point[1]]}
function set_point(array, point, value) {return array[point[0]][point[1]] = value}
function point_plus(point1, point2) {return [point1[0] + point2[0], point1[1] + point2[1]]}
function board_size(board) {return [x_size(board), y_size(board)]}
// Lets keep track of our life forms so we know what we need to update
function set_board(board, point, value){
  if(value) life_forms[point] = true    
  else delete life_forms[point]
  set_point(board, point, value)
  return value
}

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

function count_neighbors(board, point){
	var neighbors = 0

	$(offsets).each(function(){
	  var this_point = point_plus(point, this)
	  if (check_bounds(this_point, board) && get_point(board, this_point) != dead)
	    neighbors++
	})
	return neighbors;
}

function find_volatile_cells(board){
  // Only life forms and their neighbors will need to be updated
  // Here we compile a list of all affected tiles
  var check_locations_set = {}
  for(var life_form in life_forms){
    life_form = unhash_point(life_form)
    check_locations_set[life_form] = true
    $(offsets).each(function(){
      var offset = this
      var point = point_plus(life_form, offset)
      if(check_bounds(point,board)) check_locations_set[point] = true
    })
  }
  return check_locations_set

  //   cells = {}
  // for(var x = 0; x < x_size(board); ++x)
  //  for(var y = 0; y < y_size(board); ++y)
  //    cells[[x,y]] = true
  // return cells
}


function next_step(old_board, volatile_cells){
  var new_board = make_board(board_size(old_board))
  // Clear off the old data and make a new board state referencing the old one.
  // TODO: model corpses where there was life last round
  life_forms = {}
  for (var point in volatile_cells){
    point = unhash_point(point)
    neighbors = count_neighbors(old_board, point)
    if(neighbors == 3) set_board(new_board, point, crowded)
    if(neighbors == 2 && get_point(old_board, point) != dead) set_board(new_board, point, lonely)
	}
	return new_board
}

function update_board_view(board, board_node, volatile_cells){
  for (var point in volatile_cells){
    point = unhash_point(point)
    var node = $('[data-position='+point[0]+','+point[1]+']')
    node.removeClass('dead').removeClass('alive')
    if(get_point(board, point) != dead) node.addClass('alive')
    else node.addClass('dead')
	}
}

function init_board_view(board, board_node){
  board_node.empty()
  for(var x=0; x < x_size(board); x++){
    var row = $(document.createElement('tr'))
    for(var y=0; y < y_size(board); y++){
      var element = $(document.createElement('td')).attr('data-position',x+','+y).addClass('dead').text(' ')
      row.append(element)
    }
    board_node.append(row)
  }
}


function make_board(size)
{
	var board = new Array(size[1]);
	for(var x = 0; x < size[1]; ++x)
	{
		board[x] = new Array(size[0]);
		for(var y = 0; y < size[0]; ++y)
			board[x][y] = dead;
	}
	return board
}

function Setup()
{
  current_board_view = $('#board')

  // If they specified a fragment identifier, set the board type
  var maybe_frag = window.location.href.split('#')
  
  var query = $.query(maybe_frag[0])
  var size = [40,20]
  if (query['width'] && query['height']){
    size = [query['width'], query['height']]
  }
  
  var life = []
  if (query['life']) {
    var str_points = query['life'].split('|')
    $(str_points).each(function(){
      life.push(unhash_point(this))
    })    
  } else {
    life = maybe_frag.length > 1 ? setups[maybe_frag[1]] : []
  }

  setup_board(life, size)
  init_board_view(current_board, current_board_view)
	update_board_view(current_board, current_board_view, find_volatile_cells(current_board));
  
	$('#go-button').click(Play)
	$('#stop-button').click(Stop)
	$('#step-button').click(Step)
	$('#export-button').click(Export)
	
	$(".setups a").click(function(){
	  var kind = $(this).attr('href').split('#')[1]
    setup_board(kind, board_size(current_board))
  	update_board_view(current_board, current_board_view, find_volatile_cells(current_board));
	})
	
	// drawing controls
	var cells = $(current_board).find('td')
  cells.live('mousedown', function(e){
    e.preventDefault()
    drawing = true
    if ($(this).hasClass('dead')) drawing_color = alive
    else drawing_color = dead
    
    draw(this)
  })
  
  $(document).mouseup(function(e){
    e.preventDefault()
    drawing = false
  })
  
  cells.live('mousemove', function(e){
    if(drawing){
      e.preventDefault()
      draw(this)
    }
  })
  
}

function draw(node){
  var location = unhash_point($(node).attr('data-position'))
  if(drawing_color == alive){
    set_board(current_board, location, alive)
    $(node).removeClass('dead')
  } else {
    set_board(current_board, location, dead)
    $(node).addClass('dead')
  } 
}

setups = {}
setups['blinker'] = [[1,0],[1,1],[1,2]]
setups['glider']  = [[2,0],[2,1],[2,2],[1,2],[0,1]]
setups['flower']  = [[4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [10,6], [4,7], [6,7], [8,7], [10,7],
                     [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [10,8]]

function setup_board(life, size){
  clearTimeout(timer)
  var board = make_board(size)
  
  $(life).each(function(){
    set_board(board, this, alive)
  })

  current_board = board  
}

function Play(){
  step_and_view()
  timer = setTimeout(Play,200)
}

function Step(){
  Stop()
  step_and_view()
}

function step_and_view(){
  var volatile_cells = find_volatile_cells(current_board)
  current_board = next_step(current_board, volatile_cells)
  update_board_view(current_board, current_board_view, volatile_cells)
}

function Stop(){
  clearTimeout(timer)
  timer = null
}

function Export(){
  var text = window.location.href.split('#')[0].split('?')[0]
  text += "?width="+y_size(current_board)+"&height="+x_size(current_board)+"&life="
  var life_list = []
  for (var life_form in life_forms){
    life_list.push(life_form)
  }
  text += life_list.join('|')
  var node = $(document.createElement("textarea")).text(text)
  $(this).after(node)
}


$(document).ready(Setup)