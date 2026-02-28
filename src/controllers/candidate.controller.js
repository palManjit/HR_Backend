import * as candidateService from "../services/candidate.service.js";
import ApiResponse from "../utils/apiResponse.js";

export const createCandidate = async (req, res) => {
  try {
    const candidate = await candidateService.createCandidateService(req.body);

    return res.status(201).json(
      new ApiResponse(201, "Candidate applied successfully", candidate)
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    );
  }
};

export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await candidateService.getAllCandidatesService();

    return res.status(200).json(
      new ApiResponse(200, "Candidates fetched successfully", candidates)
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    );
  }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await candidateService.getCandidateByIdService(req.params.id);

    if (!candidate) {
      return res.status(404).json(
        new ApiResponse(404, "Candidate not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, "Candidate fetched successfully", candidate)
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    );
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const candidate = await candidateService.updateCandidateService(
      req.params.id,
      req.body
    );

    return res.status(200).json(
      new ApiResponse(200, "Candidate updated successfully", candidate)
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    );
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    await candidateService.deleteCandidateService(req.params.id);

    return res.status(200).json(
      new ApiResponse(200, "Candidate deleted successfully")
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    );
  }
};