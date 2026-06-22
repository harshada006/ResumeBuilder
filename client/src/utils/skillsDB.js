const skillsDB = {
  'software engineer': [
    'JavaScript', 'TypeScript', 'React.js', 'Node.js', 
    'Python', 'SQL', 'Git', 'REST APIs', 
    'Docker', 'AWS', 'Data Structures', 'System Design'
  ],
  'frontend developer': [
    'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 
    'React.js', 'Next.js', 'Tailwind CSS', 'Redux', 
    'REST APIs', 'Git', 'Webpack', 'UI/UX Design'
  ],
  'backend developer': [
    'Node.js', 'Express.js', 'Python', 'Django', 
    'Java', 'Spring Boot', 'SQL', 'MongoDB', 
    'REST APIs', 'Docker', 'AWS', 'Microservices'
  ],
  'full stack developer': [
    'React.js', 'Node.js', 'Express.js', 'MongoDB', 
    'JavaScript', 'TypeScript', 'Python', 'SQL', 
    'Git', 'Docker', 'AWS', 'REST APIs'
  ],
  'data scientist': [
    'Python', 'R', 'SQL', 'Machine Learning', 
    'Deep Learning', 'Pandas', 'NumPy', 'Scikit-learn', 
    'TensorFlow', 'Data Visualization', 'Statistics', 'Tableau'
  ],
  'product manager': [
    'Product Strategy', 'Agile Methodology', 'Scrum', 'User Research', 
    'Roadmapping', 'Jira', 'Data Analytics', 'A/B Testing', 
    'Product Lifecycle', 'Wireframing', 'SQL', 'Cross-functional Leadership'
  ],
  'ui/ux designer': [
    'Figma', 'Adobe XD', 'Sketch', 'Wireframing', 
    'Prototyping', 'User Research', 'Information Architecture', 'Visual Design', 
    'Interaction Design', 'Usability Testing', 'HTML/CSS', 'Design Systems'
  ],
  'project manager': [
    'Project Planning', 'Agile & Scrum', 'Risk Management', 'Resource Allocation', 
    'MS Project', 'Jira', 'Budgeting', 'Stakeholder Communication', 
    'SDLC', 'Team Leadership', 'PMP', 'Time Management'
  ],
  'marketing manager': [
    'Digital Marketing', 'SEO', 'SEM', 'Content Strategy', 
    'Social Media Marketing', 'Google Analytics', 'Email Campaigns', 'Brand Management', 
    'A/B Testing', 'Copywriting', 'Budget Management', 'Market Research'
  ],
  'sales executive': [
    'Lead Generation', 'Sales Negotiation', 'CRM (Salesforce)', 'Account Management', 
    'Cold Calling', 'B2B Sales', 'Presentation Skills', 'Market Expansion', 
    'Closing Deals', 'Customer Relations', 'Pipeline Management', 'Product Demos'
  ]
};

export const getSuggestedSkills = (profession) => {
  if (!profession) return [];
  const normalized = profession.toLowerCase().trim();
  
  // Find closest match
  for (const key in skillsDB) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return skillsDB[key];
    }
  }
  
  // Default general skills if no match
  return [
    'Communication', 'Teamwork', 'Problem Solving', 'Time Management', 
    'Adaptability', 'Leadership', 'Critical Thinking', 'Work Ethic'
  ];
};

export default skillsDB;
