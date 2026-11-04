import * as usersDao from "../dao/users.dao.js";

export async function getByEmail(email) {
  return usersDao.getByEmail(email);
}

export async function create(userData) {
  return usersDao.create(userData);
}