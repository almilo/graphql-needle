'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extractStitchAnnotations = extractStitchAnnotations;

var _graphql = require('graphql');

var _index = require('../utils/index');

function extractStitchAnnotations(annotatedSchema) {
    var stitchAnnotations = [];
    var stitchAnnotationVisitor = createStitchAnnotationVisitor(stitchAnnotations);
    var annotatedSchemaAst = (0, _graphql.parse)(annotatedSchema);

    (0, _graphql.visit)(annotatedSchemaAst, stitchAnnotationVisitor);

    return stitchAnnotations;
}

function createStitchAnnotationVisitor(stitchAnnotations) {
    var typeExtensionWithStitchFieldDirective = {
        definition: {
            kind: 'ObjectTypeDefinition',
            name: {
                kind: 'Name'
            },
            fields: hasStitchAnnotatedField
        }
    };

    return {
        TypeExtensionDefinition: (0, _index.ifNodeMatches)(typeExtensionWithStitchFieldDirective, extractStitchAnnotation)
    };

    function hasStitchAnnotatedField(fields) {
        return fields.length === 1 && (0, _index.doesNodeMatchShape)(fields[0], {
            name: { kind: 'Name' },
            directives: function directives(_directives) {
                return _directives.length === 1 && _directives[0].name.value === 'stitch';
            }
        });
    }

    function extractStitchAnnotation(_ref) {
        var definition = _ref.definition;

        var stitchField = definition.fields[0];
        var stitchDirective = stitchField.directives[0];
        var extendedType = definition.name.value;
        var extensionField = stitchField.name.value;

        var _asNamedArguments = (0, _index.asNamedArguments)(stitchDirective.arguments),
            extendedTypeKeyField = _asNamedArguments.keyField,
            resolverQueryField = _asNamedArguments.queryField,
            resolverQueryParameter = _asNamedArguments.queryParameter;

        stitchAnnotations.push({
            extendedType: extendedType,
            extendedTypeKeyField: extendedTypeKeyField,
            extensionField: extensionField,
            resolverQueryField: resolverQueryField,
            resolverQueryParameter: resolverQueryParameter
        });
    }
}