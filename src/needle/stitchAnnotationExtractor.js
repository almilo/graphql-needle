import { parse, visit } from 'graphql';
import { asNamedArguments, doesNodeMatchShape, ifNodeMatches } from '../utils';

export function extractLinkTypeInfos(annotatedLinkTypeDefs) {
    const linkTypeInfos = [];
    const linkTypeInfoExtractorVisitor = createLinkTypeInfoExtractorVisitor(linkTypeInfos);
    const annotatedLinkTypeDefsAst = parse(annotatedLinkTypeDefs);

    visit(annotatedLinkTypeDefsAst, linkTypeInfoExtractorVisitor);

    return linkTypeInfos;
}

function createLinkTypeInfoExtractorVisitor(linkTypeInfos) {
    const typeExtensionWithStitchField = {
        definition: {
            kind: 'ObjectTypeDefinition',
            name: {
                kind: 'Name'
            },
            fields: hasStitchAnnotatedField
        }
    };

    return {
        TypeExtensionDefinition: ifNodeMatches(typeExtensionWithStitchField, extractLinkTypeInfo)
    };

    function hasStitchAnnotatedField(fields) {
        return fields.length === 1 &&
            doesNodeMatchShape(
                fields[0],
                {
                    name: {kind: 'Name'},
                    directives: directives => directives.length === 1 && directives[0].name.value === 'stitch'
                }
            );
    }

    function extractLinkTypeInfo({definition}) {
        const stitchField = definition.fields[0];
        const stitchDirective = stitchField.directives[0];
        const extendedType = definition.name.value;
        const extensionField = stitchField.name.value;
        const {
            keyField: extendedTypeKeyField,
            queryField: resolverQueryField,
            queryParameter: resolverQueryParameter
        } = asNamedArguments(stitchDirective.arguments);

        linkTypeInfos.push({
            extendedType,
            extendedTypeKeyField,
            extensionField,
            resolverQueryField,
            resolverQueryParameter
        });
    }
}
