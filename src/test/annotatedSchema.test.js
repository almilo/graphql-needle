import { graphql } from 'graphql';
import { makeAnnotatedExecutableSchema } from '..';

const authorSchemaUri = 'https://8xz15vx5q.lp.gql.zone/graphql'; // Apollo Launchpad https://launchpad.graphql.com/vpzl4vxr3
const chirpSchemaUri = 'https://vpzl4vxr3.lp.gql.zone/graphql'; // Apollo Launchpad https://launchpad.graphql.com/8xz15vx5q
const annotatedSchema = `
    extend type User @schema(uri: "${authorSchemaUri}") {
      chirps: [Chirp] @stitch(keyField: "id", queryField: "chirpsByAuthorId", queryParameter: "authorId")
    }
    extend type Chirp @schema(uri: "${chirpSchemaUri}") {
      author: User @stitch(keyField: "authorId", queryField: "userById", queryParameter: "id")
    }
`;

describe('annotated schema', () => {

    it('should return expected data for stitched user query', async () => {
        const schema = await makeAnnotatedExecutableSchema(annotatedSchema);
        const query = `
            query {
              userById(id: "fakeChirpId") {
                email
                chirps { 
                    text
                }
              }
            }
        `;
        const {data} = await graphql(schema, query);

        expect(data).toEqual({
            userById: {
                email: 'Hello World',
                chirps: [
                    {text: 'Hello World'},
                    {text: 'Hello World'}
                ]
            }
        });
    });

});
