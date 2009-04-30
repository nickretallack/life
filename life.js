var alive = 1
var dead

/* This file is for the brains.  It doesn't touch the dom, and tries to stay stateless. */
/* OMG, lets refactor this to only use a hash, no 2D array at all! */
function Life(width, height, life){
  // constants
  var offsets = [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]]
  var rotten = -1
  // var dead = 0
  // var lonely = 2
  // var crowded = 3
  
  var self = this

  // parameter defaults
  if (!life) life = {}
  if (!width) width = 40
  if (!height) height = 20

  // public
  self.life = life
  self.width = width
  self.height = height
  self.dirty_cells = life // has to draw initial life
  
  function count_neighbors(cell){
    var neighbors = 0
    $(offsets).each(function(){
      var wrapped_point = point_mod_boundary (point_plus(cell, this), [width, height])
      if (self.life[wrapped_point] == alive)
        neighbors++
    })
    return neighbors;
  }

  self.step = function(){
    var new_life = {}
    var visited_cells = {}
    self.dirty_cells = {}

    function visit(cell){
      // optimization so we don't visit the same cell twice
      if (visited_cells[cell]) return
      visited_cells[cell] = true
      
      // calculate new life
      var neighbors = count_neighbors(cell)
      if(neighbors == 3)
        new_life[cell] = alive
      if(neighbors == 2 && self.life[cell] == alive)
        new_life[cell] = alive
      
      // optimization so the draw phase changes as little as possible
      if (new_life[cell] != self.life[cell])
        self.dirty_cells[cell] = true
    }

    // visit all current life and its neighbors
    for (var cell in self.life){
      cell = unhash_point(cell)
      visit(cell)
      $(offsets).each(function(){
        var neighbor_cell = point_mod_boundary (point_plus(cell, this), [width, height])
        visit(neighbor_cell)
      })
    }
    
    // throw away old state
    self.life = new_life
  }
  
  self.set_life = function(life){
    self.life = self.dirty_cells = life
  }
  
  self.set_cell = function(cell, value){
    self.dirty_cells[cell] = true
    self.life[cell] = value
  }
}