import { getJobs, getJob, getJobsByCompany } from './db/jobs.js';
import { getCompany } from './db/companies.js';


export const resolvers = {
  Query: {
    jobs: () => getJobs(),
    job: (_root, {id}) => getJob(id),
    company: (_root, {id}) => getCompany(id)
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id)
  },

  Job: {
    company: (job) => getCompany(job.companyId),
    date: (job) => toISODate(job.createdAt)
  },
};

const toISODate = (value) => {
  return value.slice(0, 'yyyy-mm-dd'.length)
}