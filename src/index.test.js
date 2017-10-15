import { graphql } from 'graphql';
import { annotatedSchema, programmaticSchema } from './schema';

[
    ["programmatic schema", programmaticSchema],
    ["annotated schema", annotatedSchema]
].forEach(([schemaName, schema]) => {

    describe(schemaName, () => {

        it('should return expected data for basic query', async () => {
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
            const {data} = await graphql(schema, query);

            expect(data).toEqual({chirpById: {text: 'Hello World'}, userById: {email: 'Hello World'}});
        });

        it('should return expected data for stitched chirp query', async () => {
            const query = `
                query {
                  chirpById(id: "fakeChirpId") {
                    text
                    author { 
                        email
                    }
                  }
                }
            `;
            const {data} = await graphql(schema, query);

            expect(data).toEqual({
                chirpById: {
                    text: 'Hello World',
                    author: {
                        email: 'Hello World'
                    }
                }
            });
        });

        it('should return expected data for stitched user query', async () => {
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

});
