const mockCreate = jest.fn()

jest.mock("~airtable/bases", () => ({
  paymentsAirbase: () => {
    return {create: mockCreate}
  }
}))

const { createDonorPayment } = require("./donorPayments")
const { donorPaymentsFields } = require("./donorPaymentsSchema");

const { paymentsAirbase } = require('~airtable/bases')

describe('createDonorPayment', () => {
  const params ={
    [donorPaymentsFields.amount]: 'some test amount',
    [donorPaymentsFields.status]: 'some test status'
  }

  describe('on a successful Airtable call', () => {

    beforeEach(() => {
      mockCreate.mockResolvedValue('value')
    })
    
    test('it creates a donor payment record with the given fields', async () => {
      const result = await createDonorPayment(params);
      
      expect(paymentsAirbase().create).toHaveBeenCalledWith([{fields: params}])
      expect(result).toEqual(['value', null])
    })
  })

  describe('on an unsuccessful Airtable call', () => {

    beforeEach(() => {
      mockCreate.mockRejectedValue('error')
    })
    
    test('it creates a donor payment record with the given fields', async () => {
      const result = await createDonorPayment(params);
      
      expect(paymentsAirbase().create).toHaveBeenCalledWith([{fields: params}])
      expect(result).toEqual([null, 'error'])
    })
  })
})