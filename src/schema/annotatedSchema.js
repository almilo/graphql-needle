import { authorSchema, chirpSchema } from './partialSchemas';
import { autoStitchAnnotatedSchemas } from '../needle';

const linkTypeDefs = `
    extend type User {
      chirps: [Chirp] @stitch(keyField: "id", queryField: "chirpsByAuthorId", queryParameter: "authorId")
    }
    extend type Chirp {
      author: User @stitch(keyField: "authorId", queryField: "userById", queryParameter: "id")
    }
`;

export const annotatedSchema = autoStitchAnnotatedSchemas([chirpSchema, authorSchema], linkTypeDefs);
