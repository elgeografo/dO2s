import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import editProfile from './edit-profile';
import rateLimit from '../../../modules/rate-limit';

Meteor.methods({
  'users.changeRole': function usersChangeRole(update) {
    check(update, { _id: String, role: String });

    if (Roles.userIsInRole(this.userId, ['admin'])) {
      Roles.setUserRoles(update._id, update.role);
    } else {
      throw new Meteor.Error('500', 'Ha! Nice try, slick.');
    }
  },

  'users.sendVerificationEmail': function sendVerificationEmail() {
    return Accounts.sendVerificationEmail(this.userId);
  },

  'users.editProfile': function usersEditProfile(profile) {
    check(profile, {
      emailAddress: String,
      profile: {
        name: {
          first: String,
          last: String,
        },
      },
    });

    return editProfile({ userId: this.userId, profile })
    .then(response => response)
    .catch((exception) => {
      throw new Meteor.Error('500', exception);
    });
  },
  'users.softDelete': function usersSoftDelete(userId) {
    check(userId, String);
    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        Meteor.users.update(userId, { $set: { deleted: (new Date()).toISOString() } });
      } else {
        throw new Meteor.Error('500', 'Ha! Nice try, slick.');
      }
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'users.restore': function projectsRestore(userId) {
    check(userId, String);
    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        Meteor.users.update(userId, { $set: { deleted: 'no' } });
      } else {
        throw new Meteor.Error('500', 'Ha! Nice try, slick.');
      }
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'users.hardDelete': function usersHardDelete(userId) {
    check(userId, String);
    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        Meteor.users.remove(userId);
      } else {
        throw new Meteor.Error('500', 'Ha! Nice try, slick.');
      }
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'users.editProfile',
    'users.sendVerificationEmail',
    'users.changeRole',
    'users.softDelete',
    'users.restore',
    'users.hardDelete',
  ],
  limit: 5,
  timeRange: 1000,
});
