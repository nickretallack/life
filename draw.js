var current_board = null;
var current_board_view = null;

var drawing_color = null
var drawing = false

setups = {}
setups['blinker'] = [[1,0],[1,1],[1,2]]
setups['glider']  = [[2,0],[2,1],[2,2],[1,2],[0,1]]
setups['flower']  = [[4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [10,6], [4,7], [6,7], [8,7], [10,7],
                     [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [10,8]]

function init_board_view(board, board_node){
  board_node.empty()
  for(var y=0; y < y_size(board); y++){
    var row = $(document.createElement('tr'))
    for(var x=0; x < x_size(board); x++){
      var element = $(document.createElement('td')).addClass(x+'-'+y).addClass('dead').text(' ')
      element.attr('data-position',x+','+y)
      row.append(element)
    }
    board_node.append(row)
  }
}

function update_board_view(board, board_node, volatile_cells){
  for (var point in volatile_cells){
    point = unhash_point(point)
    var node = $('.'+point[0]+'-'+point[1])
    //node.removeClass('dead').removeClass('alive')
    if(get_point(board, point) == dead) node.addClass('dead')
    else node.removeClass('dead') //node.addClass('alive')
    //else node.addClass('dead')
  }
}

function step_and_view(){
  var volatile_cells = find_volatile_cells(current_board) //find_volatile_cells(current_board)
  current_board = next_step(current_board, volatile_cells)
  update_board_view(current_board, current_board_view, volatile_cells)
}

// For drawing life onto the grid with the mouse
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

function Setup(){
  current_board_view = $('#board')

  // Parse parameters from the url
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

  // Make and Display the board
  current_board = setup_board(current_board, life, size)
  init_board_view(current_board, current_board_view)
  update_board_view(current_board, current_board_view, find_volatile_cells(current_board));

  $('#width').val(size[0])
  $('#height').val(size[1])

  // Wire up the event handlers
  $('#go-button').click(Play)
  $('#stop-button').click(Stop)
  $('#step-button').click(Step)
  $('#export-button').click(Export)
  
  $(".setups a").click(function(){
    var kind = $(this).attr('href').split('#')[1]
    var old_board = current_board
    $('#board td').addClass('dead')
    current_board = setup_board(current_board, setups[kind], board_size(current_board))
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

function Play(){
  if (timer) Stop()
  else {
    $("#go-button").text("Pause")
    playing()
  }
}

function playing(){
  step_and_view()
  timer = setTimeout(playing,200)
}


function Step(){
  Stop()
  step_and_view()
}

function Stop(){
  $("#go-button").text("Play")
  clearTimeout(timer)
  timer = null
}

function Export(){
  var text = window.location.href.split('#')[0].split('?')[0]
  text += "?width="+x_size(current_board)+"&height="+y_size(current_board)+"&life="
  var life_list = []
  for (var life_form in life_forms){
    life_list.push(life_form)
  }
  text += life_list.join('|')
  var node = $(document.createElement("textarea")).text(text)
  $(this).after(node)
}

$(document).ready(Setup)
