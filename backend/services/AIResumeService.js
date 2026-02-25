const natural = require('natural');
const fs = require('fs').promises;
const pdf = require('pdf-parse');

class AIResumeService {
  constructor() {
    this.skillKeywords = {
      'javascript': ['javascript', 'js', 'nodejs', 'react', 'vue', 'angular', 'express'],
      'python': ['python', 'django', 'flask', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
      'java': ['java', 'spring', 'hibernate', 'maven', 'junit', 'jvm'],
      'cpp': ['c++', 'cpp', 'stl', 'boost', 'gcc', 'visual studio'],
      'databases': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'],
      'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
      'mobile': ['ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
      'devops': ['ci/cd', 'jenkins', 'gitlab', 'github actions', 'ansible', 'puppet'],
      'testing': ['jest', 'mocha', 'selenium', 'cypress', 'unit testing', 'integration testing']
    };

    this.industryKeywords = {
      'fintech': ['banking', 'finance', 'payments', 'trading', 'blockchain', 'cryptocurrency'],
      'healthcare': ['medical', 'healthcare', 'pharmaceutical', 'biotech', 'hipaa'],
      'ecommerce': ['e-commerce', 'retail', 'shopify', 'magento', 'payment processing'],
      'education': ['edtech', 'education', 'learning management', 'online learning'],
      'gaming': ['gaming', 'unity', 'unreal engine', 'game development', 'graphics']
    };

    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
  }

  async analyzeResume(fileBuffer, jobDescription = '') {
    try {
      const resumeText = await this.extractTextFromFile(fileBuffer);
      const analysis = {
        personalInfo: this.extractPersonalInfo(resumeText),
        skills: this.extractSkills(resumeText),
        experience: this.analyzeExperience(resumeText),
        education: this.analyzeEducation(resumeText),
        projects: this.extractProjects(resumeText),
        formatting: this.analyzeFormatting(resumeText),
        atsScore: this.calculateATSScore(resumeText),
        jobMatch: jobDescription ? this.calculateJobMatch(resumeText, jobDescription) : null,
        recommendations: []
      };

      analysis.recommendations = this.generateRecommendations(analysis);
      analysis.overallScore = this.calculateOverallScore(analysis);

      return analysis;
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  async extractTextFromFile(fileBuffer) {
    // Detect file type and extract text
    const fileType = this.detectFileType(fileBuffer);
    
    switch (fileType) {
      case 'pdf':
        const pdfData = await pdf(fileBuffer);
        return pdfData.text;
      case 'docx':
        // Would use mammoth library for .docx files
        throw new Error('DOCX files not yet supported');
      default:
        return fileBuffer.toString();
    }
  }

  detectFileType(buffer) {
    const signature = buffer.toString('hex', 0, 4);
    if (signature === '255044462d') return 'pdf';
    if (signature.startsWith('504b0304')) return 'docx';
    return 'text';
  }

  extractPersonalInfo(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/g;
    const githubRegex = /github\.com\/[\w-]+/g;

    return {
      email: text.match(emailRegex) || [],
      phone: text.match(phoneRegex) || [],
      linkedin: text.match(linkedinRegex) || [],
      github: text.match(githubRegex) || []
    };
  }

  extractSkills(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const foundSkills = {};

    Object.entries(this.skillKeywords).forEach(([category, keywords]) => {
      const categorySkills = [];
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (regex.test(text)) {
          categorySkills.push(keyword);
        }
      });
      if (categorySkills.length > 0) {
        foundSkills[category] = categorySkills;
      }
    });

    return foundSkills;
  }

  analyzeExperience(text) {
    const experiencePatterns = [
      /\b(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)\b/gi,
      /\b(\d{1,2})\s*-\s*(\d{1,2})\s*years?\b/gi
    ];

    let totalExperience = 0;
    const experiences = [];

    experiencePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const years = parseInt(match[1]);
        totalExperience = Math.max(totalExperience, years);
        experiences.push({
          years: years,
          context: text.substring(Math.max(0, match.index - 50), match.index + 50)
        });
      }
    });

    // Extract company names and roles
    const companies = this.extractCompanies(text);
    const roles = this.extractRoles(text);

    return {
      totalYears: totalExperience,
      experiences,
      companies,
      roles,
      seniority: this.determineSeniority(text, totalExperience)
    };
  }

  extractCompanies(text) {
    const companyIndicators = ['Inc', 'LLC', 'Ltd', 'Corp', 'Corporation', 'Technologies', 'Systems'];
    const lines = text.split('\n');
    const companies = [];

    lines.forEach(line => {
      companyIndicators.forEach(indicator => {
        const regex = new RegExp(`\\b([A-Z][a-zA-Z\\s&]+\\s*${indicator})\\b`, 'g');
        const matches = line.match(regex);
        if (matches) {
          companies.push(...matches);
        }
      });
    });

    return [...new Set(companies)]; // Remove duplicates
  }

  extractRoles(text) {
    const roleKeywords = [
      'software engineer', 'senior software engineer', 'lead developer', 'tech lead',
      'full stack developer', 'frontend developer', 'backend developer',
      'devops engineer', 'site reliability engineer', 'product manager',
      'data scientist', 'machine learning engineer', 'ai engineer'
    ];

    const foundRoles = [];
    roleKeywords.forEach(role => {
      const regex = new RegExp(`\\b${role}\\b`, 'gi');
      if (regex.test(text)) {
        foundRoles.push(role);
      }
    });

    return foundRoles;
  }

  determineSeniority(text, yearsOfExperience) {
    const seniorityKeywords = {
      'junior': ['junior', 'entry level', 'associate', 'fresher'],
      'mid': ['mid-level', 'software engineer', 'developer'],
      'senior': ['senior', 'lead', 'principal', 'staff'],
      'executive': ['manager', 'director', 'vp', 'cto', 'head of']
    };

    let seniority = 'junior';
    if (yearsOfExperience >= 8) seniority = 'senior';
    if (yearsOfExperience >= 12) seniority = 'executive';

    // Check for explicit seniority mentions
    Object.entries(seniorityKeywords).forEach(([level, keywords]) => {
      keywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) {
          seniority = level;
        }
      });
    });

    return seniority;
  }

  analyzeEducation(text) {
    const educationPatterns = [
      /\b(bachelor|master|phd|bs|ms|ba|ma)\b/gi,
      /\b(computer science|software engineering|information technology|data science)\b/gi,
      /\b(university|college|institute)\b/gi
    ];

    const degrees = [];
    const fields = [];
    const institutions = [];

    educationPatterns.forEach((pattern, index) => {
      const matches = text.match(pattern);
      if (matches) {
        if (index === 0) degrees.push(...matches);
        if (index === 1) fields.push(...matches);
        if (index === 2) institutions.push(...matches);
      }
    });

    return {
      degrees: [...new Set(degrees)],
      fields: [...new Set(fields)],
      institutions: [...new Set(institutions)],
      highestDegree: this.determineHighestDegree(degrees)
    };
  }

  determineHighestDegree(degrees) {
    const degreeHierarchy = {
      'phd': 4, 'doctorate': 4,
      'master': 3, 'ms': 3, 'ma': 3,
      'bachelor': 2, 'bs': 2, 'ba': 2,
      'associate': 1
    };

    let highestLevel = 0;
    let highestDegree = '';

    degrees.forEach(degree => {
      const normalizedDegree = degree.toLowerCase();
      Object.entries(degreeHierarchy).forEach(([degreeName, level]) => {
        if (normalizedDegree.includes(degreeName) && level > highestLevel) {
          highestLevel = level;
          highestDegree = degree;
        }
      });
    });

    return highestDegree;
  }

  extractProjects(text) {
    const projectPatterns = [
      /project[:\s]*([^\n]+)/gi,
      /developed[:\s]*([^\n]+)/gi,
      /built[:\s]*([^\n]+)/gi,
      /created[:\s]*([^\n]+)/gi
    ];

    const projects = [];
    projectPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        projects.push({
          description: match[1].trim(),
          context: text.substring(Math.max(0, match.index - 30), match.index + 100)
        });
      }
    });

    return projects;
  }

  analyzeFormatting(text) {
    const lines = text.split('\n');
    const wordCount = text.split(/\s+/).length;
    const avgWordsPerLine = wordCount / lines.length;

    return {
      totalWords: wordCount,
      totalLines: lines.length,
      avgWordsPerLine: Math.round(avgWordsPerLine),
      hasBulletPoints: /•|·|-*\s/.test(text),
      hasProperSections: /experience|education|skills|projects/i.test(text),
      readabilityScore: this.calculateReadability(text),
      formattingIssues: this.detectFormattingIssues(text)
    };
  }

  calculateReadability(text) {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);

    // Flesch Reading Ease Score
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;

    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length <= 3) {
        syllableCount += 1;
      } else {
        const vowelGroups = word.match(/[aeiouy]+/g);
        syllableCount += vowelGroups ? vowelGroups.length : 1;
      }
    });

    return syllableCount;
  }

  detectFormattingIssues(text) {
    const issues = [];
    
    if (text.length > 2000) issues.push('Resume too long (should be under 2 pages)');
    if (text.length < 300) issues.push('Resume too short (should be at least 1 page)');
    if (!/[A-Z]/.test(text)) issues.push('Missing capital letters');
    if (!/\d{4}/.test(text)) issues.push('No years/dates found');
    if (!/@/.test(text)) issues.push('No email address found');
    
    return issues;
  }

  calculateATSScore(text) {
    let score = 0;
    const maxScore = 100;

    // Contact information (20 points)
    if (/@/.test(text)) score += 5; // Email
    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) score += 5; // Phone
    if (/linkedin/.test(text)) score += 5; // LinkedIn
    if (/github/.test(text)) score += 5; // GitHub

    // Sections (30 points)
    if (/experience/i.test(text)) score += 10;
    if (/education/i.test(text)) score += 10;
    if (/skills/i.test(text)) score += 10;

    // Content quality (25 points)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 600) score += 15;
    if (wordCount >= 600 && wordCount <= 900) score += 20;
    if (wordCount >= 900) score += 25;

    // Keywords (25 points)
    const skillCount = Object.values(this.skillKeywords).flat().filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'gi').test(text)
    ).length;
    score += Math.min(25, skillCount * 2);

    return Math.min(maxScore, score);
  }

  calculateJobMatch(resumeText, jobDescription) {
    const resumeTokens = this.tokenizer.tokenize(resumeText.toLowerCase());
    const jobTokens = this.tokenizer.tokenize(jobDescription.toLowerCase());

    // Calculate Jaccard similarity
    const resumeSet = new Set(resumeTokens);
    const jobSet = new Set(jobTokens);
    
    const intersection = new Set([...resumeSet].filter(x => jobSet.has(x)));
    const union = new Set([...resumeSet, ...jobTokens]);
    
    const similarity = intersection.size / union.size;

    // Extract required skills from job description
    const requiredSkills = this.extractSkills(jobDescription);
    const candidateSkills = this.extractSkills(resumeText);
    
    const skillMatchScore = this.calculateSkillMatch(requiredSkills, candidateSkills);

    return {
      overallMatch: Math.round(similarity * 100),
      skillMatch: skillMatchScore,
      missingSkills: this.findMissingSkills(requiredSkills, candidateSkills),
      recommendations: this.generateJobMatchRecommendations(similarity, skillMatchScore)
    };
  }

  calculateSkillMatch(requiredSkills, candidateSkills) {
    let totalRequired = 0;
    let matched = 0;

    Object.entries(requiredSkills).forEach(([category, skills]) => {
      totalRequired += skills.length;
      const candidateSkillsInCategory = candidateSkills[category] || [];
      skills.forEach(skill => {
        if (candidateSkillsInCategory.some(candidateSkill => 
          candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(candidateSkill.toLowerCase())
        )) {
          matched++;
        }
      });
    });

    return totalRequired > 0 ? Math.round((matched / totalRequired) * 100) : 0;
  }

  findMissingSkills(requiredSkills, candidateSkills) {
    const missing = {};
    
    Object.entries(requiredSkills).forEach(([category, skills]) => {
      const candidateSkillsInCategory = candidateSkills[category] || [];
      const missingInCategory = skills.filter(skill => 
        !candidateSkillsInCategory.some(candidateSkill => 
          candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(candidateSkill.toLowerCase())
        )
      );
      
      if (missingInCategory.length > 0) {
        missing[category] = missingInCategory;
      }
    });

    return missing;
  }

  generateJobMatchRecommendations(overallMatch, skillMatch) {
    const recommendations = [];
    
    if (overallMatch < 50) {
      recommendations.push('Consider adding more keywords from the job description to your resume');
    }
    
    if (skillMatch < 60) {
      recommendations.push('Focus on highlighting skills that match the job requirements');
    }
    
    if (overallMatch > 80 && skillMatch > 80) {
      recommendations.push('Excellent match! Consider preparing for technical interviews');
    }

    return recommendations;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Skills recommendations
    const skillCount = Object.values(analysis.skills).flat().length;
    if (skillCount < 5) {
      recommendations.push('Add more technical skills to your resume');
    }

    // Experience recommendations
    if (analysis.experience.totalYears < 2) {
      recommendations.push('Consider adding more project details to compensate for limited experience');
    }

    // Formatting recommendations
    if (analysis.formatting.atsScore < 70) {
      recommendations.push('Improve ATS optimization by adding standard sections and keywords');
    }

    if (analysis.formatting.formattingIssues.length > 0) {
      recommendations.push('Fix formatting issues: ' + analysis.formatting.formattingIssues.join(', '));
    }

    // Education recommendations
    if (analysis.education.degrees.length === 0) {
      recommendations.push('Add your education details');
    }

    return recommendations;
  }

  calculateOverallScore(analysis) {
    const weights = {
      skills: 25,
      experience: 30,
      education: 15,
      formatting: 15,
      atsScore: 15
    };

    const scores = {
      skills: Math.min(100, Object.values(analysis.skills).flat().length * 5),
      experience: Math.min(100, analysis.experience.totalYears * 10),
      education: Math.min(100, analysis.education.degrees.length * 25),
      formatting: analysis.formatting.readabilityScore,
      atsScore: analysis.atsScore
    };

    let totalScore = 0;
    Object.entries(weights).forEach(([category, weight]) => {
      totalScore += (scores[category] * weight) / 100;
    });

    return Math.round(totalScore);
  }
}

module.exports = AIResumeService;
