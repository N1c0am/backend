// Mock de servicios y modelos específicos
jest.mock('../services/userServices');

const userController = require('./userController');
const userService = require('../services/userServices');
const mongoose = require('mongoose');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();

    // Mock básico de request y response
    req = {
      user: { id: 'user123', role: 'admin' },
      params: {},
      query: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getUsersByFilter', () => {
    it('should return users with valid filters', async () => {
      req.query = { username: 'test', limit: '10', page: '1' };
      req.user.role = 'admin';

      userService.getUsersByFilter.mockResolvedValue({
        data: [{ id: '1', username: 'test' }],
        total: 1
      });

      await userController.getUsersByFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          total: 1
        })
      );
    });

    it('should deny access for unauthorized roles', async () => {
      req.user.role = 'guest';

      await userController.getUsersByFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Access denied. Unauthorized role.'
      });
    });

    it('should handle server errors', async () => {
      req.user.role = 'admin';
      userService.getUsersByFilter.mockRejectedValue(new Error('DB Error'));

      await userController.getUsersByFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Server error while filtering users'
        })
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when ID is valid', async () => {
      req.params.id = 'valid-id';
      req.user = { id: 'user123', role: 'superadmin' };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      userService.getUserById.mockResolvedValue({
        id: 'valid-id',
        username: 'testuser'
      });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser'
        })
      );
    });

    it('should return 400 for invalid ID format', async () => {
      req.params.id = 'invalid-id';
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid ID' });
    });

    it('should deny access when user tries to access another user', async () => {
      req.params.id = 'other-user-id';
      req.user = { id: 'user123', role: 'user' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Access denied.' });
    });

    it('should return 404 when user not found', async () => {
      req.params.id = 'valid-id';
      req.user = { id: 'user123', role: 'superadmin' };
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      userService.getUserById.mockRejectedValue(new Error('User not found.'));

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not found.' });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully for superadmin', async () => {
      req.params.id = 'user-id';
      req.body = { username: 'newname' };
      req.user = { id: 'admin123', role: 'superadmin' };

      userService.updateUser.mockResolvedValue({
        id: 'user-id',
        username: 'newname'
      });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'User updated successfully.'
        })
      );
    });

    it('should deny access for regular users updating others', async () => {
      req.params.id = 'other-user-id';
      req.user = { id: 'user123', role: 'user' };

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Access denied to update this user.'
      });
    });

    it('should prevent admin from updating superadmin', async () => {
      req.params.id = 'superadmin-id';
      req.user = { id: 'admin123', role: 'admin' };
      req.body = { username: 'newname' };
      
      // El admin intenta actualizar un usuario diferente
      // Primero falla por la validación de "solo puede actualizarse a sí mismo"
      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Access denied to update this user.'
      });
    });
    
    it('should allow superadmin to update any user', async () => {
      req.params.id = 'user123';
      req.user = { id: 'superadmin123', role: 'superadmin' };
      req.body = { username: 'newname', role: 'admin' };
      
      userService.updateUser.mockResolvedValue({
        id: 'user123',
        username: 'newname',
        role: 'admin'
      });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'User updated successfully.'
        })
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user for superadmin', async () => {
      req.params.id = 'user-to-delete';
      req.user = { id: 'superadmin123', role: 'superadmin' };

      userService.deleteUser.mockResolvedValue({
        id: 'user-to-delete',
        username: 'deleted'
      });

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'User deleted successfully.'
        })
      );
    });

    it('should deny access for non-superadmin', async () => {
      req.user = { id: 'admin123', role: 'admin' };

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Only superadmins can delete users.'
      });
    });

    it('should prevent user from deleting themselves', async () => {
      req.params.id = 'superadmin123';
      req.user = { id: 'superadmin123', role: 'superadmin' };

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'You cannot delete your own account.'
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      req.user = { id: 'user123' };
      req.body = {
        currentPassword: 'oldpass',
        newPassword: 'NewPass123!'
      };

      userService.getUserById.mockResolvedValue({ id: 'user123' });
      userService.comparePassword.mockResolvedValue(true);
      userService.updatePassword.mockResolvedValue(true);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Password changed successfully.'
      });
    });

    it('should return 400 when passwords are missing', async () => {
      req.user = { id: 'user123' };
      req.body = { currentPassword: 'oldpass' }; // newPassword missing

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'You must provide the current password and the new password.'
      });
    });

    it('should return 400 when current password is incorrect', async () => {
      req.user = { id: 'user123' };
      req.body = {
        currentPassword: 'wrongpass',
        newPassword: 'NewPass123!'
      };

      userService.getUserById.mockResolvedValue({ id: 'user123' });
      userService.comparePassword.mockResolvedValue(false);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Current password is incorrect.'
      });
    });
  });

  describe('firstLoginWithoutProtection', () => {
    it('should update first login status', async () => {
      req.params.id = 'user123';
      req.body = { status: false };

      userService.FirstLoginStatus.mockResolvedValue({
        id: 'user123',
        firstLogin: false
      });

      await userController.firstLoginWithoutProtection(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'First Login updated successfully'
        })
      );
    });

    it('should return 404 when user not found', async () => {
      req.params.id = 'nonexistent';
      req.body = { status: false };

      userService.FirstLoginStatus.mockResolvedValue(null);

      await userController.firstLoginWithoutProtection(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
    });
  });
});