const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

// GET /api/assignments?status=&page=&limit=   (teachers can see all; students get filtered by Published on frontend too)
router.get('/', auth, async (req,res)=>{
  try{
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if(status) query.status = status;
    const skip = (page-1) * limit;
    const total = await Assignment.countDocuments(query);
    const items = await Assignment.find(query).populate('createdBy','name email').sort({createdAt:-1}).skip(Number(skip)).limit(Number(limit));
    res.json({ items, total });
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

// POST create (teacher only)
router.post('/', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'teacher') return res.status(403).json({msg:'Forbidden'});
    const { title, description, dueDate } = req.body;
    if(!title) return res.status(400).json({msg:'Title required'});
    const a = new Assignment({ title, description, dueDate, createdBy: req.user.id });
    await a.save();
    res.json(a);
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

// PUT update (only Draft)
router.put('/:id', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'teacher') return res.status(403).json({msg:'Forbidden'});
    const a = await Assignment.findById(req.params.id);
    if(!a) return res.status(404).json({msg:'Not found'});
    if(a.status !== 'Draft') return res.status(400).json({msg:'Can only edit Draft'});
    const { title, description, dueDate } = req.body;
    a.title = title ?? a.title;
    a.description = description ?? a.description;
    a.dueDate = dueDate ?? a.dueDate;
    await a.save();
    res.json(a);
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

// DELETE (only Draft)
router.delete('/:id', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'teacher') return res.status(403).json({msg:'Forbidden'});
    const a = await Assignment.findById(req.params.id);
    if(!a) return res.status(404).json({msg:'Not found'});
    if(a.status !== 'Draft') return res.status(400).json({msg:'Can only delete Draft'});
    await a.remove();
    res.json({msg:'Deleted'});
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

// PUT status update
// router.put('/:id/status', auth, async (req,res)=>{
//   try{
//     if(req.user.role !== 'teacher') return res.status(403).json({msg:'Forbidden'});
//     const { status } = req.body; // Draft, Published, Completed
//     const a = await Assignment.findById(req.params.id);
//     if(!a) return res.status(404).json({msg:'Not found'});
//     const allowed = { Draft:['Published'], Published:['Completed'], Completed:[] };
//     if(!allowed[a.status].includes(status)) return res.status(400).json({msg:'Invalid transition'});
//     a.status = status;
//     await a.save();
//     res.json(a);
//   }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
// });

// PUT /api/assignments/:id/status
router.put('/:id/status', auth, async (req,res)=>{
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg:'Forbidden' });
    }

    const { status } = req.body;
    const validStatuses = ['Draft','Published','Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ msg:'Assignment not found' });

    const transitions = {
      Draft: ['Published'],
      Published: ['Completed'],
      Completed: []
    };
    if (!transitions[a.status].includes(status)) {
      return res.status(400).json({ msg:`Cannot change from ${a.status} to ${status}` });
    }

    a.status = status;
    await a.save();
    res.json(a);

  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ msg:'Server error' });
  }
});


// GET submissions for assignment (teacher)
router.get('/:id/submissions', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'teacher') return res.status(403).json({msg:'Forbidden'});
    const submissions = await Submission.find({ assignmentId: req.params.id }).populate('studentId','name email').sort({submittedAt:-1});
    res.json(submissions);
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

// GET analytics for teacher (counts)
router.get('/:id/analytics', auth, async (req,res)=>{
  try{
    if(req.user.role !== 'teacher') return res.status(403).json({msg:'Forbidden'});
    const totalSubs = await Submission.countDocuments({ assignmentId: req.params.id });
    const reviewed = await Submission.countDocuments({ assignmentId: req.params.id, reviewed: true });
    res.json({ totalSubs, reviewed });
  }catch(err){ console.error(err); res.status(500).json({msg:'Server error'})}
});

module.exports = router;
