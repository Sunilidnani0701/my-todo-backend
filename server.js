const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with Debugging
console.log('🔧 Attempting to connect to MongoDB...');
console.log('Connection string present:', process.env.MONGODB_URI ? 'YES' : 'NO');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB database!');
})
.catch((error) => {
  console.log('❌ MongoDB connection failed!');
  console.log('Error name:', error.name);
  console.log('Error message:', error.message);
  console.log('💡 Troubleshooting tips:');
  console.log('1. Check if password in MONGODB_URI is correct');
  console.log('2. Make sure Network Access allows 0.0.0.0/0 in MongoDB Atlas');
  console.log('3. Wait 2-3 minutes after creating database user');
  console.log('4. Check if your IP address has changed');
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.log('📞 MongoDB connection error event:', error.message);
});
db.once('open', () => {
  console.log('✅ MongoDB connection opened!');
});

// Todo Schema (like a blueprint for our data)
const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'other'
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Todo Model
const Todo = mongoose.model('Todo', todoSchema);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to my backend API with MongoDB!',
    timestamp: new Date().toISOString(),
    database: 'MongoDB'
  });
});

// GET all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching todos',
      error: error.message
    });
  }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { task, category } = req.body;
    
    if (!task) {
      return res.status(400).json({
        success: false,
        message: 'Task is required'
      });
    }

    const newTodo = new Todo({
      task,
      category: category || 'other'
    });

    const savedTodo = await newTodo.save();
    
    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: savedTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating todo',
      error: error.message
    });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task, category, completed } = req.body;
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { 
        ...(task !== undefined && { task }),
        ...(category !== undefined && { category }),
        ...(completed !== undefined && { completed })
      },
      { new: true } // Return updated document
    );

    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      message: 'Todo updated successfully',
      data: updatedTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating todo',
      error: error.message
    });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully',
      data: deletedTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting todo',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/todos`);
  console.log(`   POST http://localhost:${PORT}/api/todos`);
  console.log(`   PUT  http://localhost:${PORT}/api/todos/:id`);
  console.log(`   DEL  http://localhost:${PORT}/api/todos/:id`);
  console.log(`🗄️  Database: MongoDB`);
});