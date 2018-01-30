const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const axios = require("axios");
const { find, filter } = require("lodash");

// The GraphQL schema in string form
const typeDefs = `
type Company {
    id: String!
    name: String
    description: String
    users: [User]
}

type User {
    id: String!
    firstName: String
    age: Int
    company: Company
}

type Query {
    users: [User]
    companies: [Company]
    company(id: String!): Company
    user(id: String!): User
}
`;

// The resolvers
const resolvers = {
  Query: {
    users: () =>
      axios
        .get("http://localhost:4000/users")
        .then(response => {
          console.log("resolve Query, users");
          return response.data;
        })
        .catch(err => err.data),
    companies: () =>
      axios
        .get("http://localhost:4000/companies")
        .then(response => {
          console.log("resolve Query, companies");
          return response.data;
        })
        .catch(err => err.data),
    company: (_, { id }) =>
      axios
        .get(`http://localhost:4000/companies/${id}`)
        .then(response => {
          console.log("resolve Query, company", id);
          return response.data;
        })
        .catch(err => err.data),
    user: (_, { id }) =>
      axios
        .get(`http://localhost:4000/users/${id}`)
        .then(response => {
          console.log("resolve Query, user", id);
          return response.data;
        })
        .catch(err => err.data)
  },
  Company: {
    users: company =>
      axios
        .get(`http://localhost:4000/users/?companyId=${company.id}`)
        .then(response => {
          console.log("resolve Company, users");
          return response.data;
        })
        .catch(err => err.data)
  },
  User: {
    company: user =>
      axios
        .get(`http://localhost:4000/companies?_embed=users`)
        .then(response => {
          console.log("resolve User, company");
          return find(response.data, item => ['user.id', user.id]);
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
