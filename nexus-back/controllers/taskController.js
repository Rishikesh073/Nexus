// controllers/taskController.js
const db = require('../config/db');

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const newTask = req.body;
    const docRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a task (e.g., changing status from 'todo' to 'done')
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const taskRef = db.collection('tasks').doc(id);
    await taskRef.update(updates);
    
    res.status(200).json({ message: 'Task updated successfully', id, ...updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask };