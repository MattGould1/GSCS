(function ($) {
	function dashboardLoad() {

		console.log(systeminfo);
		//sort out cpu info
		var cpuinfo = $('.cpuinfo');
		var memory = $('.memory');
		var helpful = $('.helpful');
		var uptime = $('.uptime');

		uptime.append('System uptime: ' + systeminfo.uptime);
		systeminfo.cpu.forEach( function (cpu) {
			console.log(cpu);
							 // 			cpu: os.cpus(),
				 			// freemem: os.freemem(),
				 			// hostname: os.hostname(),
				 			// loadavg: os.loadavg(),
				 			// network: os.networkInterfaces(),
				 			// totalmem: os.totalmem(),
				 			// uptime: os.uptime()
			var cpuhtml = '<div class="cpumodel">Model: ' + cpu.model + '(speed: ' + cpu.speed + ')</div>';
			cpuinfo.append(cpuhtml);
		});

		var memhtml = '<div class="totalmem">Total Memory: ' + systeminfo.totalmem + '</div><div class="freemem">Free Memory: ' + systeminfo.freemem + '</div>';
		memory.append(memhtml);

		var networktitle = '<h3>Network Information</h3>';

		helpful.append(networktitle);

		systeminfo.network.lo.forEach( function (lo) {
			var netinfo = '<div class="col-xs-6">' +
							'<div class="netaddress">Network Address: ' + lo.address + '</div>' +
							'<div class="netfamily">Network Family: ' + lo.family + '</div>' +
						  	'<div class="netmac">Network Mac: ' + lo.mac + '</div>' +
						  	'<div class="netmask">Network Mask: ' + lo.netmask + '</div>' +
						  '</div>';
			helpful.append(netinfo);
		});
		
		var a3load = '<h3>Last 3 Load Averages -</h3>';
		helpful.append(a3load);
		systeminfo.loadavg.forEach( function (avg) {
			var loadhtml = '<div class="loadavg">Average (%): ' + avg + '</div>';
			helpful.append(loadhtml);
		});
	}

	window.dashboardLoad = dashboardLoad;
})(jQuery);