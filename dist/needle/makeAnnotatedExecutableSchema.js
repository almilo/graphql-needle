'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeAnnotatedExecutableSchema;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _apolloLinkHttp = require('apollo-link-http');

var _graphqlTools = require('graphql-tools');

var _stitchAnnotationExtractor = require('./stitchAnnotationExtractor');

var _schemaAnnotationExtractor = require('./schemaAnnotationExtractor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function makeAnnotatedExecutableSchema(annotatedSchema) {
    var remoteSchemaAnnotations = (0, _schemaAnnotationExtractor.extractSchemaAnnotations)(annotatedSchema);
    var remoteSchemaPromises = remoteSchemaAnnotations.map(toRemoteSchemasPromises);

    return Promise.all(remoteSchemaPromises).then(function (remoteSchemas) {
        return (0, _graphqlTools.mergeSchemas)({
            schemas: remoteSchemas.concat(annotatedSchema),
            resolvers: function resolvers(mergeInfo) {
                return generateLinkTypeResolvers(annotatedSchema, mergeInfo);
            }
        });
    });

    function toRemoteSchemasPromises(_ref) {
        var uri = _ref.uri;

        var link = new _apolloLinkHttp.HttpLink({ uri: uri, fetch: _nodeFetch2.default });

        return (0, _graphqlTools.introspectSchema)(link).then(function (schema) {
            return (0, _graphqlTools.makeRemoteExecutableSchema)({ schema: schema, link: link });
        });
    }
}

function generateLinkTypeResolvers(annotatedSchema, mergeInfo) {
    return (0, _stitchAnnotationExtractor.extractStitchAnnotations)(annotatedSchema).map(function (stitchAnnotation) {
        return generateLinkTypeResolver(stitchAnnotation, mergeInfo);
    }).reduce(function (linkTypeResolversMap, linkTypeResolver) {
        return Object.assign({}, linkTypeResolversMap, linkTypeResolver);
    }, {});
}

function generateLinkTypeResolver(_ref2, mergeInfo) {
    var extendedType = _ref2.extendedType,
        extendedTypeKeyField = _ref2.extendedTypeKeyField,
        extensionField = _ref2.extensionField,
        resolverQueryField = _ref2.resolverQueryField,
        resolverQueryParameter = _ref2.resolverQueryParameter;

    return _defineProperty({}, extendedType, _defineProperty({}, extensionField, {
        fragment: 'fragment ' + extendedType + 'Fragment on ' + extendedType + ' { ' + extendedTypeKeyField + ' }',
        resolve: function resolve(parent, args, context, info) {
            var parentKeyValue = parent[extendedTypeKeyField];

            return mergeInfo.delegate('query', resolverQueryField, _defineProperty({}, resolverQueryParameter, parentKeyValue), context, info);
        }
    }));
}