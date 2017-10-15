import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } from 'graphql-tools';
import { extractStitchAnnotations } from './stitchAnnotationExtractor';
import { extractSchemaAnnotations } from './schemaAnnotationExtractor';

export default async function makeAnnotatedExecutableSchema(annotatedSchema) {
    const remoteSchemaAnnotations = extractSchemaAnnotations(annotatedSchema);
    const remoteSchemaPromises = remoteSchemaAnnotations.map(toRemoteSchemas);
    const remoteSchemas = await Promise.all(remoteSchemaPromises);

    return mergeSchemas({
        schemas: remoteSchemas.concat(annotatedSchema),
        resolvers: mergeInfo => generateLinkTypeResolvers(annotatedSchema, mergeInfo)
    });

    function toRemoteSchemas({uri}) {
        const link = new HttpLink({uri, fetch});

        return introspectSchema(link).then(schema => makeRemoteExecutableSchema({schema, link}));
    }
}

function generateLinkTypeResolvers(annotatedSchema, mergeInfo) {
    return extractStitchAnnotations(annotatedSchema)
        .map(stitchAnnotation => generateLinkTypeResolver(stitchAnnotation, mergeInfo))
        .reduce((linkTypeResolversMap, linkTypeResolver) => (Object.assign({}, linkTypeResolversMap, linkTypeResolver)), {});
}

function generateLinkTypeResolver({extendedType, extendedTypeKeyField, extensionField, resolverQueryField, resolverQueryParameter}, mergeInfo) {
    return {
        [extendedType]: {
            [extensionField]: {
                fragment: `fragment ${extendedType}Fragment on ${extendedType} { ${extendedTypeKeyField} }`,
                resolve(parent, args, context, info) {
                    const parentKeyValue = parent[extendedTypeKeyField];

                    return mergeInfo.delegate(
                        'query',
                        resolverQueryField,
                        {
                            [resolverQueryParameter]: parentKeyValue,
                        },
                        context,
                        info,
                    );
                },
            },
        }
    };
}
