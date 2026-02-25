const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');
require('dotenv').config();

const sampleQuestions = [
  // Array Questions
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "easy",
    category: "array",
    tags: ["array", "hash-table"],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    testCases: [
      {
        input: "[2,7,11,15],9",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "[3,2,4],6",
        expectedOutput: "[1,2]",
        isHidden: false
      },
      {
        input: "[3,3],6",
        expectedOutput: "[0,1]",
        isHidden: true
      }
    ],
    solution: {
      approach: "Use a hash map to store complement values and check if current number exists as complement.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      code: {
        javascript: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
        python: `def twoSum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            
            map.put(nums[i], i);
        }
        
        return new int[]{};
    }
}`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            
            map[nums[i]] = i;
        }
        
        return {};
    }
};`
      }
    },
    hints: [
      "Think about using a data structure that allows O(1) lookups.",
      "What if you store each number's complement as you iterate?",
      "Consider using a hash map or dictionary."
    ],
    points: 10,
    timeLimit: 30
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.",
    difficulty: "easy",
    category: "array",
    tags: ["array", "dynamic-programming"],
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 1 (price = 1) and sell on day 4 (price = 6), profit = 6-1 = 5."
      }
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^5"
    ],
    testCases: [
      {
        input: "[7,1,5,3,6,4]",
        expectedOutput: "5",
        isHidden: false
      },
      {
        input: "[7,6,4,3,1]",
        expectedOutput: "0",
        isHidden: false
      }
    ],
    solution: {
      approach: "Track the minimum price seen so far and calculate profit at each step.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      code: {
        javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  
  for (let price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  
  return maxProfit;
}`,
        python: `def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    
    return max_profit`
      }
    },
    hints: [
      "You need to find the minimum price before each day.",
      "Consider tracking two variables: min price and max profit.",
      "This can be solved in a single pass."
    ],
    points: 10,
    timeLimit: 25
  },
  // String Questions
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "easy",
    category: "string",
    tags: ["string", "stack"],
    examples: [
      {
        input: "s = \"()\"",
        output: "true",
        explanation: "The parentheses are properly closed."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'"
    ],
    testCases: [
      {
        input: "()",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "()[]{}",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "(]",
        expectedOutput: "false",
        isHidden: false
      }
    ],
    solution: {
      approach: "Use a stack to keep track of opening brackets and match them with closing brackets.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      code: {
        javascript: `function isValid(s) {
  const stack = [];
  const mapping = { ')': '(', '}': '{', ']': '[' };
  
  for (let char of s) {
    if (mapping[char]) {
      const topElement = stack.pop();
      if (topElement !== mapping[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`
      }
    },
    hints: [
      "Think about using a stack data structure.",
      "What happens when you encounter a closing bracket?",
      "Consider the order of brackets."
    ],
    points: 10,
    timeLimit: 20
  },
  // Stack Questions
  {
    title: "Implement Stack using Queues",
    description: "Implement a last-in-first-out (LIFO) stack using only two queues.",
    difficulty: "medium",
    category: "stack",
    tags: ["stack", "queue", "design"],
    examples: [
      {
        input: "push(1), push(2), top(), pop(), empty()",
        output: "[null, null, 2, 1, false]",
        explanation: "Stack operations with expected outputs."
      }
    ],
    constraints: [
      "1 <= x <= 9",
      "At most 100 calls will be made to push, pop, top, and empty.",
      "All the calls to pop and top are valid."
    ],
    testCases: [
      {
        input: "push(1),push(2),top(),pop(),empty()",
        expectedOutput: "[null,null,2,1,false]",
        isHidden: false
      }
    ],
    solution: {
      approach: "Use two queues and always keep the newest element at the front of one queue.",
      timeComplexity: "O(n) for push, O(1) for pop and top",
      spaceComplexity: "O(n)",
      code: {
        javascript: `class MyStack {
  constructor() {
    this.queue1 = [];
    this.queue2 = [];
  }
  
  push(x) {
    this.queue2.push(x);
    
    while (this.queue1.length > 0) {
      this.queue2.push(this.queue1.shift());
    }
    
    [this.queue1, this.queue2] = [this.queue2, this.queue1];
  }
  
  pop() {
    return this.queue1.shift();
  }
  
  top() {
    return this.queue1[0];
  }
  
  empty() {
    return this.queue1.length === 0;
  }
}`
      }
    },
    hints: [
      "Think about how to maintain LIFO order using FIFO queues.",
      "Consider moving elements between queues.",
      "One queue should always have the elements in stack order."
    ],
    points: 20,
    timeLimit: 30
  }
];

async function seedQuestions() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: 'admin@interviewprep.com' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@interviewprep.com',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created');
    }

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert sample questions
    const questions = sampleQuestions.map(q => ({
      ...q,
      createdBy: adminUser._id
    }));

    await Question.insertMany(questions);
    console.log(`Inserted ${questions.length} sample questions`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedQuestions();
