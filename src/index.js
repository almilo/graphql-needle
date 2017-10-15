import { graphql } from 'graphql';
import { annotatedSchema } from './schema';

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

graphql(annotatedSchema, query).then(({data}) => console.log(JSON.stringify(data, undefined, 2)));
