import { addMockFunctionsToSchema, makeExecutableSchema, mergeSchemas, } from 'graphql-tools';

const chirpSchema = makeExecutableSchema({
    typeDefs: `
        type Chirp {
          id: ID!
          text: String
          authorId: ID!
        }
        type Query {
          chirpById(id: ID!): Chirp
          chirpsByAuthorId(authorId: ID!): [Chirp]
        }
    `
});

addMockFunctionsToSchema({schema: chirpSchema});

const authorSchema = makeExecutableSchema({
    typeDefs: `
        type User {
          id: ID!
          email: String
        }
        type Query {
          userById(id: ID!): User
        }
    `
});

addMockFunctionsToSchema({schema: authorSchema});

const linkTypeDefs = `
    extend type User {
      chirps: [Chirp]
    }
    extend type Chirp {
      author: User
    }
`;

const linkTypeResolvers = mergeInfo => ({
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

export const schema = mergeSchemas({
    schemas: [chirpSchema, authorSchema, linkTypeDefs],
    resolvers: linkTypeResolvers,
});
