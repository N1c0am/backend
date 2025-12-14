// Mock completo de mongoose ANTES de que cualquier módulo lo importe
jest.mock('mongoose', () => {
  // Mock del Schema con todos sus métodos
  const mockSchema = function(definition) {
    this.definition = definition;
    this.virtuals = {};
    this.methods = {};
    this.statics = {};
    
    return this;
  };
  
  // Métodos del Schema
  mockSchema.prototype.virtual = function(name) {
    const self = this;
    return {
      get: function(fn) {
        self.virtuals[name] = { get: fn };
        return this;
      },
      set: function(fn) {
        if (!self.virtuals[name]) self.virtuals[name] = {};
        self.virtuals[name].set = fn;
        return this;
      }
    };
  };
  
  mockSchema.prototype.pre = jest.fn(function(event, fn) {
    return this;
  });
  
  mockSchema.prototype.post = jest.fn(function(event, fn) {
    return this;
  });
  
  mockSchema.prototype.method = jest.fn(function(name, fn) {
    this.methods[name] = fn;
    return this;
  });
  
  mockSchema.prototype.static = jest.fn(function(name, fn) {
    this.statics[name] = fn;
    return this;
  });
  
  mockSchema.prototype.index = jest.fn(function() {
    return this;
  });
  
  mockSchema.prototype.plugin = jest.fn(function() {
    return this;
  });
  
  mockSchema.prototype.set = jest.fn(function(key, value) {
    this[key] = value;
    return this;
  });
  
  mockSchema.prototype.get = jest.fn(function(key) {
    return this[key];
  });
  
  // Schema.Types
  mockSchema.Types = {
    ObjectId: 'ObjectId',
    String: 'String',
    Number: 'Number',
    Date: 'Date',
    Boolean: 'Boolean',
    Mixed: 'Mixed'
  };
  
  // Mock del modelo
  const mockModel = jest.fn().mockImplementation(() => {
    return {
      save: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      deleteOne: jest.fn().mockResolvedValue({})
    };
  });
  
  // Métodos estáticos del modelo
  mockModel.find = jest.fn().mockReturnThis();
  mockModel.findById = jest.fn().mockReturnThis();
  mockModel.findOne = jest.fn().mockReturnThis();
  mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
  mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
  mockModel.create = jest.fn().mockResolvedValue({});
  mockModel.updateOne = jest.fn().mockResolvedValue({});
  mockModel.deleteOne = jest.fn().mockResolvedValue({});
  mockModel.countDocuments = jest.fn().mockResolvedValue(0);
  mockModel.exec = jest.fn().mockResolvedValue({});
  mockModel.lean = jest.fn().mockReturnThis();
  mockModel.select = jest.fn().mockReturnThis();
  mockModel.populate = jest.fn().mockReturnThis();
  mockModel.sort = jest.fn().mockReturnThis();
  mockModel.limit = jest.fn().mockReturnThis();
  mockModel.skip = jest.fn().mockReturnThis();
  
  return {
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      on: jest.fn(),
      once: jest.fn(),
      close: jest.fn().mockResolvedValue({}),
      readyState: 1
    },
    Schema: mockSchema,
    model: jest.fn(() => mockModel),
    Types: {
      ObjectId: {
        isValid: jest.fn().mockReturnValue(true)
      }
    }
  };
});

// Mock de Sentry globalmente
jest.mock('./instrument', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  captureEvent: jest.fn()
}));

// Mock de validaciones
jest.mock('./validations/userSchema', () => ({
  updateUserSchema: {
    validate: jest.fn().mockReturnValue({ error: null })
  },
  createUserSchema: {
    validate: jest.fn().mockReturnValue({ error: null })
  }
}));

// Limpieza después de todos los tests
afterAll(async () => {
  // Espera para que se cierren las operaciones asíncronas
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Silenciar console.error y console.log durante los tests
global.console = {
  ...console,
  error: jest.fn(), // Silencia console.error
  log: jest.fn(),   // Silencia console.log
  warn: jest.fn(),  // Silencia console.warn
};