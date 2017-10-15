import { graphql } from 'graphql';
import { schema } from './schema';

const query = `
    query {
      chirpById(id: "fakeChirpId") {
        text
      }
      userById(id: "fakeChirpId") {
        email
      }
    }
`;

it('should return expected data', async () => {
    const {data} = await graphql(schema, query);

    expect(data).toEqual({chirpById: {text: 'Hello World'}, userById: {email: 'Hello World'}});
});
