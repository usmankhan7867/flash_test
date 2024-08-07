const Address = require('../models/addresses'); // Import the Address model


const parseBalance = (balance) => {
    if (typeof balance === 'string') {
        return parseFloat(balance.replace(/,/g, ''));
    }
    return balance; // Return the number as is if it's already a number
};
// Upload and save CSV addresses
exports.uploadCSV = (req, res) => {
    try {
        // Parse JSON data from the request body
        const results = JSON.parse(req.file.buffer.toString('utf8'));

        results.forEach(async (record) => {
            if (record.HolderAddress && record.Balance) {
                try {
                    await Address.create({
                        holder_address: record.HolderAddress,
                        balance: parseBalance(record.Balance), // Remove commas from balance
                        sol_address: '', // Default value
                        amount: 0 // Default value
                    });
                } catch (err) {
                    console.error('Error saving record: ', record, err);
                }
            } else {
                console.error('Invalid record found: ', record);
            }
        });

        res.status(200).json({ message: 'Addresses saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Invalid JSON data or error parsing JSON.' });
    }
};
//get the holder addresses
exports.getHolderAddresses = async (req, res) => {
    try {
        const { holder_address } = req.body;
        let status;
        const address = await Address.findOne({ holder_address });
        if (!address) {
            status = false;
        }
        else {
            status = true;
        }
        return res.status(200).json({ status })
    } catch (error) {
        return res.status(200).json({ status: 500, error: error.message });
    }
}
// Update sol_address and get_amount
exports.updateAddress = async (req, res) => {
    const { holder_address, sol_address } = req.body;

    try {
        const address = await Address.findOne({ holder_address });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        address.sol_address = sol_address;
        address.amount = (address.balance) * 0.006200;
        const time = Date.now();
        address.date = time;
        await address.save();

        return res.status(200).json({ status: 200, message: `Data saved successfully against this holder  ${holder_address}` });
    } catch (error) {
        return res.status(200).json({ status: 500, error: error.message });
    }
};

// Retrieve sol_address and get_amount
exports.getAddressDetails = async (req, res) => {
    const { holder_address } = req.body;

    try {
        const address = await Address.findOne({ holder_address });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        return res.status(200).json({ status: 200, message: "Record against he holder", address });
    } catch (error) {
        return res.status(200).json({ status: 500, error: error.message });
    }
};

//save the data in .csv
const { createObjectCsvStringifier } = require('csv-writer'); // Import the CSV writer

// Endpoint to retrieve addresses with sol_address and return as a CSV file
// exports.getAddressCSV = async (req, res) => {
//     const { month, year } = req.query; // Expect month and year as query parameters

//     try {
//         // Build the query to match addresses with sol_address
//         const query = { sol_address: { $ne: '' } };

//         // Add date filtering if month and year are provided
//         if (month && year) {
//             const startDate = new Date(year, month - 1, 1); // First day of the month
//             const endDate = new Date(year, month, 0); // Last day of the month
//             query.date = { $gte: startDate, $lt: endDate };
//         }

//         // Fetch addresses from the database
//         const addresses = await Address.find(query);

//         // Define the CSV headers
//         const csvStringifier = createObjectCsvStringifier({
//             header: [
//                 { id: 'holder_address', title: 'Holder Address' },
//                 { id: 'balance', title: 'Balance' },
//                 { id: 'sol_address', title: 'Sol Address' },
//                 { id: 'amount', title: 'Amount' },
//                 { id: 'date', title: 'Date' }
//             ]
//         });

//         // Convert address data to CSV format
//         const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(addresses.map(address => ({
//             holder_address: address.holder_address,
//             balance: address.balance,
//             sol_address: address.sol_address,
//             amount: address.amount,
//             date: new Date(address.date).toISOString() // Convert date to ISO string
//         })));

//         // Set response headers to indicate a file download
//         res.setHeader('Content-Type', 'text/csv');
//         res.setHeader('Content-Disposition', 'attachment; filename=addresses.csv');

//         // Send the CSV file as the response
//         res.status(200).send(csvData);
//     } catch (error) {
//         res.status(500).json({ status: 500, error: error.message });
//     }
// };


//csv 
exports.getAddressCSV = async (req, res) => {
    try {
        // Fetch all addresses from the database
        const addresses = await Address.find();

        // Define the CSV headers
        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'holder_address', title: 'Holder Address' },
                { id: 'balance', title: 'Balance' },
                { id: 'amount', title: 'Pending Balance Update' },
                { id: 'sol_address', title: 'Solana Address' }
            ]
        });

        // Convert address data to CSV format
        const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(addresses.map(address => ({
            holder_address: address.holder_address,
            balance: address.balance,
            amount: address.amount || 'no', // Show 'no' if no airdrop is done
            sol_address: address.sol_address ? address.sol_address : '' // Leave empty if no airdrop is done
        })));

        // Set response headers to indicate a file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=addresses.csv');

        // Send the CSV file as the response
        res.status(200).send(csvData);
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message });
    }
};
