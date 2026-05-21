import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/buysell_tkmce';

const singleSectionDepts = new Set([
  'Chemical Engineering',
  'Electrical & Computer Engineering',
  'Architecture',
  'Computer Science & Engineering (AI)',
  'MCA'
]);

const noSectionDepts = new Set([
  'MTech'
]);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  
  const usersCollection = mongoose.connection.db.collection('users');
  const users = await usersCollection.find({}).toArray();
  
  let updatedCount = 0;
  for (const user of users) {
    let targetSection = user.section;
    
    if (noSectionDepts.has(user.department)) {
      targetSection = 'None';
    } else if (singleSectionDepts.has(user.department)) {
      targetSection = 'A';
    } else if (!user.section || user.section === 'None') {
      // If it is a multi-section department but section is unassigned/None, default it to 'A' or leave it to be updated
      // Let's set it to 'A' for existing test accounts so they have a valid section for broker routing.
      targetSection = 'A';
    }
    
    if (targetSection !== user.section) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { section: targetSection } }
      );
      console.log(`Updated section for ${user.name} (${user.email}): "${user.section}" -> "${targetSection}"`);
      updatedCount++;
    }
  }
  
  console.log(`Section migration completed. Updated ${updatedCount} users.`);
  await mongoose.disconnect();
}

run().catch(console.error);
