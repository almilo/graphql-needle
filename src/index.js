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

graphql(schema, query).then(({data}) => console.log(data));
