const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

// POST submit (student)
router.post('/', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'student') return res.status(403).json({msg:'Forbidden'});
    const { assignmentId, answer } = req.body;
    if(!assignmentId || !answer) return res.status(400).json({msg:'assignmentId and answer required'});
    const a = await Assignment.findById(assignmentId);
    if(!a) return res.status(404).json({msg:'Assignment not found'});
    if(a.status !== 'Published') return res.status(400).json({msg:'Assignment not open for submissions'});
    if(a.dueDate && new Date() > new Date(a.dueDate)) return res.status(400).json({msg:'Past due date'});
    const exists = await Submission.findOne({ assignmentId, studentId: req.user.id });
    if(exists) return res.status(400).json({msg:'Already submitted'});
    const s = new Submission({ assignmentId, studentId: req.user.id, answer });
    await s.save();
    res.json(s);
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

// GET my submission for an assignment (student)
router.get('/mine/:assignmentId', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'student') return res.status(403).json({msg:'Forbidden'});
    const s = await Submission.findOne({ assignmentId: req.params.assignmentId, studentId: req.user.id });
    res.json(s);
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

// PUT mark reviewed (teacher)
router.put('/:id/review', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'teacher') return res.status(403).json({msg:'Forbidden'});
    const s = await Submission.findById(req.params.id);
    if(!s) return res.status(404).json({msg:'Not found'});
    s.reviewed = true;
    await s.save();
    res.json(s);
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

module.exports = router;
