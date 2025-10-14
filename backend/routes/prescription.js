// backend/routes/prescriptions.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/prescriptionController');

router.post('/', auth, ctrl.create);       // create prescription (doctor)
router.get('/me', auth, ctrl.getForUser);  // list prescriptions for current user

module.exports = router;
