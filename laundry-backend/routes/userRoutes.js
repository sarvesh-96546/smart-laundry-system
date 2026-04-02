const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const orderController = require('../controllers/orderController');
const machineController = require('../controllers/machineController');
const statsController = require('../controllers/statsController');
const queryController = require('../controllers/queryController');
const { verifyToken, isAdmin, isStaff } = require('../middleware/auth');

router.post('/orders', [verifyToken], orderController.createOrder); 
router.get('/orders', [verifyToken], orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', [verifyToken, isStaff], orderController.updateOrderStatus);
router.post('/queries', queryController.createQuery);
router.get('/machinery', machineController.getMachinery);
router.post('/machines/:machine_id/start', [verifyToken, isStaff], machineController.startMachine);
router.post('/machines/:machine_id/stop', [verifyToken, isStaff], machineController.stopMachine);
router.get('/stats', statsController.getStats);
router.get('/customers', [verifyToken, isStaff], userController.getCustomers);
router.get('/users', [verifyToken, isAdmin], userController.getUsers);
router.get('/users/:id', [verifyToken], userController.getUserById);
router.put('/users/:id', [verifyToken], userController.updateUser);
router.delete('/users/:id', [verifyToken, isAdmin], userController.deleteUser);

module.exports = router;
