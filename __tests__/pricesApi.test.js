const axios = require('axios');
const {getArrayOfPrices} = require('../pricesApi')

describe('API Tests', () => {
    
    it('should return 200 status code', async () => {
        const response = await getArrayOfPrices();
        console.log('Response status:', response.status);
        expect(response.status).toBe(200);
    });

    it('should return the correct structure', async () => {
        try {
            const response = await getArrayOfPrices();
            //console.log('Response Data:', response.data); 
            const data = response.data;

            expect(Array.isArray(data)).toBe(true);
            data.forEach(entry => {
                expect(entry).toHaveProperty('_id');
                expect(entry).toHaveProperty('date');
                expect(entry).toHaveProperty('__v');
                expect(entry).toHaveProperty('hourlyData');
                expect(Array.isArray(entry.hourlyData)).toBe(true);
                entry.hourlyData.forEach(hourlyEntry => {
                    expect(hourlyEntry).toHaveProperty('data');
                    expect(hourlyEntry).toHaveProperty('time');
                    expect(hourlyEntry).toHaveProperty('_id');
                    expect(hourlyEntry.data).toHaveProperty('eur');
                    expect(hourlyEntry.data).toHaveProperty('bgn');
                    expect(hourlyEntry.data).toHaveProperty('volume');
                });
            });
        } catch (error) {
            console.error('Error during request:', error);
            throw error; 
        }
    });
    
    it('should contain valid data types', async () => {
        const response = await getArrayOfPrices();
        const data = response.data;
    
        data.forEach(entry => {
            expect(typeof entry._id).toBe('string');
            expect(typeof entry.date).toBe('string');
            expect(typeof entry.__v).toBe('number');
            entry.hourlyData.forEach(hourlyEntry => {
                expect(typeof hourlyEntry.time).toBe('string');
                expect(typeof hourlyEntry._id).toBe('string');
                expect(typeof hourlyEntry.data.eur).toBe('number');
                expect(typeof hourlyEntry.data.bgn).toBe('number');
                expect(typeof hourlyEntry.data.volume).toBe('number');
            });
        });
    });

    it('should not return duplicate entries', async () => {
        const response = await getArrayOfPrices();
        const data = response.data;
        const uniqueEntries = new Set(data.map(entry => entry._id));
        expect(uniqueEntries.size).toBe(data.length);
    });

    it('should return correct data for a specific hour entry', async () => {
        const response = await getArrayOfPrices();
        const data = response.data;
        const specificEntry = data.find(entry => entry.hourlyData.some(hourly => hourly.time === '00:00:00'));
        if (specificEntry) {
            const hourlyData = specificEntry.hourlyData.find(hourly => hourly.time === '00:00:00');
            expect(hourlyData.data).toHaveProperty('eur');
            expect(hourlyData.data).toHaveProperty('bgn');
            expect(hourlyData.data).toHaveProperty('volume');
        } else {
            throw new Error('Specific hour entry not found');
        }
    });

    it('should return error for invalid date format', async () => {
        try {
            await getArrayOfPrices();
        } catch (error) {
            console.error('Error:', error.response);
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('message');
        }
    });

    it('should return consistent data across multiple requests', async () => {
        const responses = await Promise.all([
            getArrayOfPrices(),
            getArrayOfPrices(),
            getArrayOfPrices()
        ]);
    
        const [data1, data2, data3] = responses.map(response => response.data);
    
        expect(data1).toEqual(data2);
        expect(data2).toEqual(data3);
    });

    it('should calculate BGN price correctly based on the EUR price', async () => {
        try {
            const response = await getArrayOfPrices();
            const data = response.data;

            data.forEach(entry => {
                entry.hourlyData.forEach(hourlyEntry => {
                    const eur = hourlyEntry.data.eur;
                    const bgn = hourlyEntry.data.bgn;

                    const expectedBgn = eur * 1.95583;

                    //console.log('expectedBgn:', expectedBgn);

                    expect(bgn).toBeCloseTo(expectedBgn, 2); 
                });
            });
        } catch (error) {
            console.error('Error during request:', error);
            throw error; 
        }
    });

},30000);