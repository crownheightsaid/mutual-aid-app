const mockDestroyFn = jest.fn();
const mockCreateFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  airbase: (_name) => ({
    destroy: mockDestroyFn,
    create: mockCreateFn,
  }),
}));

const { deleteRequest, createRequest } = require('./requests.js');
const { fields } = require('./requestsSchema.js');

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

describe('createRequest', () => {
  describe('given the minimum required fields', () => {
    test('creates and returns a request with defaults', async () => {
      mockCreateFn.mockResolvedValue('the created record');
      
      const result = await createRequest({
	message: 'some message',
	source: 'the source'
      });
      
      expect(mockCreateFn).toHaveBeenCalledWith({
	[fields.message]: 'some message',
	[fields.type]: 'the source',
	[fields.phone]: "",
	[fields.externalId]: "",
	[fields.crossStreetFirst]: "",
	[fields.email]: "",
	[fields.timeSensitivity]:  "",
	[fields.status]: fields.status_options.dispatchNeeded,
      });

      expect(result[0]).toEqual('the created record');
      expect(result[1]).toEqual(null);
    });
  });
});
