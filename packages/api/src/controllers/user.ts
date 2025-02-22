import User from '@/models/user';

import type { ObjectId } from '@/models';

export function findUserById(id: string) {
  return User.findById(id);
}

export function findUserByEmail(email: string) {
  return User.findOne({ email });
}

export async function findUserByEmailInTeam(
  email: string,
  team: string | ObjectId,
) {
  return User.findOne({ email, team });
}

export function findUsersByTeam(team: string | ObjectId) {
  return User.find({ team }).sort({ createdAt: 1 });
}
