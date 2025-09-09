// Quick test to check if projects exist in the database
import { getCollection } from './lib/db';

async function testProjects() {
  try {
    console.log('🔍 Checking projects in database...');
    
    const projectsCollection = await getCollection('projects');
    
    // Count all projects
    const totalProjects = await projectsCollection.countDocuments();
    console.log('Total projects in database:', totalProjects);
    
    // Count active projects
    const activeProjects = await projectsCollection.countDocuments({ 
      status: { $in: ['active', 'funded'] } 
    });
    console.log('Active/funded projects:', activeProjects);
    
    // Get a sample of projects
    const sampleProjects = await projectsCollection
      .find({})
      .limit(5)
      .toArray();
    
    console.log('Sample projects:');
    sampleProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title || 'No title'} - Status: ${project.status || 'No status'}`);
    });
    
    // Check if we need to seed data
    if (totalProjects === 0) {
      console.log('⚠️ No projects found! You may need to seed the database.');
    }
    
  } catch (error) {
    console.error('❌ Error checking projects:', error);
  }
}

testProjects();
