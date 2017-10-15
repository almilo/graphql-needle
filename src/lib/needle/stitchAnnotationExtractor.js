import { parse, visit } from 'graphql';
import { asNamedArguments, doesNodeMatchShape, ifNodeMatches } from '../utils/index';

export function extractStitchAnnotations(annotatedSchema) {
    const stitchAnnotations = [];
    const stitchAnnotationVisitor = createStitchAnnotationVisitor(stitchAnnotations);
    const annotatedSchemaAst = parse(annotatedSchema);

    visit(annotatedSchemaAst, stitchAnnotationVisitor);

    return stitchAnnotations;
}

function createStitchAnnotationVisitor(stitchAnnotations) {
    const typeExtensionWithStitchFieldDirective = {
        definition: {
            kind: 'ObjectTypeDefinition',
            name: {
                kind: 'Name'
            },
            fields: hasStitchAnnotatedField
        }
    };

    return {
        TypeExtensionDefinition: ifNodeMatches(typeExtensionWithStitchFieldDirective, extractStitchAnnotation)
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

    function extractStitchAnnotation({definition}) {
        const stitchField = definition.fields[0];
        const stitchDirective = stitchField.directives[0];
        const extendedType = definition.name.value;
        const extensionField = stitchField.name.value;
        const {
            keyField: extendedTypeKeyField,
            queryField: resolverQueryField,
            queryParameter: resolverQueryParameter
        } = asNamedArguments(stitchDirective.arguments);

        stitchAnnotations.push({
            extendedType,
            extendedTypeKeyField,
            extensionField,
            resolverQueryField,
            resolverQueryParameter
        });
    }
}
