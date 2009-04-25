/* This file is for the brains.  It doesn't touch the dom, and tries to stay stateless. */

var life_forms = {} // This is the only stateful thing in this file.  It should be part of Board.
var timer = null

var dead = 0;
var alive = 1;
var lonely = 2;
var crowded = 3;

var offsets = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]]

// Lets keep track of our life forms so we know what we need to update
function set_board(board, point, value){
  if(value) life_forms[point] = true    
  else delete life_forms[point]
  set_point(board, point, value)
  return value
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
  var cells = {}
  for(var life_form in life_forms){
    life_form = unhash_point(life_form)
    cells[life_form] = true
    $(offsets).each(function(){
      var offset = this
      var point = point_plus(life_form, offset)
      if(check_bounds(point,board)) cells[point] = true
    })
  }
  return cells
}

// An alternative for find_volatile_cells to compare behavior and performance
function all_cells(board){
  cells = {}
  for(var x = 0; x < x_size(board); ++x)
   for(var y = 0; y < y_size(board); ++y)
     cells[[x,y]] = true
  return cells  
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

function make_board(size)
{
	var board = new Array(size[0]);
	for(var x = 0; x < size[0]; ++x){
		board[x] = new Array(size[1]);
		for(var y = 0; y < size[1]; ++y){
			set_board(board, [x,y], dead)		  
		}
	}
	return board
}

function setup_board(board, life, size){
  clearTimeout(timer)
  var board = make_board(size)
  life_forms = {}
  
  $(life).each(function(){
    set_board(board, this, alive)
  })
  return board
}
