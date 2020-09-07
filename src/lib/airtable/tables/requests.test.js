const mockDestroyFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  airbase: (_name) => ({
    destroy: mockDestroyFn,
  }),
}));

const { deleteRequest } = require('./requests.js');

describe('deleteRequest', () => {
  describe('given an existing ID', () => {
    test('it sends a delete request to Airtable', async () => {
      mockDestroyFn.mockResolvedValue([{id: 'some-arbitrary-id'}]);
      
      const id = 'some-arbitrary-id';
      
      const result = await deleteRequest(id);
      
      expect(mockDestroyFn).toHaveBeenCalledWith([id]);
      
      expect(result[0].id).toEqual(id);
      expect(result[1]).toEqual(null);
    });
  });

  describe('given a nonexistent ID', () => {
    beforeEach(() => {
      mockDestroyFn.mockRejectedValue('an-error');      
    });
	  
    test('it returns an error', async () => {
      const id = 'another-id';

      const result = await deleteRequest(id);

      expect(mockDestroyFn).toHaveBeenCalledWith([id]);

      expect(result[0]).toEqual(null);
      expect(result[1]).toEqual('an-error');
    });
  });
});
