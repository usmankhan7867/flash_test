const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const addressController = require('../controllers/addresses');

router.post('/upload-csv', upload.single('file'), addressController.uploadCSV);
router.post('/add-address', addressController.updateAddress);
router.post('/get-address-details', addressController.getAddressDetails);
router.post('/holder-addresses', addressController.getHolderAddresses);
router.get('/holders-data', addressController.getAddressCSV)

module.exports = router;
