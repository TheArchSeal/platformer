const parse = require("./parse");

// recursively check that object isn't missing values
function is_defined(obj) {
	if (typeof obj === "undefined") return false; // undefined is not defined
	if (typeof obj !== "object" || obj === null) return true; // primitives are defined

	// objects are defined if all their keys are defined
	for (const key in obj)
		if (!is_defined(obj[key]))
			return false;

	return true;
}

module.exports = json => {
	try {
		// check that json is a fully defined level that could actually be played
		return is_defined(parse(JSON.parse(json).data));
	} catch (e) {
		// parsing the json failed
		return false;
	}
}