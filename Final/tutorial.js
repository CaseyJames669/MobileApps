// Global constants:
var PLAYGROUND_WIDTH	= $(window).width();
var PLAYGROUND_HEIGHT	= $(window).height();
var REFRESH_RATE		= 15;

var GRACE		= 2000;
var MISSILE_SPEED = 10; //px per frame


/*Constants for the gameplay*/
var smallStarSpeed    	= 1 //pixels per frame
var mediumStarSpeed		= 1 //pixels per frame
var bigStarSpeed		= 4 //pixels per frame

// Gloabl animation holder
var playerAnimation = new Array();
var missile = new Array();
var enemies = new Array(3); // There are three kind of enemies in the game
var pills = new Array(1);

// Game state
var bossMode = false;
var bossName = null;
var playerHit = false;
var timeOfRespawn = 0;
var gameOver = false;

// Some hellper functions : 

// Function to restart the game:
function restartgame(){
	window.location.reload();
};

function explodePlayer(playerNode){
	playerNode.children().hide();
	playerNode.addSprite("explosion",{animation: playerAnimation["explode"], width: 100, height: 74})
	playerHit = true;
}


// Game objects:
function Player(node){

	this.node = node;
	//this.animations = animations;

	this.grace = false;
	this.replay = 3; 
	this.shield = 3; 
	this.score = 0;
	this.respawnTime = -1;
	
	// This function damage the ship and return true if this cause the ship to die 
	this.damage = function(){
		if(!this.grace){
			this.shield--;
			if (this.shield == 0){
				return true;
			}
			return false;
		}
		return false;
	};

	
	// this try to respawn the ship after a death and return true if the game is over
	this.respawn = function(){
		this.replay--;
		if(this.replay==0){
			return true;
		}
		
		this.grace 	= true;
		this.shield	= 3;
		
		this.respawnTime = (new Date()).getTime();
		$(this.node).fadeTo(0, 0.5); 
		return false;
	};
	
	this.update = function(){
		if((this.respawnTime > 0) && (((new Date()).getTime()-this.respawnTime) > 3000)){
			this.grace = false;
			$(this.node).fadeTo(500, 1); 
			this.respawnTime = -1;
		}
	}
	
	return true;
}
function Pill(node){
	this.speedx = -5;
	this.speedy = 0;
	this.node = $(node);
	
	this.update = function(playerNode){
		this.updateX(playerNode);
		this.updateY(playerNode);
	};	
	this.updateX = function(playerNode){
		this.node.x(this.speedx, true);
	};
	this.updateY= function(playerNode){
		var newpos = parseInt(this.node.css("top"))+this.speedy;
		this.node.y(this.speedy, true);
	};
}
function VitaminC(node){
	this.node = $(node);
}
VitaminC.prototype = new Pill();
VitaminC.prototype.updateY = function(playerNode){
	if(this.node.y() > (PLAYGROUND_HEIGHT - 100)){
		this.node.y(-2, true)
	}
}

	
	
function Enemy(node){
	this.shield	= 2;
	this.speedx	= -5;
	this.speedy	= 0;
	this.node = $(node);
	
	// deals with damage endured by an enemy
	this.damage = function(){
		this.shield--;
		if(this.shield == 0){
			return true;
		}
		return false;
	};
	
	// updates the position of the enemy
	this.update = function(playerNode){
		this.updateX(playerNode);
		this.updateY(playerNode);
	};	
	this.updateX = function(playerNode){
		this.node.x(this.speedx, true);
	};
	this.updateY= function(playerNode){
		var newpos = parseInt(this.node.css("top"))+this.speedy;
		this.node.y(this.speedy, true);
	};
}

function Minion(node){
	this.node = $(node);
}
Minion.prototype = new Enemy();
Minion.prototype.updateY = function(playerNode){
	
	if(this.node.y() > (PLAYGROUND_HEIGHT - 100)){
		this.node.y(-2, true)
	}
}

function Brainy(node){
	this.node = $(node);
	this.shield	= 5;
	this.speedy = 1;
	this.alignmentOffset = 5;
}
Brainy.prototype = new Enemy();
Brainy.prototype.updateY = function(playerNode){
	if((this.node.y()+this.alignmentOffset) > $(playerNode).y()){
		this.node.y(-this.speedy, true);
	} else if((this.node.y()+this.alignmentOffset) < $(playerNode).y()){
		this.node.y(this.speedy, true);
	}
}

function Bossy(node){
	this.node = $(node);
	this.shield	= 20;
	this.speedx = -1;
	this.alignmentOffset = 35;
}
Bossy.prototype = new Brainy();
Bossy.prototype.updateX = function(){
	if(this.node.x() > (PLAYGROUND_WIDTH - 100)){
		this.node.x(this.speedx, true)
	}
}



// --------------------------------------------------------------------------------------------------------------------
// --                                      the main declaration:                                                     --
// --------------------------------------------------------------------------------------------------------------------
$(function(){
	// Aniomations declaration: 
	
	// The background:
	var background1 = new $.gQ.Animation({imageURL: "background3.png", type: $.gQ.ANIMATION_VERTICAL});
	var background2 = new $.gQ.Animation({imageURL: "background3.png", type: $.gQ.ANIMATION_VERTICAL}); 
	var background3 = new $.gQ.Animation({imageURL: "background2.png", type: $.gQ.ANIMATION_VERTICAL});
	var background4 = new $.gQ.Animation({imageURL: "background2.png", type: $.gQ.ANIMATION_VERTICAL});
	var background5 = new $.gQ.Animation({imageURL: "background1.png", type: $.gQ.ANIMATION_VERTICAL});
	var background6 = new $.gQ.Animation({imageURL: "background1.png", type: $.gQ.ANIMATION_VERTICAL});
 
	
	// Player space shipannimations:
	playerAnimation["idle"]		= new $.gQ.Animation({imageURL: "KillerT_user.png"});
	playerAnimation["explode"]	= new $.gQ.Animation({imageURL: "KillerT_user.png"});
	playerAnimation["up"]		= new $.gQ.Animation({imageURL: "KillerT_user.png"});
	playerAnimation["down"]		= new $.gQ.Animation({imageURL: "KillerT_user.png"});
	playerAnimation["boost"]	= new $.gQ.Animation({imageURL: "KillerT_user.png"});
	playerAnimation["booster"]	= new $.gQ.Animation({imageURL: "KillerT_user.png"});
	
	//  List of enemies animations :
	// 1st kind of enemy:
	enemies[0] = new Array(); // enemies have two animations
	enemies[0]["idle"]	= new $.gQ.Animation({imageURL: "enemy_easy.png"});
	enemies[0]["explode"]	= new $.gQ.Animation({imageURL: "enemy_easy_kill.png", numberOfFrame: 100, delta: 100, rate: 1, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// 2nd kind of enemy:
	enemies[1] = new Array();
	enemies[1]["idle"]	= new $.gQ.Animation({imageURL: "enemy_medium.png"});
	enemies[1]["explode"] = new $.gQ.Animation({imageURL: "enemy_medium_kill.png", numberOfFrame: 100, delta: 100, rate: 1, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// 3rd kind of enemy:
	enemies[2] = new Array();
	enemies[2]["idle"]	= new $.gQ.Animation({imageURL: "enemy_hard.png",});
	enemies[2]["explode"]	= new $.gQ.Animation({imageURL: "enemy_hard_kill.png", numberOfFrame: 100, delta: 100, rate: 1, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	pills[0] = new Array(); // enemies have two animations
	pills[0]["idle"]	= new $.gQ.Animation({imageURL: "pill.png", numberOfFrame: 1, delta: 52, rate: 60, type: $.gQ.ANIMATION_VERTICAL});
	pills[0]["explode"]	= new $.gQ.Animation({imageURL: "pill.png", numberOfFrame: 1, delta: 52, rate: 30, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// Weapon missile:
	missile["player"] = new $.gQ.Animation({imageURL: "user_bullet.png", numberOfFrame: 1, delta: 15, rate: 90, type: $.gQ.ANIMATION_VERTICAL});
	missile["enemies"] = new $.gQ.Animation({imageURL: "enemy_bullet.png", numberOfFrame: 1, delta: 15, rate: 90, type: $.gQ.ANIMATION_VERTICAL});
	missile["playerexplode"] = new $.gQ.Animation({imageURL: "user_bullet.png" , numberOfFrame: 1, delta: 15, rate: 90, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	missile["enemiesexplode"] = new $.gQ.Animation({imageURL: "enemy_bullet.png" , numberOfFrame: 1, delta: 15, rate: 90, type: $.gQ.ANIMATION_VERTICAL | $.gQ.ANIMATION_CALLBACK});
	
	// Initialize the game:
	$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true});
				
	// Initialize the background
	$.playground().addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background1", {animation: background1, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background2", {animation: background2, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
						.addSprite("background3", {animation: background3, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background4", {animation: background4, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
						.addSprite("background5", {animation: background5, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addSprite("background6", {animation: background6, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
					.end()
					.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
						.addGroup("player", {posx: PLAYGROUND_WIDTH/2, posy: PLAYGROUND_HEIGHT/2, width: 100, height: 73})
							.addSprite("playerBoostUp", {animation: playerAnimation["idle"], width: 100, height: 73})
							.addSprite("playerBody",{animation: playerAnimation["idle"], width: 100, height: 73})
							.addSprite("playerBooster", {animation: playerAnimation["idle"], width: 100, height: 73})
							.addSprite("playerBoostDown", {animation: playerAnimation["idle"], width: 100, height: 73})
						.end()
					.end()
					.addGroup("playerMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
					.addGroup("enemiesMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
					.addGroup("overlay",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});
	
	$("#player")[0].player = new Player($("#player"));
	
	//this is the HUD for the player life and shield
	$("#overlay").append("<div id='scoreHUD'style='color: white; width: 100px; position: absolute; font-family: verdana, sans-serif;'></div><div id='shieldHUD'style='color: white; width: 100px; position: absolute; right: 100px; font-family: verdana, sans-serif;'></div><div id='lifeHUD'style='color: white; width: 100px; position: absolute; right: 10px; font-family: verdana, sans-serif;'></div>")
	
	// this sets the id of the loading bar:
	$.loadCallback(function(percent){
		$("#loadingBar").width(400*percent);
	});
	
	//initialize the start button
	$("#startbutton").click(function(){
		$.playground().startGame(function(){
			$("#welcomeScreen").fadeTo(1000,0,function(){$(this).remove();});
		});
	})
	
	// this is the function that control most of the game logic 
	$.playground().registerCallback(function(){
		if(!gameOver){
			$("#shieldHUD").html("shield: "+$("#player")[0].player.shield);
			$("#scoreHUD").html("score: " +$("#player")[0].player.score);
			$("#lifeHUD").html("life: "+$("#player")[0].player.replay);
			//Update the movement of the ship:
			if(!playerHit){
				$("#player")[0].player.update();
				if(jQuery.gameQuery.keyTracker[65]){ //this is left! (a)
					var nextpos = $("#player").x()-5;
					if(nextpos > 0){
						$("#player").x(nextpos);
					}
				}
				if(jQuery.gameQuery.keyTracker[68]){ //this is right! (d)
					var nextpos = $("#player").x()+5;
					if(nextpos < PLAYGROUND_WIDTH - 100){
						$("#player").x(nextpos);
					}
				}
				if(jQuery.gameQuery.keyTracker[87]){ //this is up! (w)
					var nextpos = $("#player").y()-3;
					if(nextpos > -60){
						$("#player").y(nextpos);
					}
				}
				if(jQuery.gameQuery.keyTracker[83]){ //this is down! (s)
					var nextpos = $("#player").y()+3;
					if(nextpos < PLAYGROUND_HEIGHT - 73){
						$("#player").y(nextpos);
					}
				}
			} else {
				var posy = $("#player").y()+5;
				var posx = $("#player").x()-5;
				if(posy > PLAYGROUND_HEIGHT){
					//Does the player did get out of the screen?
					if($("#player")[0].player.respawn()){
						gameOver = true;
						$("#playground").append('<div style="position: fixed; top: 35%; left: 35%; color: white; font-family: verdana, sans-serif;"><center><h1>Game Over</h1><br><a style="cursor: pointer;" id="restartbutton">Click here to restart the game!</a></center></div>');
						$("#restartbutton").click(restartgame);
						$("#actors,#playerMissileLayer,#enemiesMissileLayer").fadeTo(1000,0);
						$("#background").fadeTo(5000,0);
					} else {
						$("#explosion").remove();
						$("#player").children().show();
						$("#player").y(PLAYGROUND_HEIGHT / 2);
						$("#player").x(PLAYGROUND_WIDTH / 2);
						playerHit = false;
					}
				} else {
					$("#player").y(posy);
					$("#player").x(posx);
				}
			}
			
			//Update the movement of the enemies
			$(".pill").each(function(){
					this.pill.update($("#player"));
					var posx = $(this).x();
					if((posx + 100) < 0){
						$(this).remove();
						return;
					}
					var collided = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
					if(collided.length > 0){
						
						$(this).setAnimation(pills[0]["explode"], function(node){$(node).remove();});
						$(this).css("width", 10);
						$(this).removeClass("pill");
						$("#player")[0].player.shield = 3;
					}
				
			});
			
						
			
			
			$(".enemy").each(function(){
					this.enemy.update($("#player"));
					var posx = $(this).x();
					if((posx + 100) < 0){
						$(this).remove();
						return;
					}
					//Test for collisions
					var collided = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
					if(collided.length > 0){
						if(this.enemy instanceof Bossy){
								$(this).setAnimation(enemies[2]["explode"], function(node){$(node).remove();});
								$(this).css("width", 109);
						} else if(this.enemy instanceof Brainy) {
							$(this).setAnimation(enemies[1]["explode"], function(node){$(node).remove();});
							$(this).css("width", 186);
						} else {
							$(this).setAnimation(enemies[0]["explode"], function(node){$(node).remove();});
							$(this).css("width", 66);
						}
						$(this).removeClass("enemy");
						//The player has been hit!
						if($("#player")[0].player.damage()){
							explodePlayer($("#player"));
						}
					}
					//Make the enemy fire
					if(this.enemy instanceof Brainy){
						if(Math.random() < 0.05){
							var enemyposx = $(this).x();
							var enemyposy = $(this).y();
							var name = "enemiesMissile_"+Math.ceil(Math.random()*1000);
							$("#enemiesMissileLayer").addSprite(name,{animation: missile["enemies"], posx: enemyposx + 20, posy: (enemyposy + 40), width: 30,height: 15});
							$("#"+name).addClass("enemiesMissiles");
						}
					}
				});
			
			//Update the movement of the missiles
			$(".playerMissiles").each(function(){
					var posx = $(this).x();
					if(posx > PLAYGROUND_WIDTH){
						$(this).remove();
						return;
					}
					$(this).x(MISSILE_SPEED, true);
					//Test for collisions
					var collided = $(this).collision(".enemy,."+$.gQ.groupCssClass);
					if(collided.length > 0){
						//An enemy has been hit!
						collided.each(function(){
								if($(this)[0].enemy.damage()){
									if(this.enemy instanceof Bossy){
											$(this).setAnimation(enemies[2]["explode"], function(node){$(node).remove();});
											$(this).css("width",100);
											$(this).css("height",100);
											$("#player")[0].player.score += 200;
									} else if(this.enemy instanceof Brainy) {
										$(this).setAnimation(enemies[1]["explode"], function(node){$(node).remove();});
										$(this).css("width", 86);
										$(this).css("height",80);
										$("#player")[0].player.score += 100;
									} else {
										$(this).setAnimation(enemies[0]["explode"], function(node){$(node).remove();});
										$(this).css("width", 66);
										$(this).css("height",76);
										$("#player")[0].player.score += 50;
									}
									$(this).removeClass("enemy");
								}
							})
						$(this).setAnimation(missile["playerexplode"], function(node){$(node).remove();});
						$(this).y(-7, true);
						$(this).removeClass("playerMissiles");
					}
				});
			$(".enemiesMissiles").each(function(){
					var posx = $(this).x();
					if(posx < 0){
						$(this).remove();
						return;
					}
					$(this).x(-MISSILE_SPEED, true);
					//Test for collisions
					var collided = $(this).collision("#playerBody,."+$.gQ.groupCssClass);
					if(collided.length > 0){
						//The player has been hit!
						collided.each(function(){
								if($("#player")[0].player.damage()){
									explodePlayer($("#player"));
								}
							})
						//$(this).remove();
						$(this).setAnimation(missile["enemiesexplode"], function(node){$(node).remove();});
						$(this).removeClass("enemiesMissiles");
					}
				});
		}
	}, REFRESH_RATE);
	
	//This function manage the creation of the enemies
	$.playground().registerCallback(function(){
		if(!bossMode && !gameOver){
			if(Math.random() < 0.4){
				var name = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: enemies[0]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 66, height: 74});
				$("#"+name).addClass("enemy");
				$("#"+name)[0].enemy = new Minion($("#"+name));
			} else if (Math.random() < 0.5){
				var name = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: enemies[1]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 94, height: 74});
				$("#"+name).addClass("enemy");
				$("#"+name)[0].enemy = new Brainy($("#"+name));
			} else if (Math.random() > 0.7){
				var name = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: pills[0]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 20, height: 15});
				$("#"+name).addClass("pill");
				$("#"+name)[0].pill = new VitaminC($("#"+name));
			} else if(Math.random() > 0.8){
				bossMode = true;
				bossName = "enemy1_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(bossName, {animation: enemies[2]["idle"], posx: PLAYGROUND_WIDTH, posy: Math.random()*PLAYGROUND_HEIGHT,width: 100, height: 100});
				$("#"+bossName).addClass("enemy");
				$("#"+bossName)[0].enemy = new Bossy($("#"+bossName));
			}
		} else {
			if($("#"+bossName).length == 0){
				bossMode = false;
			}
		}
		
	}, 1000); //once per seconds is enough for this 
	
	
	//This is for the background animation
	$.playground().registerCallback(function(){
		//Offset all the pane:
		var newPos = ($("#background1").x() - smallStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background1").x(newPos);
		
		newPos = ($("#background2").x() - smallStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background2").x(newPos);
		
		newPos = ($("#background3").x() - mediumStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background3").x(newPos);
		
		newPos = ($("#background4").x() - mediumStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background4").x(newPos);
		
		newPos = ($("#background5").x() - bigStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background5").x(newPos);
		
		newPos = ($("#background6").x() - bigStarSpeed - PLAYGROUND_WIDTH) % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background6").x(newPos);
		
		
	}, REFRESH_RATE);
	
	//this is where the keybinding occurs
	$(document).keydown(function(e){
		if(!gameOver && !playerHit){
			switch(e.keyCode){
				case 75: //this is shoot (k)
					//shoot missile here
					var playerposx = $("#player").x();
					var playerposy = $("#player").y();
					var name = "playerMissle_"+Math.ceil(Math.random()*1000);
					$("#playerMissileLayer").addSprite(name,{animation: missile["player"], posx: playerposx + 90, posy: playerposy + 60, width: 27,height: 10});
					$("#"+name).addClass("playerMissiles")
					break;
				case 65: //this is left! (a)
					$("#playerBooster").setAnimation();
					break;
				case 87: //this is up! (w)
					$("#playerBoostUp").setAnimation(playerAnimation["up"]);
					break;
				case 68: //this is right (d)
					$("#playerBooster").setAnimation(playerAnimation["booster"]);
					break;
				case 83: //this is down! (s)
					$("#playerBoostDown").setAnimation(playerAnimation["down"]);
					break;
			}
		}
	});
	//this is where the keybinding occurs
	$(document).keyup(function(e){
		if(!gameOver && !playerHit){
			switch(e.keyCode){
				case 65: //this is left! (a)
					$("#playerBooster").setAnimation(playerAnimation["boost"]);
					break;
				case 87: //this is up! (w)
					$("#playerBoostUp").setAnimation();
					break;
				case 68: //this is right (d)
					$("#playerBooster").setAnimation(playerAnimation["boost"]);
					break;
				case 83: //this is down! (s)
					$("#playerBoostDown").setAnimation();
					break;
			}
		}
	});
});




$("#UP").click(function(){
        var nextpos = $("#player").y()-5;
                    if(nextpos > -60){
                        $("#player").y(nextpos);
                    }
    })
    $("#DOWN").click(function(){
        var nextpos = $("#player").y()+5;
                    if(nextpos < PLAYGROUND_HEIGHT - 73){
                        $("#player").y(nextpos);
                    }
    })
    $("#LEFT").click(function(){
        var nextpos = $("#player").x()-5;
            if(nextpos > 0){
                $("#player").x(nextpos);
            }
    })
    $("#RIGHT").click(function(){
        var nextpos = $("#player").x()+5
            if(nextpos < PLAYGROUND_WIDTH - 100){
                $("#player").x(nextpos);
            }
    })
    $("#SHOOT").click(function(){
        var playerposx = $("#player").x();
        var playerposy = $("#player").y();
        var name = "playerMissle_"+Math.ceil(Math.random()*1000);
        $("#playerMissileLayer").addSprite(name,{animation: missile["player"], posx: playerposx + 90, posy: playerposy + 60, width: 27,height: 10});
        $("#"+name).addClass("playerMissiles")
    })