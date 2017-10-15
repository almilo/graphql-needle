'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extractSchemaAnnotations = extractSchemaAnnotations;

var _graphql = require('graphql');

var _index = require('../utils/index');

function extractSchemaAnnotations(annotatedSchema) {
    var schemaAnnotations = [];
    var remoteSchemasExtractorVisitor = createSchemaAnnotationVisitor(schemaAnnotations);
    var annotatedSchemaAst = (0, _graphql.parse)(annotatedSchema);

    (0, _graphql.visit)(annotatedSchemaAst, remoteSchemasExtractorVisitor);

    return schemaAnnotations;
}

function createSchemaAnnotationVisitor(schemaAnnotations) {
    var typeExtensionWithSchemaDirective = {
        definition: {
            directives: function directives(_directives) {
                return _directives.length === 1 && _directives[0].name.value === 'schema';
            }
        }
    };

    return {
        TypeExtensionDefinition: (0, _index.ifNodeMatches)(typeExtensionWithSchemaDirective, extractSchemaAnnotation)
    };

    function extractSchemaAnnotation(_ref) {
        var directives = _ref.definition.directives;

        var schemaDirective = directives[0];

        var _asNamedArguments = (0, _index.asNamedArguments)(schemaDirective.arguments),
            uri = _asNamedArguments.uri;

        schemaAnnotations.push({ uri: uri });
    }
}