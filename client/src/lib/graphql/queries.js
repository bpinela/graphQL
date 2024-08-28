import { gql, GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://localhost:9000/graphql')

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

  const { jobs } = await client.request(query);
  return jobs;
}

export async function getJob(id) {
  const query = gql`
    query JobById($id: ID!) {
      job(id: $id) {
        id
        title
        description
        date
        company {
          id
          name
        }
      }
    }
  `;

  const { job } = await client.request(query, { id });  
  return job;
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

  const { company } = await client.request(query, { id });
  return company;
}

export async function createJob({ title, description}) {
  const mutation = gql`
    mutation($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
      }
    }
  `

  const {job} = await client.request(mutation, {
    input: {title, description}
  })
  return job;
}
