import Candidate from "../models/candidate.model.js";

export const createCandidate = (data) => {
  return Candidate.create(data);
};

export const findAllCandidates = () => {
  return Candidate.find().sort({ createdAt: -1 });
};

export const findCandidateById = (id) => {
  return Candidate.findById(id);
};

export const updateCandidate = (id, data) => {
  return Candidate.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCandidate = (id) => {
  return Candidate.findByIdAndDelete(id);
};