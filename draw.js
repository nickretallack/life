var sim = null
var view = null

setups = {}
setups['blinker'] = [[1,0],[1,1],[1,2]]
setups['glider']  = [[2,0],[2,1],[2,2],[1,2],[0,1]]
setups['flower']  = [[4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [10,6], [4,7], [6,7], [8,7], [10,7],
                     [4,8], [5,8], [6,8], [7,8], [8,8], [9,8], [10,8]]

function Life_View(sim, board_node, play_button){
  var self = this

  var timer = null
  var drawing_color = null
  var drawing = false
  
  // create the cells
  board_node.empty()
  for(var y=0; y < sim.height; y++){
    var row = $(document.createElement('tr'))
    for(var x=0; x < sim.width; x++){
      var element = $(document.createElement('td')).addClass(x+'-'+y).addClass('dead')
      element.attr('data-position',x+','+y)
      row.append(element)
    }
    board_node.append(row)
  }

  self.update = function(){
    for (var cell in sim.dirty_cells){
      cell = unhash_point(cell)
      var node = $('.'+cell[0]+'-'+cell[1])
      if(sim.life[cell] != 1) node.addClass('dead')
      else node.removeClass('dead')
    }
  }
  self.update()

  function step(){
    sim.step()
    self.update()
  }

  function play(){
    step()
    timer = setTimeout(play,200)
  }
  
  function stop(){
    play_button.text("Play")
    clearTimeout(timer)
    timer = null
  }
  
  // Handlers to expose
  self.play = function(){
    if (timer) stop()
    else {
      play_button.text("Pause")
      play()
    }
  }
  
  self.step = function(){
    stop()
    step()
  }
  
  self.export = function(){
    var export_button = this
    var text = window.location.href.split('#')[0].split('?')[0]
    text += "?width="+sim.width+"&height="+sim.height+"&life="+set_to_list(sim.life).join('|')
    var node = $(document.createElement("textarea")).text(text)
    $(export_button).after(node)
  }

  // drawing stuff
  // For drawing life onto the grid with the mouse
  function draw(node){
    var cell = unhash_point($(node).attr('data-position'))
    if(drawing_color == alive){
      sim.set_cell(cell, 1)
      $(node).removeClass('dead')
    } else {
      sim.set_cell(cell, undefined)
      $(node).addClass('dead')
    } 
  }

  // drawing controls
  var cells = $(board_node).find('td')
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



function Setup(){
  // Query parameters: width, height, life
  var maybe_frag = window.location.href.split('#')
  var query = $.query(maybe_frag[0])
  var size = [40,20]
  if (query['width'] && query['height']){
    size = [query['width'], query['height']]
  }
  
  var life = {}
  if (query['life'])
    life = list_to_set(query['life'].split('|'))
  else
    life = maybe_frag.length > 1 ? list_to_set(setups[maybe_frag[1]]) : []

  // make our model and view
  sim = new Life(size[0], size[1], life)
  view = new Life_View(sim, $('#board'), $("#go-button"))

  // show the right values in the form
  $('#width').val(size[0])
  $('#height').val(size[1])

  // Wire up the event handlers
  $('#go-button').click(view.play)
  $('#step-button').click(view.step)
  $('#export-button').click(view.export)
  
  $(".setups a").click(function(){
    var kind = $(this).attr('href').split('#')[1]
    sim.set_life(list_to_set(setups[kind]))
    $('#board td').addClass('dead')
    view.update()
  })
}


$(document).ready(Setup)