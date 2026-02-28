import * as candidateRepo from "../repositories/candidate.repository.js";

export const createCandidateService = async (data) => {
  return await candidateRepo.createCandidate(data);
};

export const getAllCandidatesService = async () => {
  return await candidateRepo.findAllCandidates();
};

export const getCandidateByIdService = async (id) => {
  return await candidateRepo.findCandidateById(id);
};

export const updateCandidateService = async (id, data) => {
  return await candidateRepo.updateCandidate(id, data);
};

export const deleteCandidateService = async (id) => {
  return await candidateRepo.deleteCandidate(id);
};