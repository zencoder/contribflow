#!/usr/bin/env node
var contribflow = require('../lib/contribflow.js')();
var type = process.argv[2];
var command = process.argv[3];
var value = process.argv[4];

contribflow[type][command](value);