import { parse, visit } from 'graphql';
import { asNamedArguments, ifNodeMatches } from '../utils/index';

export function extractSchemaAnnotations(annotatedSchema) {
    const schemaAnnotations = [];
    const remoteSchemasExtractorVisitor = createSchemaAnnotationVisitor(schemaAnnotations);
    const annotatedSchemaAst = parse(annotatedSchema);

    visit(annotatedSchemaAst, remoteSchemasExtractorVisitor);

    return schemaAnnotations;
}

function createSchemaAnnotationVisitor(schemaAnnotations) {
    const typeExtensionWithSchemaDirective = {
        definition: {
            directives: directives => directives.length === 1 && directives[0].name.value === 'schema'
        }
    };

    return {
        TypeExtensionDefinition: ifNodeMatches(typeExtensionWithSchemaDirective, extractSchemaAnnotation)
    };

    function extractSchemaAnnotation({definition: {directives}}) {
        const schemaDirective = directives[0];
        const {uri} = asNamedArguments(schemaDirective.arguments);

        schemaAnnotations.push({uri});
    }
}
