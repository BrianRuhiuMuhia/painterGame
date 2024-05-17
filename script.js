"use strict"
const factor=1000
let game;
let canvas;
let score=0
const sprites={
    background:background,
    balloon:balloon,
    blue_ball:blue_ball,
    blue_can:blue_can,
    cannon_barrel:cannon_barrel,
    cannon_blue:cannon_blue,
    cannon_green:cannon_green,
    cannon_red:cannon_red,
    green_ball:green_ball,
    green_can:green_can,
    red_ball:red_ball,
    red_can:red_can,
    scorebar:scorebar,
    game_over_click:game_over_click,
    game_over_tap:game_over_tap
}
const sound=new Audio()
sound.src="/assets/laser.wav"
const win={
zero:red_can,
one:green_can,
two:blue_can
}
const mouse={
    position_onmove:new Vector(),
    position_onclick:new Vector()
}
function Background()
{
    this.position=new Vector()
    this.origin=new Vector()
    this.rotation=0
}
Background.prototype.draw=function()
{
    game.drawImage(sprites.background,this.position,this.origin,this.rotation)
}
function Vector(x=0,y=0)
{
this.x=x
this.y=y
}
function seal(obj)
{
    if(typeof obj != "object")
    console.error("should be type object")
    if(Object.isSealed())
    {
    Object.seal(obj)
    }
}
function Canvas()
{
    this.canvas=document.querySelector("#canvas")
    this.context=this.canvas.getContext("2d")
    this.width=this.canvas.width
    this.height=this.canvas.height
}
Canvas.prototype.clear=function()
{
    this.context.clearRect(0,0,this.width,this.height)
}
function Can(game,x,y)
{
this.game=game
this.original_position={x:x,y:y}
this.position=new Vector(x,y)
this.origin=new Vector(0,0)
this.velocity=new Vector(0,(Math.random() * 3 +10))
this.curr_color=this.randomColor()
this.rotation=0
}
Can.prototype.draw=function()
{
this.game.drawImage(this.curr_color,this.position,this.origin,this.rotation)
}
Can.prototype.update=function(delta)
{
this.velocity.y=this.randomVelocity()
this.position.y+=this.velocity.y * 0.5
this.reset()
}
Can.prototype.randomVelocity=function()
{
    let value=Math.random() * 2 +3
    return (Math.random() * 10 +10)/value
}
Can.prototype.randomColor=function()
{
    let value=Math.floor(Math.random() * 3)
    if(value === 0)
    {
        return sprites.red_can
    }
    else if(value ===1)
    {
        return sprites.blue_can
    }
    else{
        return sprites.green_can
    }
}
Can.prototype.reset=function(x,y)
{
if(this.position.y>game.height)
{
    let x=this.original_position.x
    let y=this.original_position.y
    this.curr_color=this.randomColor()
    this.position=new Vector(x,y)
    
}
}
function Ball(game)
{
this.game=game
this.curr_color=sprites.red_ball
this.position=new Vector(50,390)
this.origin=new Vector(0,0)
this.velocity=new Vector(0,0)
this.shooting=false
this.collision=false
}
Ball.prototype.draw=function()
{
    this.game.drawImage(this.curr_color,this.position,this.origin,this.rotation)
}
Ball.prototype.update=function(deltatime)
{
   
if(this.shooting){
    this.velocity.x*=0.99
    this.velocity.y+=6
    this.position.x+=this.velocity.x * deltatime/factor
    this.position.y+=this.velocity.y * deltatime/factor
}
else{
    if(this.game.cannon.curr_color === sprites.cannon_red)
    {
        this.curr_color=sprites.red_ball
    }
    else if(this.game.cannon.curr_color === sprites.cannon_blue)
    {
        this.curr_color=sprites.blue_ball
    }
    else{
        this.curr_color=sprites.green_ball
    }
}
this.reset()

}
Ball.prototype.reset=function()
{
    if(this.collision)
    {
        this.position=new Vector(60,393)
        this.shooting=false
        this.collision=false
    }
    if(this.shooting && this.game.outsideGame(this))
    {
        this.position=new Vector(60,393)
        this.shooting=false
    }
}
function Cannon(game)
{
this.game=game
this.position=new Vector(72,405)
this.origin=new Vector(34,34)
this.curr_color=sprites.cannon_red
this.curr_position=new Vector(55,388)
this.rotation=0
}
Cannon.prototype.draw=function()
{
    this.game.drawImage(sprites.cannon_barrel,this.position,this.origin,this.rotation)
    this.game.drawImage(this.curr_color,this.curr_position,{x:0,y:0},0)
}
Cannon.prototype.update=function()
{
    const opposite=mouse.position_onmove.x - this.position.x
    const adjacent=mouse.position_onmove.y -this.position.y
    this.rotation=Math.atan2(adjacent,opposite)
}
function Game()
{
let y=-sprites.blue_can.height
this.ball=new Ball(this)
this.cannon=new Cannon(this) 
this.canArr=[new Can(this,450,y),new Can(this,580,y),new Can(this,710,y)]
this.background=new Background()
this.width=canvas.width
this.height=canvas.height
}
Game.prototype.start=function()
{
    this.seal()
}
Game.prototype.seal=function()
{
seal(sprites)
}
Game.prototype.draw=function()
{
this.background.draw()
this.ball.draw()
this.cannon.draw()
this.canArr.forEach((can)=>
{
    can.draw()
})
}
Game.prototype.outsideGame=function(obj)
{

    if(obj.position.x > this.width || obj.position.x + obj.curr_color.width <0 )
    {
        return true
    }
    if(obj.position.y > this.height || obj.position.y + obj.curr_color.height < 0)
    {
        return true
    }
    return false
}
Game.prototype.check_win=function()
{
    this.canArr.forEach((can,index)=>{

if(can.position.y + 1>= this.height)
{
    if(index === 0 && can.curr_color===win.zero)
    {
    score++
    }
    else if(index === 1 && can.curr_color===win.one)
    {
    score++
    }
    else(index === 2 && can.curr_color===win.two)
    {
    score++
    }
}
})
}
Game.prototype.update=function(deltatime)
{
this.cannon.update()
this.ball.update(deltatime)
this.canArr.forEach((can)=>
{
    can.update()
})
this.collision()
}
Game.prototype.collision=function()
{
    if(this.ball.shooting)
    {
this.canArr.forEach((can)=>{
    let y1=this.ball.position.y + this.ball.curr_color.height/2
    let y2=can.position.y + can.curr_color.height/2
    let x1=this.ball.position.x + this.ball.curr_color.width/2
    let x2=can.position.x + can.curr_color.width/2
    let dist=Math.sqrt(Math.pow((y1-y2),2) +(Math.pow((x1-x2),2)))
    if(dist<(this.ball.curr_color.width/2 + can.curr_color.width/2))
    {
        let value=this.ball.curr_color
if(value===sprites.green_ball)
{
    can.curr_color=sprites.green_can
}
else if(value===sprites.red_ball)
{
    can.curr_color=sprites.red_can
}
else{
    can_curr_color=sprites.blue_can
}
this.ball.collision=true
    }
})
    }
     this.check_win()
}
Game.prototype.drawImage=function(sprite,position,origin,rotation)
{
canvas.context.save()
canvas.context.translate(position.x,position.y)
canvas.context.rotate(rotation)
canvas.context.drawImage(sprite,0,0,sprite.width,sprite.height,-origin.x,-origin.y,sprite.width,sprite.height)
canvas.context.restore()
}
window.addEventListener("keydown",function(event)
{
let key=event.key.toLowerCase()
if(key==="r")
{
game.cannon.curr_color=sprites.cannon_red
}
else if(key==='g')
{
game.cannon.curr_color=sprites.cannon_green
}
else{
game.cannon.curr_color=sprites.cannon_blue
}
})
window.addEventListener("mousemove",function(event)
{
    mouse.position_onmove={x:event.pageX,y:event.pageY}
    
})
window.addEventListener("click",function(event)
{
if(!game.ball.shooting)
{
    mouse.position_onclick={x:event.pageX,y:event.pageY}
    game.ball.velocity.x=(mouse.position_onclick.x-game.ball.position.x)
    game.ball.velocity.y=(mouse.position_onclick.y -game.ball.position.y)
    sound.play()
    game.ball.shooting=true
}
})
window.addEventListener("load",function()
{
canvas=new Canvas()
game=new Game()
animate(0)
})
function displayText() {
    canvas.context.fillStyle = "white";
    canvas.context.fillText(`Score:${score}`, 0, 55);
    canvas.context.font = "30px cursive";
}
let interval=0
let deltatime=undefined
function animate(timestamp)
{
deltatime=timestamp-interval
requestAnimationFrame(animate)
canvas.clear()
game.start()
game.draw()
game.update(deltatime)
displayText()
interval=timestamp
}

