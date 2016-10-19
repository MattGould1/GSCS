
//debug function
function logger(log) {
	if (dev === true) {
		console.log(log);
	}
}

function superLogger(log) {
	if (superdev === true) {
		console.log(log);
	}
}