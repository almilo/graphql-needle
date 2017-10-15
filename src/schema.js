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

export const schema = mergeSchemas({schemas: [chirpSchema, authorSchema]});
