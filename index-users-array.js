const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const { find, filter } = require("lodash");

// Some fake data
const companies = [
    { "id": "1", "name": "Apple", "description": "iphone" },
    { "id": "2", "name": "Google", "description": "search" }
  ];

const users = [
    { "id": "23", "firstName": "Bill", "age": 20, "companyId": "1" },
    { "id": "40", "firstName": "Alex", "age": 40, "companyId": "2" },
    { "id": "41", "firstName": "Nick", "age": 40, "companyId": "2" }
  ];


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
    users: () => users,
    companies: () => companies,
    company: (_, { id }) => find(companies, { id: id }),
    user: (_, { id }) => find(posts, { id: id })
  },
  Company: {
    users: company => filter(users, { companyId: company.id })
  },
  User: {
    company: user => find(companies, { id: user.companyId })
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
