import { addMockFunctionsToSchema, makeExecutableSchema, } from 'graphql-tools';

export const chirpSchema = makeExecutableSchema({
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

export const authorSchema = makeExecutableSchema({
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
