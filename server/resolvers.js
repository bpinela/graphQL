import { getJobs, getJob, getJobsByCompany, createJob, deleteJob, updateJob, countJobs } from './db/jobs.js';
import { getCompany } from './db/companies.js';
import { GraphQLError } from 'graphql';
import { companyLoader } from './db/companies.js';  

export const resolvers = {
  Query: {
    jobs: async (_root, { limit, offset }) => { 
      const items = await getJobs(limit, offset)
      const totalCount = await countJobs()      
      return { items, totalCount } 
    },
    job: async (_root, {id}) => { 
      const job = await getJob(id)
      if (!job) {
        throw notFoundError(`No job found with id ${id}`)
      }
      return job
    },
    company: async (_root, {id}) => {
      const company = await companyLoader.load(id)
      if (!company) {
        throw notFoundError(`No company found with id ${id}`);
      }
      return company
    }
  },

  Mutation: {
    createJob: (_root, { input: {title, description} }, {user}) => {
      if (!user) {
        throw unathorizedError('Missing Authentication')
      }
      return createJob({companyId: user.companyId, title, description})
    },
    deleteJob: async (_root, {id}, { user }) => {
      if (!user) {
        throw unathorizedError('Missing Authentication')
      }
      const job = await deleteJob(id, user.companyId)
      if (!job) {
        throw notFoundError(`No job found with id ${id}`);
      }
      return job;
    },
    updateJob: async (_root, {input: {id, title, description}}, {user}) => {
      if (!user) {
        throw unathorizedError('Missing Authentication')
      }

      const job = await updateJob({id, title, description, companyId: user.companyId});
      if (!job) {
        throw notFoundError(`No job found with id ${id}`);
      }
      return job;
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

const unathorizedError = (message) => {
  return new GraphQLError(message, { extensions: { code: "UNANTHORIZED" }})  
}

const toISODate = (value) => {
  return value.slice(0, 'yyyy-mm-dd'.length)
}