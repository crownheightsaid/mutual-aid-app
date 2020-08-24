const mockCreate = jest.fn().mockResolvedValue('value')

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
  
  test('it creates a donor payment record with the given fields', async () => {
    const result = await createDonorPayment(params);

    expect(paymentsAirbase().create).toHaveBeenCalledWith([{fields: params}])
    expect(result).toEqual(['value', null])
  })
})