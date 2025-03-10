// src/lib/types/candidate.ts

export interface InterviewRating {
    date: string;
    interviewer: string;
    overallRating: number;
    categories: {
      technicalSkills: number;
      communication: number;
      teamwork: number;
      problemSolving: number;
      culturalFit: number;
    };
    notes: string;
    nextSteps?: string;
  }
  
  export interface Candidate {
    id: string;
    basicInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      mobile?: string;
      dateOfBirth?: string;
      position: string;
      appliedPosition: string;
      location: string;
      availability: string;
      source: string;
      status: string;
    };
    address: {
      street: string;
      houseNumber: string;
      postalCode: string;
      city: string;
      country: string;
    };
    qualifications: {
      skills: string[];
      experience: number;
      education: string;
      certificates: string[];
      languages: { language: string; level: string }[];
      salaryExpectation?: number;
      noticePeriod: string;
      willingness: {
        travel: boolean;
        relocation: boolean;
        remoteWork: boolean;
      };
    };
    documents: {
      cv: File | null;
      coverLetter: File | null;
      certificates: File[];
      other: File[];
    };
    evaluation: {
      interviews: InterviewRating[];
      notes: string;
      rating: number;
      skillAssessment: { skill: string; rating: number }[];
    };
  }
  