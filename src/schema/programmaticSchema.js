import { mergeSchemas, } from 'graphql-tools';
import { authorSchema, chirpSchema } from './partialSchemas';

const linkTypeDefs = `
    extend type User {
      chirps: [Chirp]
    }
    extend type Chirp {
      author: User
    }
`;

const linkTypeResolversFn = mergeInfo => ({
    User: {
        chirps: {
            fragment: `fragment UserFragment on User { id }`,
            resolve(parent, args, context, info) {
                const authorId = parent.id;
                return mergeInfo.delegate(
                    'query',
                    'chirpsByAuthorId',
                    {
                        authorId,
                    },
                    context,
                    info,
                );
            },
        },
    },
    Chirp: {
        author: {
            fragment: `fragment ChirpFragment on Chirp { authorId }`,
            resolve(parent, args, context, info) {
                const id = parent.authorId;
                return mergeInfo.delegate(
                    'query',
                    'userById',
                    {
                        id,
                    },
                    context,
                    info,
                );
            },
        },
    },
});

export const programmaticSchema = mergeSchemas({
    schemas: [chirpSchema, authorSchema, linkTypeDefs],
    resolvers: linkTypeResolversFn,
});
