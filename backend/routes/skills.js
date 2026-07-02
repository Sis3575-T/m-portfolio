const router = require('express').Router();
const {
  getSkills, getAllSkills, getSkillById, createSkill, updateSkill, deleteSkill, reorderSkills,
} = require('../controllers/skillController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/public', getSkills);
router.get('/all', protect, getAllSkills);
router.get('/:id', protect, getSkillById);
router.post('/', protect, adminOnly, upload.single('icon'), createSkill);
router.put('/:id', protect, adminOnly, upload.single('icon'), updateSkill);
router.delete('/:id', protect, adminOnly, deleteSkill);
router.put('/reorder/all', protect, adminOnly, reorderSkills);

module.exports = router;
