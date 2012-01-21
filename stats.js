$(function() {
	
	var canvas = document.createElement("canvas");
	canvas.width = $(window).width() - 10;
	canvas.height = $(window).height() - 10;
	document.body.appendChild(canvas);

	var ctx = canvas.getContext("2d");
	
	var time_window = Math.floor(86400000 / 2);
	var time_offset = new Date().getTime() - time_window;
	var time_multiplier = canvas.width / time_window;
	var min_time_offset = time_offset - time_window;
	
	var fontsize = 10;
	ctx.font = "10px Helvetica";
		
	var seshes = [];
	$(".seshes .sesh").each(function(i, ele) {
		ele = $(ele);
		var sesh = {
			_id: ele.find(".id").text(),
			ip: ele.find(".ip").text(),
			"user-agent": ele.find(".user-agent").text(),
			time: Math.floor(ele.find(".time").text()),
			averageFps: ele.find(".averageFps").text(),
			duration: ele.find(".duration").text(),
			screen_res: ele.find(".screen_res").text(),
			window_res: ele.find(".window_res").text()
		};
		var fps_str = $(this).find(".fps").text();
		sesh.fps = fps_str.split(",");
		sesh.time_end = sesh.time + (sesh.fps.length * 1000);
		sesh.y = 0;
		sesh.dy = 0;
		sesh.boxwidth = ctx.measureText(sesh["user-agent"]).width + (fontsize * 2);
		sesh.boxheight = 50;	
		
		var ip = sesh.ip.split(".");
		var color = [ip[0], ip[1], ip[2]];
		for(var i in color) {
			for(var j = 0; j < 4; j++) {
				color[i] -= (ip[j] / 4);
			}
			for(var j = 3; j >= 0; j--) {
				color[i] += ip[j] - ip[i];
			}
			color[i] = Math.floor(Math.abs(color[i]));
			while(color[i] >= 256) color[i] -= 256;
			color[i] |= 0x40;
		}
		sesh.color = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
		
		seshes.push(sesh);
	});
	$(".seshes").remove();
	
	function bump_around() {
		for(var i in seshes) {
			var sesh = seshes[i];
			for(var n in seshes) {
				var seshb = seshes[n];
				if(seshb == sesh) continue;
				if(seshb.y !== sesh.y) continue;
				if(seshb.time < sesh.time     && seshb.time_end < sesh.time) continue;
				if(seshb.time > sesh.time_end && seshb.time_end > sesh.time_end) continue;
				++seshb.y;
			}
		
			if(sesh.time < min_time_offset) min_time_offset = sesh.time - time_window;
		}
		
		for(var i = seshes.length - 1; i >= 0; i--) {
			var sesh = seshes[i];
			for(var n in seshes) {
				var seshb = seshes[n];
				if(seshb == sesh) continue;
				if(seshb.dy !== sesh.dy) continue;
				var box_start_a = sesh.time * time_multiplier - sesh.boxwidth;
				var box_start_b = seshb.time * time_multiplier - seshb.boxwidth;
				if(seshb.time * time_multiplier < box_start_a) continue;
				if(box_start_b > sesh.time * time_multiplier) continue;
				++seshb.dy;
			}
		}
	}
	bump_around();

	var velocity = 0;
	
	var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		
	function redraw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// draw hours
		ctx.strokeStyle = "rgba(255,255,255,0.5)";
		ctx.fillStyle = "rgba(255,255,255,0.5)";
		var date = new Date(time_offset);
		date.setMinutes(0);
		date.setSeconds(0);
		var hour = date.getHours();
		var the_end = time_offset + time_window;
		while(date.getTime() < the_end) {
			var x = (date.getTime() - time_offset) * time_multiplier;
			
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, hour % 12 == 0 ? 24 : 12);
			ctx.stroke();
			
			var hour_str = hour % 12;
			if(hour_str == 0) hour_str = 12;
			var ampm = hour < 12 ? "am" : "pm";
			ctx.fillText(hour_str + ampm, x + 8, 16);
			
			if(hour == 0) {
				ctx.save();
				ctx.font = "20px Helvetica";
				ctx.fillText(weekdays[date.getDay()], x + 4, 34);
				ctx.font = "14px Helvetica";
				ctx.fillText(months[date.getMonth()] + " " + date.getDate(), x + 8, 45);
				ctx.restore();
			}
			
			date.setHours(++hour);
			if(hour == 24) hour = 0;
		}
		
		// draw seshes
		ctx.strokeStyle = "rgb(0,0,0)";
		ctx.strokeWidth = 3;
		for(var i in seshes) {
			var sesh = seshes[i];
			var x = (sesh.time - time_offset) * time_multiplier;
			var width = sesh.fps.length * 1000 * time_multiplier;
			if(x + width < 0) continue;
			if(x > canvas.width) continue;
			var y = 64 + sesh.y * 34;
			ctx.fillStyle = sesh.color;
			ctx.fillRect(x, y, width, 32);
			ctx.strokeRect(x, y, width, 32);
		}
		
		// draw details
		var fontsize = 10;
		ctx.font = "10px Helvetica";
		ctx.strokeWidth = 1;
		for(var i in seshes) {
			var sesh = seshes[i];
			ctx.fillStyle = ctx.strokeStyle = sesh.color;
			var x = (sesh.time - time_offset) * time_multiplier;
			if(x < 0) continue;
			if(x - sesh.boxwidth > canvas.width) continue;
			var y = 64 + sesh.y * 34;
			ctx.beginPath();
			ctx.moveTo(x, y + 32);
			y = 200 + (sesh.dy * (sesh.boxheight + 4));
			ctx.lineTo(x, y + sesh.boxheight);
			ctx.stroke();

			x -= sesh.boxwidth;
			ctx.fillRect(x, y, sesh.boxwidth, sesh.boxheight);
			
			x += fontsize;
			y += fontsize * 2;
			ctx.fillStyle = "rgb(255,255,255)";
			var minutes = Math.floor(sesh.duration / 60);
			var seconds = Math.floor(sesh.duration % 60);
			var duration = (minutes ? minutes + "m" : "") + (seconds < 10 ? "0" : "") + seconds + "s";
			ctx.fillText(sesh.ip + " duration " + duration, x, y);
			y += fontsize;
			ctx.fillText(sesh["user-agent"], x, y);
			y += fontsize;
			ctx.fillText("Average FPS: " + sesh.averageFps + ", screen: " + sesh.screen_res + ", window: " + sesh.window_res, x, y);
		}
	}
	
	
	
	function tick() {
		if(mousex < canvas.width * 0.25) {
			if(velocity > 0) velocity *= 0.8;
			velocity -= time_window * 0.001;
		} else if(mousex > canvas.width * 0.75) {
			if(velocity < 0) velocity *= 0.8;
			velocity += time_window * 0.001;
		} else velocity *= 0.8;
		
		if(Math.abs(velocity) > 100) {
			time_offset += velocity;
			var max_time_offset = new Date().getTime() - time_window;
			if(time_offset > max_time_offset) {
				time_offset = max_time_offset;
				velocity = 0;
			} else if(time_offset < min_time_offset) {
				time_offset = min_time_offset;
				velocity = 0;
			}
			redraw();
		} else {
			velocity = 0;
		}
	}
	
	redraw();
	
	setInterval(tick, 1000 / 30);
	
	var mousex, mousey;
	canvas.addEventListener("mousemove", function(event) {
		mousex = event.pageX;
		mousey = event.pageY;
	});
	
	$(window).resize(function() {
		canvas.width = $(window).width() - 10;
		canvas.height = $(window).height() - 10;

		time_multiplier = canvas.width / time_window;
	});
});
