import { getAccessToken } from '../auth';
import { ApolloClient, ApolloLink, concat, createHttpLink, gql, InMemoryCache} from '@apollo/client';

// const client = new GraphQLClient('http://localhost:9000/graphql', {
//   headers: () => {
//     const accessToken = getAccessToken();
//     if (accessToken) {
//       return { 'Authorization': `Bearer ${accessToken}`}
//     }

//     return {}
//   }
// })

const httpLink = createHttpLink({ uri: 'http://localhost:9000/graphql'});

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
    if (accessToken) {
      operation.setContext({
        headers: { 'Authorization': `Bearer ${accessToken}`}
      })
    }
    
    return forward(operation)  
})

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "cache-first" //first goes to cache if no data requests to server
    }
  }
})

const jobDetailFragment = gql`
  fragment JobDetail on Job {
      id
      title
      description
      date
      company {
        id
        name
      }
  }
`

export const jobsQuery = gql`
query {
  jobs {
    id
    title
    date
    company {
      id
      name
    }
  }
}
`;

export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export const companyByIdQuery = gql`
  query CompanyById($id: ID!) {
    company(id: $id) {
      description
      id
      name
      jobs {
        id
        date
        title 
      }
    }
  }
`;

export const createJobMutation = gql`
    mutation($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${jobDetailFragment}
  `;

