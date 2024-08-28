import { getJobs, getJob, getJobsByCompany, createJob } from './db/jobs.js';
import { getCompany } from './db/companies.js';
import { GraphQLError } from 'graphql';


export const resolvers = {
  Query: {
    jobs: () => getJobs(),
    job: async (_root, {id}) => { 
      const job = await getJob(id)
      if (!job) {
        throw notFoundError(`No job found with id ${id}`)
      }
      return job
    },
    company: async (_root, {id}) => {
      const company = await getCompany(id)
      if (!company) {
        throw notFoundError(`No company found with id ${id}`);
      }

      return company
    }
  },

  Mutation: {
    createJob: (_root, { input: {title, description} }) => {
      const companyId = "FjcJCHJALA4i"
      return createJob({companyId, title, description})
    }
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id)
  },

  Job: {
    company: (job) => getCompany(job.companyId),
    date: (job) => toISODate(job.createdAt)
  },
};

const notFoundError = (message) => {
  return new GraphQLError(message, { extensions: { code: "NOT_FOUND" }})
        
}

const toISODate = (value) => {
  return value.slice(0, 'yyyy-mm-dd'.length)
}