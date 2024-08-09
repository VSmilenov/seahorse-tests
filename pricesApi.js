const axios = require('axios');
const baseUrl = 'https://seahorse-app-ehbvv.ondigitalocean.app/prices';


async function getArrayOfPrices() {

    try {
        const response = await axios.get(baseUrl);
        return response;

    } catch (error) {
        console.error(error);
    };

};

module.exports = {
    getArrayOfPrices
};