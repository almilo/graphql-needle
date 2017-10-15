import { mergeSchemas } from 'graphql-tools';
import { extractLinkTypeInfos } from './stitchAnnotationExtractor';
import { extractRemoteSchemaInfos } from './schemaAnnotationExtractor';
import { authorSchema, chirpSchema } from '../schema/partialSchemas';

export function makeExecutableStitchedSchema(annotatedSchema) {
    const remoteSchemaInfos = extractRemoteSchemaInfos(annotatedSchema);

    // mock the remote schemas which should be implemented with apollo link otherwise
    const remoteSchemaMocks = {
        'http://graphql.org/users': authorSchema,
        'http://graphql.org/chirps': chirpSchema
    };
    const remoteSchemas = remoteSchemaInfos.reduce(toRemoteSchemas, []);

    return autoStitchAnnotatedSchemas(remoteSchemas, annotatedSchema);

    function toRemoteSchemas(remoteSchemas, {url}) {
        remoteSchemas.push(remoteSchemaMocks[url]);

        return remoteSchemas;
    }
}

export function autoStitchAnnotatedSchemas(schemas, annotatedLinkTypeDefs) {
    return mergeSchemas({
        schemas: schemas.concat(annotatedLinkTypeDefs),
        resolvers: mergeInfo => generateLinkTypeResolvers(annotatedLinkTypeDefs, mergeInfo)
    });
}

function generateLinkTypeResolvers(annotatedLinkTypeDefs, mergeInfo) {
    return extractLinkTypeInfos(annotatedLinkTypeDefs)
        .map(linkTypeInfo => generateLinkTypeResolver(linkTypeInfo, mergeInfo))
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
