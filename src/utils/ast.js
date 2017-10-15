export function ifNodeMatches(shape, action) {
    return node => {
        if (doesNodeMatchShape(node, shape)) {
            action(node);
        }
    };
}

export function doesNodeMatchShape(node, shape) {
    return node && shape && Object.keys(shape).every(nodePropertyMatchesShape);

    function nodePropertyMatchesShape(shapeKey) {
        const shapeValueOrFunction = shape[shapeKey];
        const nodePropertyValue = node[shapeKey];

        return typeof shapeValueOrFunction === 'function'
            ? shapeValueOrFunction(nodePropertyValue)
            : isPrimitive(shapeValueOrFunction)
                ? shapeValueOrFunction === nodePropertyValue
                : doesNodeMatchShape(nodePropertyValue, shapeValueOrFunction);
    }
}

export function asNamedArguments(directiveArguments) {
    return directiveArguments.reduce(toArgumentMap, {});

    function toArgumentMap(argumentMap, {name, value}) {
        argumentMap[name.value] = value.value;

        return argumentMap;
    }
}

function isPrimitive(value) {
    return value == null || /^[sbn]/.test(typeof value);
}
