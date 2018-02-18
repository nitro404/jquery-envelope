# jQuery Envelope

[![NPM version][npm-version-image]][npm-url]
[![Build Status][build-status-image]][build-status-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Known Vulnerabilities][vulnerabilities-image]][vulnerabilities-url]
[![Downloads][npm-downloads-image]][npm-url]

A wrapper for jQuery's AJAX function to allow for simpler RESTful API transactions.

## Client-Side Usage

```html
<script src="jquery-envelope.js"></script>

<script type="text/javascript">
	envelope.setBaseUrl("http://127.0.0.1:3000");

	envelope.get(
		"status",
		function(error, result) {
			if(error) {
				return console.error(error);
			}

			return console.log(result);
		}
	);
</script>
```

## Installation

To install this module:
```bash
npm install jquery-envelope
```

[npm-url]: https://www.npmjs.com/package/jquery-envelope
[npm-version-image]: https://img.shields.io/npm/v/jquery-envelope.svg
[npm-downloads-image]: http://img.shields.io/npm/dm/jquery-envelope.svg

[build-status-url]: https://travis-ci.org/nitro404/jquery-envelope
[build-status-image]: https://travis-ci.org/nitro404/jquery-envelope.svg?branch=master

[coverage-url]: https://coveralls.io/github/nitro404/jquery-envelope?branch=master
[coverage-image]: https://coveralls.io/repos/github/nitro404/jquery-envelope/badge.svg?branch=master

[vulnerabilities-url]: https://snyk.io/test/github/nitro404/jquery-envelope?targetFile=package.json
[vulnerabilities-image]: https://snyk.io/test/github/nitro404/jquery-envelope/badge.svg?targetFile=package.json
