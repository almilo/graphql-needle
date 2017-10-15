import { mergeSchemas } from 'graphql-tools';
import { extractLinkTypeInfos } from './stitchAnnotationExtractor';

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
