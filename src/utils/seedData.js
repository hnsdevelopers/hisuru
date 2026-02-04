import { supabase } from '../lib/supabase';

export const seedTestData = async (userId) => {
  if (!userId) return;
  
  // Seed tasks
  const tasks = [
    { title: 'Complete project proposal', status: 'completed', priority: 'high', category: 'Work', estimated_hours: 4 },
    { title: 'Team meeting preparation', status: 'in_progress', priority: 'medium', category: 'Work' },
    { title: 'Update documentation', status: 'pending', priority: 'low', category: 'Work' },
    // Add more...
  ];

  for (const task of tasks) {
    await supabase.from('tasks').insert([{ user_id: userId, ...task }]);
  }

  // Seed meetings
  // Seed expenses
  // Seed performance metrics
};