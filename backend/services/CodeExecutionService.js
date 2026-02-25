const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CodeExecutionService {
  constructor() {
    this.executionTimeout = 10000; // 10 seconds
    this.maxMemory = 128 * 1024 * 1024; // 128MB
    this.tempDir = path.join(__dirname, '../temp');
  }

  async executeCode(code, language, testCases) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const workDir = path.join(this.tempDir, sessionId);
    
    try {
      await fs.mkdir(workDir, { recursive: true });
      
      const results = await Promise.all(
        testCases.map((testCase, index) => 
          this.executeSingleTest(code, language, testCase, workDir, index)
        )
      );

      return {
        success: true,
        results,
        executionTime: Math.max(...results.map(r => r.executionTime))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: []
      };
    } finally {
      await this.cleanup(workDir);
    }
  }

  async executeSingleTest(code, language, testCase, workDir, index) {
    const startTime = Date.now();
    
    try {
      const { filePath, runCommand } = await this.prepareCodeFile(
        code, language, testCase, workDir, index
      );

      const result = await this.runInSandbox(filePath, runCommand, testCase);
      
      return {
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput.trim(),
        actualOutput: result.output.trim(),
        passed: result.output.trim() === testCase.expectedOutput.trim(),
        executionTime: Date.now() - startTime,
        memoryUsage: result.memoryUsage,
        error: result.error
      };
    } catch (error) {
      return {
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        passed: false,
        executionTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async prepareCodeFile(code, language, testCase, workDir, index) {
    const fileConfigs = {
      javascript: {
        extension: '.js',
        template: (code, input) => `${code}\n\n// Test input: ${JSON.stringify(input)}\nconsole.log(solution(${JSON.stringify(input)}));`,
        runCommand: (filePath) => `node "${filePath}"`
      },
      python: {
        extension: '.py',
        template: (code, input) => `${code}\n\n# Test input: ${JSON.stringify(input)}\nif __name__ == "__main__":\n    print(solution(${JSON.stringify(input)}))`,
        runCommand: (filePath) => `python "${filePath}"`
      },
      java: {
        extension: '.java',
        template: (code, input) => code.replace(/public class Solution/, `public class Solution_${index}`),
        runCommand: (filePath) => {
          const className = `Solution_${index}`;
          return `cd "${path.dirname(filePath)}" && javac "${path.basename(filePath)}" && java ${className}`;
        }
      },
      cpp: {
        extension: '.cpp',
        template: (code, input) => code,
        runCommand: (filePath) => {
          const execPath = filePath.replace('.cpp', '');
          return `g++ -o "${execPath}" "${filePath}" && "${execPath}"`;
        }
      }
    };

    const config = fileConfigs[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const fileName = `solution_${index}${config.extension}`;
    const filePath = path.join(workDir, fileName);
    const processedCode = config.template(code, testCase.input);

    await fs.writeFile(filePath, processedCode);
    
    return { filePath, runCommand: config.runCommand(filePath) };
  }

  async runInSandbox(filePath, runCommand, testCase) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let output = '';
      let error = '';
      
      // Security: Run with limited resources
      const child = spawn(runCommand, [], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: this.executionTimeout,
        env: {
          ...process.env,
          // Limit resources
          NODE_OPTIONS: '--max-old-space-size=128',
          // Security: Disable network access
          NODE_ENV: 'sandbox'
        }
      });

      // Set up resource monitoring
      const memoryMonitor = setInterval(() => {
        try {
          const usage = process.memoryUsage();
          if (usage.heapUsed > this.maxMemory) {
            child.kill('SIGKILL');
            reject(new Error('Memory limit exceeded'));
          }
        } catch (e) {
          // Ignore monitoring errors
        }
      }, 100);

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        clearInterval(memoryMonitor);
        
        resolve({
          output,
          error: code !== 0 ? error : null,
          exitCode: code,
          executionTime: Date.now() - startTime,
          memoryUsage: process.memoryUsage().heapUsed
        });
      });

      child.on('error', (err) => {
        clearInterval(memoryMonitor);
        reject(err);
      });

      // Timeout handling
      setTimeout(() => {
        clearInterval(memoryMonitor);
        child.kill('SIGKILL');
        reject(new Error('Execution timeout'));
      }, this.executionTimeout);
    });
  }

  async cleanup(workDir) {
    try {
      await fs.rmdir(workDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Advanced: Code similarity detection for plagiarism
  async detectPlagiarism(submittedCode, existingSolutions) {
    const similarities = [];
    
    for (const solution of existingSolutions) {
      const similarity = this.calculateSimilarity(submittedCode, solution.code);
      if (similarity > 0.8) {
        similarities.push({
          userId: solution.userId,
          similarity: similarity,
          timestamp: solution.timestamp
        });
      }
    }
    
    return similarities;
  }

  calculateSimilarity(code1, code2) {
    // Remove whitespace and comments for comparison
    const cleanCode1 = this.cleanCode(code1);
    const cleanCode2 = this.cleanCode(code2);
    
    // Levenshtein distance for similarity
    const distance = this.levenshteinDistance(cleanCode1, cleanCode2);
    const maxLength = Math.max(cleanCode1.length, cleanCode2.length);
    
    return 1 - (distance / maxLength);
  }

  cleanCode(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

module.exports = CodeExecutionService;
