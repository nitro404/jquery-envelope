if(typeof require !== "undefined") {
	if(typeof utilities === "undefined") {
		global.utilities = require("extra-utilities");
	}
}

var envelope = { };

var validMethods = ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"]

var defaultOptions = {
	baseUrl: null,
	authorization: null,
	timeout: 30000
};

envelope.hasBaseUrl = function() {
	return utilities.isNonEmptyString(defaultOptions.baseUrl);
};

envelope.getBaseUrl = function() {
	return defaultOptions.baseUrl;
};

envelope.setBaseUrl = function(url) {
	if(utilities.isEmptyString(url)) {
		return;
	}

	defaultOptions.baseUrl = url;
};

envelope.clearBaseUrl = function() {
	defaultOptions.baseUrl = null;
};

envelope.getAuthorization = function() {
	return defaultOptions.authorization;
};

envelope.hasAuthorization = function() {
	return utilities.isNonEmptyString(defaultOptions.authorization);
};

envelope.setAuthorizationToken = function(token) {
	if(utilities.isEmptyString(token)) { return; }

	defaultOptions.authorization = token;
};

envelope.setBasicAuthorization = function(userName, password) {
	if(utilities.isEmptyString(userName) || utilities.isEmptyString(password)) { return; }

	defaultOptions.authorization = "Basic " + btoa(userName + ":" + password);
};

envelope.clearAuthorization = function() {
	defaultOptions.authorization = null;
};

envelope.hasTimeout = function() {
	return utilities.isValid(defaultOptions.timeout);
};

envelope.getTimeout = function() {
	return defaultOptions.timeout;
};

envelope.setTimeout = function(timeout) {
	if(timeout === null) {
		defaultOptions.timeout = null;
		return;
	}

	var formattedTimeout = utilities.parseInteger(timeout);

	if(utilities.isInvalidNumber(formattedTimeout) || formattedTimeout < 1) {
		return;
	}

	defaultOptions.timeout = formattedTimeout;
};

envelope.request = function(method, path, data, query, options, callback) {
	if(utilities.isFunction(data)) {
		callback = data;
		options = null;
		query = null;
		data = null;
	}
	else if(utilities.isFunction(query)) {
		callback = query;
		options = null;
		query = null;
	}
	else if(utilities.isFunction(options)) {
		callback = options;
		options = null;
	}

	if(!utilities.isFunction(callback)) {
		throw new Error("Missing or invalid callback function!");
	}

	if(utilities.isEmptyString(method)) {
		return callback(new Error("Missing or invalid method type: \"" + method + "\"."));
	}

	var formattedMethod = method.toUpperCase().trim();
	var isUpload = formattedMethod === "UPLOAD";

	if(isUpload) {
		formattedMethod = "POST";
	}

	var validMethod = false;

	for(var i=0;i<validMethods.length;i++) {
		if(formattedMethod === validMethods[i]) {
			validMethod = true;
			break;
		}
	}

	if(!validMethod) {
		return callback(new Error("Invalid method type: \"" + formattedMethod + "\" - expected one of: " + validMethods.join(", ") + "."));
	}

	var hasBody = formattedMethod === "POST" ||
				  formattedMethod === "PUT" ||
				  formattedMethod === "PATCH";

	if(utilities.isValid(data) && !hasBody) {
		options = query;
		query = data;
		data = null;
	}

	var newOptions = utilities.isObject(options) ? utilities.clone(options) : { };
	newOptions.type = formattedMethod;
	newOptions.contentType = "application/json";
	newOptions.dataType = "json";
	newOptions.json = true;

	if(newOptions.timeout !== null && !Number.isInteger(newOptions.timeout)) {
		newOptions.timeout = defaultOptions.timeout;
	}

	if(utilities.isInvalid(newOptions.timeout)) {
		delete newOptions.timeout;
	}

	if(utilities.isNonEmptyString(newOptions.baseUrl)) {
		newOptions.url = newOptions.baseUrl;
	}
	else {
		newOptions.url = (utilities.isNonEmptyString(defaultOptions.baseUrl) ? defaultOptions.baseUrl : "");
	}

	newOptions.url += utilities.prependSlash(path);
	newOptions.url += utilities.createQueryString(query, true);

	if(hasBody && utilities.isValid(data)) {
		newOptions.data = utilities.isObject(data) ? JSON.stringify(data) : data;
	}

	if(!utilities.isObject(newOptions.headers)) {
		newOptions.headers = { };
	}

	if(isUpload) {
		newOptions.headers["Content-Type"] = undefined;
	}
	else if(utilities.isEmptyString(newOptions.headers["Content-Type"])) {
		newOptions.headers["Content-Type"] = "application/json";
	}

	if(utilities.isEmptyString(newOptions.headers["Accepts"])) {
		newOptions.headers["Accepts"] = "application/json";
	}

	if(utilities.isValid(newOptions.authorization)) {
		if(utilities.isNonEmptyString(newOptions.authorization)) {
			if(utilities.isNonEmptyString(newOptions.headers["Authorization"])) {
				console.error("Authorization specified in header data is being overridden by authorization at root level of options.");
			}

			newOptions.headers["Authorization"] = newOptions.authorization;
		}

		delete newOptions.authorization;
	}

	if(utilities.isEmptyString(newOptions.headers["Authorization"])) {
		if(utilities.isNonEmptyString(defaultOptions.authorization)) {
			newOptions.headers["Authorization"] = defaultOptions.authorization;
		}
	}

	newOptions.success = function(data, textStatus, response) {
		if(utilities.isObject(data) && utilities.isObject(data.error)) {
			return callback(data.error, data, response, textStatus);
		}

		return callback(null, data, response, textStatus);
	};

	newOptions.error = function(response, textStatus, error) {
		if(response.status <= 0) {
			return callback(utilities.createError("Sever connection failed!", 500), null, response, textStatus);
		}

		return callback(error, null, response, textStatus);
	};

	$.ajax(newOptions);
};

envelope.head = function(path, data, query, options, callback) {
	return envelope.request("HEAD", path, data, query, options, callback);
};

envelope.get = function(path, data, query, options, callback) {
	return envelope.request("GET", path, data, query, options, callback);
};

envelope.post = function(path, data, query, options, callback) {
	return envelope.request("POST", path, data, query, options, callback);
};

envelope.put = function(path, data, query, options, callback) {
	return envelope.request("PUT", path, data, query, options, callback);
};

envelope.patch = function(path, data, query, options, callback) {
	return envelope.request("PATCH", path, data, query, options, callback);
};

envelope.delete = function(path, data, query, options, callback) {
	return envelope.request("DELETE", path, data, query, options, callback);
};

envelope.upload = function(path, data, query, options, file, callback) {
	var fileDescriptor = new FormData();

	if(utilities.isValid(file)) {
		fileDescriptor.append("file", file);
	}

	if(utilities.isObjectStrict(data)) {
		for(var attribute in data) {
			if(attribute === "file") {
				continue;
			}

			fileDescriptor.append(attribute, data[attribute]);
		}
	}

	return envelope.request("UPLOAD", path, fileDescriptor, query, options, callback);
};

return envelope;
