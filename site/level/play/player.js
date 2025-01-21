"use strict";

class Player extends Hitbox {
	// falling
	static gravity = 200; // gravitational acceleration (tiles/second^2)
	static terminal_velocity = 200; // maximum fall speed (tiles/second)
	static jump_velocity = 35; // initial velocity of jump (tiles/second)
	static coyote_time = 0.05; // time after running off edge when jumping is still allowed (seconds)
	static high_fall_speed = 40; // how fast to hit the ground to trigger landing animation (tiles/second)

	// wall cling
	static wall_slide_speed = 10; // terminal velocity during wall slide (tiles/second)
	static wall_slide_deceleration = 140; // how much wall sliding counteracts gravity (tiles/second^2)
	static wall_stall_time = 0.3; // how long until player starts sliding when wall clinging (seconds)
	static wall_cling_stall_deceleration = 300; // friction applied to keep player stationary during wall cling (tiles/second^2)
	static wall_jump_angle = 55 * Math.PI / 180; // angle players jumps off walls with (rad)

	// walking
	static acceleration = 100; // sideways acceleration (tiles/second^2)
	static deceleration = 200; // sideways friction (tiles/second^2)
	static max_speed = 15; // maximum sideways speed (tiles/second)

	// dashing
	static dash_speed = 35; // set speed during dash (tiles/second)
	static dash_time = 0.15; // duration of dash (seconds)

	// hitbox
	static width = 1.4; // width of player (tiles)
	static height = 2.5; // height of player (tiles)

	// sprites
	static falling_dir_threshold = 5; // how fast to fall before changing sprite (tiles/second)
	static sprites = [ // list of sprite states
		"idle",
		"run",
		"jump",
		"airborne",
		"fall",
		"land",
		"wall cling",
		"wall land"
	];

	// keybinds
	static keybinds = { // key: action
		"w": "up",
		"s": "down",
		"a": "left",
		"d": "right",
		" ": "jump",
		"shift": "dash",

		"arrowup": "up",
		"arrowdown": "down",
		"arrowleft": "left",
		"arrowright": "right",
		"z": "jump",
		"x": "dash",

		"k": "jump",
		"l": "dash"
	}

	constructor(template) {
		super(template.x, template.y, Player.width, Player.height);

		this.dx = 0; // speed in x direction (tiles/second)
		this.dy = 0; // speed in y direction (tiles/second)

		this.state = null; // current state
		this.jump_state = null; // state from witch to jump
		this.coyote_timer = 0; // for how long jumping is still allowed (seconds)
		this.stall_timer = 0; // for how long player is still wall clinged (seconds)

		this.dash_count = 0; // amount of dashes player has left before refresh
		this.max_dash_count = template.max_dash_count; // amount of dashes gained on refresh
		this.dash_timer = 0; // how long the player is still dashing
		this.dash_dir_x = 0; // direction of dash in x
		this.dash_dir_y = 0; // direction of dash in y
		this.facing_dir = 1; // x direction player is currently facing

		this.prev_fall_speed = 0; // dy of player before last hitting the ground

		this.inputs = {}; // input actions and wether they are held
		for (const key in Player.keybinds)
			this.inputs[Player.keybinds[key]] = false; // initialize them to not held

		// starts holding action on keydown and stops on keyup
		document.addEventListener("keydown", e => {
			if (e.repeat) return;
			const key = e.key.toLowerCase();
			if (key in Player.keybinds)
				this.inputs[Player.keybinds[key]] = true;
		});
		document.addEventListener("keyup", e => {
			const key = e.key.toLowerCase();
			if (key in Player.keybinds)
				this.inputs[Player.keybinds[key]] = false;
		});

		// All sprites used by player
		this.sprites = Object.fromEntries(Player.sprites.map(i => [i, new Sprite(game.sprites[`player ${i}`])]));
		this.sprite_state = Player.sprites[0]; // current sprite state
	};

	// handles input and logic of jumping and gravity
	handle_jump(dt) {
		// don't jump while dashing
		if (this.state === "dash") {
			// reset jump state on dash
			this.jump_state = null;
			this.coyote_timer = 0;
			return;
		}

		// apply gravity
		this.dy += Player.gravity * dt;
		// apply terminal velocity
		if (this.dy >= Player.terminal_velocity)
			this.dy = Player.terminal_velocity;

		switch (this.state) {
			case "falling":
				if (this.coyote_timer <= 0) {
					// can no longer jump after coyote timer runs out
					this.jump_state = null;
					this.coyote_timer = 0;
				} else this.coyote_timer -= dt; // update coyote timer
				break;

			case "grounded":
			case "left cling":
			case "right cling":
				// reset jump after hitting ground or wall
				this.jump_state = this.state;
				this.coyote_timer = Player.coyote_time;
				break;
		}

		// early return if not jumping
		if (!this.inputs["jump"] || this.jump_state === null) return;

		let jump_dir = 1; // direction of wall jump
		switch (this.jump_state) {
			case "grounded":
				// jump straight up
				this.dy = -Player.jump_velocity;
				break;

			case "left cling":
				jump_dir = -1;
			case "right cling":
				// jump with same speed but angled away from wall
				this.dy = -Math.sin(Player.wall_jump_angle) * Player.jump_velocity;
				this.dx = -Math.cos(Player.wall_jump_angle) * Player.jump_velocity * jump_dir;
				break;
		}

		// prevent jumping instantly when able if button in still held
		this.inputs["jump"] = false
		// reset states after jumping
		this.state = "falling";
		this.jump_state = null;
		this.coyote_timer = 0;
	}

	// handles input and logic of movement
	handle_movement(dt) {
		// don't move while dashing
		if (this.state === "dashing") return;

		// accelerate in held direction
		if (this.inputs["left"] && !this.inputs["right"])
			this.dx -= Player.acceleration * dt;
		if (this.inputs["right"] && !this.inputs["left"])
			this.dx += Player.acceleration * dt;
		// decelerate if not holing a direction or if player is too fast
		if (this.inputs["left"] == this.inputs["right"] || Math.abs(this.dx) > Math.abs(Player.max_speed)) {
			if (Math.abs(this.dx) > Player.deceleration * dt) // don't overshoot and change direction
				this.dx -= Player.deceleration * dt * Math.sign(this.dx);
			else this.dx = 0;
		}
	}

	// handles logic of fall clinging and sliding
	handle_wall_cling(dt) {
		// only apply if on wall
		if (!(this.state === "right cling" || this.state === "left cling")) return;

		if (this.stall_timer > 0) { // currently stalling
			this.stall_timer -= dt; // update stall timer
			// deceleration to be applied (tiles/second^2)
			const a = Player.wall_cling_stall_deceleration * dt * Math.sign(this.dy);
			if (Math.abs(this.dy) > Math.abs(a)) // don't overshoot and change direction
				this.dy -= a;
			else this.dy = 0;
		} else {
			this.stall_timer = 0;
			// decelerate against gravity
			this.dy -= Player.wall_slide_deceleration * dt;
		}

		// apply terminal velocity
		if (this.dy >= Player.wall_slide_speed)
			this.dy = Player.wall_slide_speed;
	}

	// handles input and logic of dashing
	handle_dash(dt) {
		// reset dash when standing on the floor
		if (this.state === "grounded")
			this.dash_count = this.max_dash_count;

		// if initiating dash
		if (this.inputs["dash"] && this.dash_count > 0) {
			this.inputs["dash"] = false; // prevent automatically chaining dashes
			this.dash_count--; // reduce remaining dashes
			this.dash_timer = Player.dash_time; // set dash time

			// get x direction of dash
			this.dash_dir_x = 0;
			if (this.inputs["left"])
				this.dash_dir_x--;
			if (this.inputs["right"])
				this.dash_dir_x++;

			// get y direction of dash
			this.dash_dir_y = 0;
			if (this.inputs["up"])
				this.dash_dir_y--;
			if (this.inputs["down"])
				this.dash_dir_y++;

			// default to dashing forwards and always dash away from wall if clinged
			if ((this.dash_dir_x === 0 && this.dash_dir_y === 0) ||
				this.state === "left cling" || this.state === "right cling")
				this.dash_dir_x = this.facing_dir;

			this.state = "dash";
		}

		// early return if not dashing
		if (this.state !== "dash") return;

		this.dash_timer -= dt; // update dash timer
		if (this.dash_timer <= 0) {
			// reset to falling state after finishing dash
			this.state = "falling";
			this.dash_timer = 0;
			this.dash_dir = [0, 0];
			return;
		}

		// set speed during dash
		this.dx = this.dash_dir_x * Player.dash_speed;
		this.dy = this.dash_dir_y * Player.dash_speed;
		// normalize velocity vector
		if (this.dash_dir_y !== 0)
			this.dx *= Math.SQRT1_2;
		if (this.dash_dir_x !== 0)
			this.dy *= Math.SQRT1_2;
	}

	// collide with objects and die from hazards
	handle_collision(dt, objects) {
		// next theoretical position
		const next = new Hitbox(this.x + this.dx * dt, this.y + this.dy * dt, this.w, this.h);

		let next_state = "falling"; // next state player will take
		let will_die = false; // wether player will die this tick

		objects.forEach(o => {
			// check if within horizontal bounds
			if (next.left() < o.right() && o.left() < next.right()) {
				// check if next position would pass through object

				// floor
				if (o.collide_top && this.bottom() <= o.top() && next.bottom() > o.top()) {
					// kill player if object is deadly, otherwise collide with it,
					if (o.deadly) will_die = true;
					else {
						next.set_bottom(o.top()); // set new theoretical position
						this.prev_fall_speed = this.dy; // save speed at which player hit the ground
						this.dy = 0; // reset speed when hitting object
					}
				}
				// ceiling
				if (o.collide_bottom && this.top() >= o.bottom() && next.top() < o.bottom()) {
					if (o.deadly) will_die = true;
					else {
						next.set_top(o.bottom());
						this.dy = 0;
					}
				}
			}
			// check if within vertical bounds
			if (next.top() < o.bottom() && o.top() < next.bottom()) {
				// check if next position would pass through object

				// right wall
				if (o.collide_left && this.right() <= o.left() && next.right() > o.left()) {
					if (o.deadly) will_die = true;
					else {
						next.set_right(o.left());
						this.dx = 0;
					}
				}
				// left wall
				if (o.collide_right && this.left() >= o.right() && next.left() < o.right()) {
					if (o.deadly) will_die = true;
					else {
						next.set_left(o.right());
						this.dx = 0;
					}
				}
			}

			// update state
			if (next.bottom() === o.top()) // exactly on top of object
				next_state = "grounded";
			if (next_state === "falling") { // grounded takes priority over clinged
				// grab onto wall only if already on it or holding towards it
				if (next.left() === o.right() && next.top() < o.bottom() && o.top() < next.bottom() &&
					(this.state === "left cling" || this.inputs["left"]))
					next_state = "left cling";
				if (next.right() === o.left() && next.top() < o.bottom() && o.top() < next.bottom()
					&& (this.state === "right cling" || this.inputs["right"]))
					next_state = "right cling";
			}

			if (will_die) game.handle_death(); // kill player if hazard was hit
		});

		// reset stall time if beginning clinging
		if (!(this.state === "left cling" || this.state === "right cling") &&
			(next_state === "left cling" || next_state === "right cling"))
			this.stall_timer = Player.wall_stall_time;
		// update state only after dashing
		if (this.state !== "dash")
			this.state = next_state;

		// update to new position
		this.x = next.x;
		this.y = next.y;
	}

	// collect items
	handle_items(items) {
		items.forEach(i => {
			// if overlapping with item
			if (this.left() < i.right() && i.left() < this.right() &&
				this.top() < i.bottom() && i.top() < this.bottom())

				if (i.collect(this)) // if able to collect
					// reset dash, possibly beyond max count
					this.dash_count = Math.max(this.dash_count, this.max_dash_count, i.restore_count);
		})
	}

	// check for goals
	handle_goals(goals) {
		goals.forEach(g => {
			// if overlapping with goal
			if (this.left() < g.right() && g.left() < this.right() &&
				this.top() < g.bottom() && g.top() < this.bottom())
				game.handle_win(); // you win the game
		})
	}

	// handle sprite updating
	handle_animation(dt) {
		switch (this.state) {
			case "grounded":
			case "falling":
				// face the direction player last moved in
				if (this.dx > 0)
					this.facing_dir = 1;
				if (this.dx < 0)
					this.facing_dir = -1;
				break;
			// face away from walls
			case "left cling":
				this.facing_dir = 1;
				break;
			case "right cling":
				this.facing_dir = -1;
				break;
		}

		// update sprite animation
		this.sprites[this.sprite_state].animate(dt);

		switch (this.state) {
			case "grounded":
				// show landing animation if falling with great enough speed
				if (this.sprite_state === "fall" && this.prev_fall_speed >= Player.high_fall_speed) {
					this.sprite_state = "land";
					this.sprites["land"].reset();
				}
				if (this.dx === 0) {
					if (this.sprite_state !== "land" || this.sprites["land"].on_cooldown)
						this.sprite_state = "idle"; // idle animation when standing still and not landing
				}
				else {
					this.sprite_state = "run";
					// running animation speed proportional to running speed
					this.sprites["run"].spf = 0.07 * Math.abs(Player.max_speed / this.dx);
				}
				break;

			case "falling":
				// jumping upwards
				if (this.dy < -Player.falling_dir_threshold)
					this.sprite_state = "jump";
				// falling downwards
				else if (this.dy > Player.falling_dir_threshold)
					this.sprite_state = "fall";
				// almost stationary mid air
				else this.sprite_state = "airborne";
				break;

			case "left cling":
			case "right cling":
				// show wall land animation when first starting wall cling
				if (!(this.sprite_state === "wall land" || this.sprite_state === "wall cling")) {
					this.sprite_state = "wall land";
					this.sprites["wall land"].reset();
				}

				if (this.stall_timer === 0) {
					// stop wall land animation after stall timer runs out and animation is finished
					if (this.sprite_state !== "wall land" || this.sprites["wall land"].on_cooldown)
						this.sprite_state = "wall cling";
				} else {
					this.sprites["wall cling"].reset();
				}
				break;

			case "dash":
				// no dashing animation implemented
				break;

		}
	}

	// update player input, physics and animation
	update(dt, objects, items, goals) {
		this.handle_dash(dt);
		this.handle_jump(dt);
		this.handle_movement(dt);
		this.handle_wall_cling(dt);
		this.handle_collision(dt, objects);
		this.handle_items(items);
		this.handle_goals(goals);
		this.handle_animation(dt);
	}

	// draw player at current position
	draw(c) {
		// flip sprite if facing left
		this.sprites[this.sprite_state].draw(c, this.x, this.y, this.w, this.h, this.facing_dir < 0);
	}
};
