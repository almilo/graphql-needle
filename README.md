# graphql-needle
Stitch your GraphQL schemas in a declarative way by using annotations (aka directives).

[See Apollo schema stitching documentation](http://dev.apollodata.com/tools/graphql-tools/schema-stitching.html)

## Example

Instead of generating a stitched schema like so:

```js
import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } from 'graphql-tools';

const authorLink = new HttpLink({ uri: 'https://8xz15vx5q.lp.gql.zone/graphql', fetch });
const authorSchema = await introspectSchema(authorLink);
const authorExecutableSchema = makeRemoteExecutableSchema({ schema: authorSchema, link: authorLink });

const chirpLink = new HttpLink({ uri: 'https://vpzl4vxr3.lp.gql.zone/graphql', fetch });
const chirpSchema = await introspectSchema(chirpLink);
const chirpExecutableSchema = makeRemoteExecutableSchema({ schema: chirpSchema, link: chirpLink });

const linkTypeDefs = `
  extend type User {
    chirps: [Chirp]
  }
  extend type Chirp {
    author: User
  }
`;

const executableSchema = mergeSchemas({
  schemas: [authorExecutableSchema, chirpExecutableSchema, linkTypeDefs],
  resolvers: mergeInfo => ({
    User: {
      chirps: {
        fragment: `fragment UserFragment on User { id }`,
        resolve(parent, args, context, info) {
          const authorId = parent.id;
          return mergeInfo.delegate(
            'query',
            'chirpsByAuthorId',
            {
              authorId,
            },
            context,
            info,
          );
        },
      },
    },
    Chirp: {
      author: {
        fragment: `fragment ChirpFragment on Chirp { authorId }`,
        resolve(parent, args, context, info) {
          const id = parent.authorId;
          return mergeInfo.delegate(
            'query',
            'userById',
            {
              id,
            },
            context,
            info,
          );
        },
      },
    },
  }),
});
```

You can do it like so:

```js
import { makeAnnotatedExecutableSchema } from 'graphql-needle';

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


const executableSchema = await makeAnnotatedExecutableSchema(annotatedSchema);
```

[See running example](https://github.com/almilo/graphql-needle/blob/master/src/test/annotatedSchema.test.js)
