const users = [];

const addUser = ({ id, username, room }) => {
  //Clean the data

  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: 'username and room required',
    };
  }

  //Check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  //Validate username
  if (existingUser) {
    return {
      error: 'User is in the room',
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1);
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom;
};

export { addUser, removeUser, getUsersInRoom, getUser };
