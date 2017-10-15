import { parse, visit } from 'graphql';
import { asNamedArguments, ifNodeMatches } from '../utils';

export function extractRemoteSchemaInfos(annotatedSchema) {
    const remoteSchemas = [];
    const remoteSchemasExtractorVisitor = createRemoteSchemasExtractorVisitor(remoteSchemas);
    const annotatedSchemaAst = parse(annotatedSchema);

    visit(annotatedSchemaAst, remoteSchemasExtractorVisitor);

    return remoteSchemas;
}

function createRemoteSchemasExtractorVisitor(remoteSchemas) {
    const typeExtensionWithRemoteSchema = {
        definition: {
            directives: directives => directives.length === 1 && directives[0].name.value === 'schema'
        }
    };

    return {
        TypeExtensionDefinition: ifNodeMatches(typeExtensionWithRemoteSchema, extractRemoteSchema)
    };

    function extractRemoteSchema({definition: {directives}}) {
        const schemaDirective = directives[0];
        const {url} = asNamedArguments(schemaDirective.arguments);

        remoteSchemas.push({url});
    }
}
