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

const apolloClient = new ApolloClient({
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

const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export async function getJobs() {
  const query = gql`
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

  const { data } = await apolloClient.query({
    query, 
    fetchPolicy: 'network-only' //Dont use cache, always do a new request to server
  });
  
  return data.jobs;
}

export async function getJob(id) {
  const { data } = await apolloClient.query({query: jobByIdQuery, variables: { id }});
  return data.job;
}

export async function getCompany(id) {
  const query = gql`
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

  const { data } = await apolloClient.query({query, variables: { id }});
  return data.company;
}

export async function createJob({ title, description}) {
  const mutation = gql`
    mutation($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${jobDetailFragment}
  `;

  const { data } = await apolloClient.mutate({
    mutation,
    variables: { input: { title, description }},
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdQuery,
        variables: { id: data.job.id },
        data,
      })
    }
  })
  return data.job;
}
