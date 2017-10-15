'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.ifNodeMatches = ifNodeMatches;
exports.doesNodeMatchShape = doesNodeMatchShape;
exports.asNamedArguments = asNamedArguments;
function ifNodeMatches(shape, action) {
    return function (node) {
        if (doesNodeMatchShape(node, shape)) {
            action(node);
        }
    };
}

function doesNodeMatchShape(node, shape) {
    return node && shape && Object.keys(shape).every(nodePropertyMatchesShape);

    function nodePropertyMatchesShape(shapeKey) {
        var shapeValueOrFunction = shape[shapeKey];
        var nodePropertyValue = node[shapeKey];

        return typeof shapeValueOrFunction === 'function' ? shapeValueOrFunction(nodePropertyValue) : isPrimitive(shapeValueOrFunction) ? shapeValueOrFunction === nodePropertyValue : doesNodeMatchShape(nodePropertyValue, shapeValueOrFunction);
    }
}

function asNamedArguments(directiveArguments) {
    return directiveArguments.reduce(toArgumentMap, {});

    function toArgumentMap(argumentMap, _ref) {
        var name = _ref.name,
            value = _ref.value;

        argumentMap[name.value] = value.value;

        return argumentMap;
    }
}

function isPrimitive(value) {
    return value == null || /^[sbn]/.test(typeof value === 'undefined' ? 'undefined' : _typeof(value));
}