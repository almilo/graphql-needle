import { graphql } from 'graphql';
import { schema } from './schema';

const query = `
    query {
      chirpById(id: "fakeChirpId") {
        text
        author {
            email
            chirps {
                text
            }
        }
      }
    }
`;

graphql(schema, query).then(({data}) => console.log(JSON.stringify(data, undefined, 2)));
