'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.ifNodeMatches = ifNodeMatches;
exports.doesNodeMatchShape = doesNodeMatchShape;
exports.asNamedArguments = asNamedArguments;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    return value == null || /^[sbn]/.test(typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value));
}