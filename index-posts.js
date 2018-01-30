const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const axios = require("axios");
const { find, filter } = require("lodash");

// The GraphQL schema in string form
const typeDefs = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  type Query {
    posts: [Post]
    authors: [Author]
    author(id: Int!): Author
    post(id: Int!): Post
  }
`;

// The resolvers
const resolvers = {
  Query: {
    posts: () =>
      axios
        .get("http://localhost:4000/posts")
        .then(response => {
          console.log("resolve Query, posts");
          return response.data;
        })
        .catch(err => err.data),
    authors: () =>
      axios
        .get("http://localhost:4000/authors")
        .then(response => {
          console.log("resolve Query, authors");
          return response.data;
        })
        .catch(err => err.data),
    author: (_, { id }) =>
      axios
        .get(`http://localhost:4000/authors/${id}`)
        .then(response => {
          console.log("resolve Query, author");
          return response.data;
        })
        .catch(err => err.data),
    post: (_, { id }) =>
      axios
        .get(`http://localhost:4000/posts/${id}`)
        .then(response => {
          console.log("resolve Query, post");
          return response.data;
        })
        .catch(err => err.data)
  },
  Author: {
    posts: author =>
      axios
        .get(`http://localhost:4000/posts?authorId=${author.id}`)
        .then(response => {
          console.log("resolve Author, posts");
          return response.data;
        })
        .catch(err => err.data)
  },
  Post: {
    author: post =>
      axios
        .get(`http://localhost:4000/authors?_embed=posts`)
        .then(response => {
          console.log("resolve Post, author");
          const authors = response.data;
          return find(authors, { id: post.authorId });
        })
        .catch(err => err.data)
  }
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use(
    "/graphql",
    bodyParser.json(),
    graphqlExpress({ 
        schema 
    })
);

// GraphiQL, a visual editor for queries
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

// Start the server
app.listen(3000, () => {
  console.log("Go to http://localhost:3000/graphiql to run queries!");
});
