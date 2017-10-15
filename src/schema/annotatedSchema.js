import { makeExecutableStitchedSchema } from '../needle';

const linkTypeDefs = `
    extend type User @schema(url: "http://graphql.org/users") {
      chirps: [Chirp] @stitch(keyField: "id", queryField: "chirpsByAuthorId", queryParameter: "authorId")
    }
    extend type Chirp @schema(url: "http://graphql.org/chirps") {
      author: User @stitch(keyField: "authorId", queryField: "userById", queryParameter: "id")
    }
`;

export const annotatedSchema = makeExecutableStitchedSchema(linkTypeDefs);
