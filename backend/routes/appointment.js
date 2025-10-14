// backend/routes/appointments.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/appointmentController');

router.post('/', auth, ctrl.create);              // create appointment
router.get('/me', auth, ctrl.listForUser);        // list for current user
router.patch('/:id/status', auth, ctrl.updateStatus); // update status

module.exports = router;
